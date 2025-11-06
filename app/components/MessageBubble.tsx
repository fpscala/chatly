import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwnMessage }) => {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
  };

  const textColor = isOwnMessage ? '#FFFFFF' : '#000000';

  return (
    <View
      style={[
        styles.container,
        isOwnMessage ? styles.ownMessage : styles.otherMessage,
      ]}
    >
      {message.imageURL && (
        <TouchableOpacity activeOpacity={0.9}>
          <Image
            source={{ uri: message.imageURL }}
            style={styles.image}
            resizeMode="cover"
          />
        </TouchableOpacity>
      )}
      {message.text && (
        <Text style={[styles.text, { color: textColor }]}>{message.text}</Text>
      )}
      <View style={styles.footer}>
        <Text style={[styles.time, { color: isOwnMessage ? '#E0E0E0' : '#666' }]}>
          {formatTime(message.createdAt)}
        </Text>
        {isOwnMessage && message.read && (
          <Ionicons
            name="checkmark-done"
            size={16}
            color="#4CAF50"
            style={styles.readIcon}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxWidth: '70%',
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
    marginHorizontal: 8,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#6200EE',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8E8E8',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  time: {
    fontSize: 11,
  },
  readIcon: {
    marginLeft: 4,
  },
});

export default MessageBubble;
