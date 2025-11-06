import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { RouteProp } from '@react-navigation/native';
import { HomeStackParamList, Message } from '../types';
import {
  getOrCreateChat,
  sendMessage,
  sendImageMessage,
  subscribeToMessages,
} from '../services/firestoreService';
import { uploadChatImage } from '../services/storageService';
import { auth } from '../firebaseConfig';
import MessageBubble from '../components/MessageBubble';
import InputBar from '../components/InputBar';

type ChatScreenRouteProp = RouteProp<HomeStackParamList, 'Chat'>;

interface Props {
  route: ChatScreenRouteProp;
}

const ChatScreen: React.FC<Props> = ({ route }) => {
  const { userId } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    initializeChat();
    requestPermissions();
  }, [userId]);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Ruxsat kerak', 'Rasm yuborish uchun galereyaga ruxsat bering');
    }
  };

  useEffect(() => {
    if (!chatId) return;

    // Xabarlarni real-time kuzatish
    const unsubscribe = subscribeToMessages(chatId, (newMessages) => {
      setMessages(newMessages);
      setLoading(false);
      // Avtomatik scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    return () => unsubscribe();
  }, [chatId]);

  const initializeChat = async () => {
    try {
      const currentUserId = auth.currentUser?.uid;
      if (!currentUserId) return;

      const id = await getOrCreateChat(currentUserId, userId);
      setChatId(id);
    } catch (error) {
      console.error('Error initializing chat:', error);
      setLoading(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!chatId || !auth.currentUser?.uid) return;

    try {
      await sendMessage(chatId, auth.currentUser.uid, text);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSendImage = async () => {
    if (!chatId || !auth.currentUser?.uid) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setUploading(true);
        const imageUri = result.assets[0].uri;

        // Rasmni Firebase Storage'ga yuklash
        const imageURL = await uploadChatImage(auth.currentUser.uid, imageUri);

        // Rasm xabarini yuborish
        await sendImageMessage(chatId, auth.currentUser.uid, imageURL);

        setUploading(false);
      }
    } catch (error) {
      console.error('Error sending image:', error);
      Alert.alert('Xato', 'Rasm yuklashda xatolik yuz berdi');
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
      keyboardVerticalOffset={100}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            isOwnMessage={item.senderId === auth.currentUser?.uid}
          />
        )}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />
      {uploading && (
        <View style={styles.uploadingContainer}>
          <ActivityIndicator size="small" color="#6200EE" />
        </View>
      )}
      <InputBar onSend={handleSendMessage} onSendImage={handleSendImage} />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  messagesList: {
    paddingVertical: 8,
  },
  uploadingContainer: {
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
});

export default ChatScreen;
