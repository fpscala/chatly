import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { HomeStackParamList, Message } from '../types';
import {
  getOrCreateChat,
  sendMessage,
  subscribeToMessages,
} from '../services/firestoreService';
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
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    initializeChat();
  }, [userId]);

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
      <InputBar onSend={handleSendMessage} />
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
});

export default ChatScreen;
