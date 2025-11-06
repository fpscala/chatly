import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { User, Message, Chat } from '../types';

// Foydalanuvchi ma'lumotlarini olish
export const getUserData = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as User;
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

// Barcha foydalanuvchilarni olish
export const getAllUsers = (callback: (users: User[]) => void) => {
  const usersRef = collection(db, 'users');

  return onSnapshot(usersRef, (snapshot) => {
    const users: User[] = [];
    snapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() } as User);
    });
    callback(users);
  });
};

// Foydalanuvchi profilini yangilash
export const updateUserProfile = async (
  userId: string,
  data: Partial<User>
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...data,
      lastSeen: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

// Online holatni yangilash
export const updateOnlineStatus = async (
  userId: string,
  isOnline: boolean
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      isOnline,
      lastSeen: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating online status:', error);
  }
};

// Chat yaratish yoki olish
export const getOrCreateChat = async (
  currentUserId: string,
  otherUserId: string
): Promise<string> => {
  try {
    // Mavjud chatni qidirish
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('members', 'array-contains', currentUserId)
    );

    const querySnapshot = await getDocs(q);
    let chatId = '';

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.members.includes(otherUserId)) {
        chatId = doc.id;
      }
    });

    // Agar chat topilmasa, yangi chat yaratish
    if (!chatId) {
      const newChatRef = await addDoc(collection(db, 'chats'), {
        members: [currentUserId, otherUserId],
        createdAt: serverTimestamp(),
      });
      chatId = newChatRef.id;
    }

    return chatId;
  } catch (error) {
    console.error('Error getting or creating chat:', error);
    throw error;
  }
};

// Xabar yuborish
export const sendMessage = async (
  chatId: string,
  senderId: string,
  text: string
): Promise<void> => {
  try {
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      senderId,
      text,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Xabarlarni real-time olish
export const subscribeToMessages = (
  chatId: string,
  callback: (messages: Message[]) => void
) => {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const messages: Message[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        senderId: data.senderId,
        text: data.text,
        createdAt: data.createdAt ? (data.createdAt as Timestamp).toMillis() : Date.now(),
      });
    });
    callback(messages);
  });
};
