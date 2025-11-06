import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { User, Message, Chat, Ban } from '../types';

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

// Matn xabari yuborish
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

// Rasm xabari yuborish
export const sendImageMessage = async (
  chatId: string,
  senderId: string,
  imageURL: string
): Promise<void> => {
  try {
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      senderId,
      imageURL,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error sending image message:', error);
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
        imageURL: data.imageURL,
        read: data.read || false,
        createdAt: data.createdAt ? (data.createdAt as Timestamp).toMillis() : Date.now(),
      });
    });
    callback(messages);
  });
};

// Xabarni o'qilgan deb belgilash
export const markMessageAsRead = async (
  chatId: string,
  messageId: string
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'chats', chatId, 'messages', messageId), {
      read: true,
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
  }
};

// Barcha o'qilmagan xabarlarni o'qilgan deb belgilash
export const markAllMessagesAsRead = async (
  chatId: string,
  currentUserId: string
): Promise<void> => {
  try {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(
      messagesRef,
      where('senderId', '!=', currentUserId),
      where('read', '==', false)
    );

    const querySnapshot = await getDocs(q);
    const promises: Promise<void>[] = [];

    querySnapshot.forEach((docSnapshot) => {
      promises.push(markMessageAsRead(chatId, docSnapshot.id));
    });

    await Promise.all(promises);
  } catch (error) {
    console.error('Error marking all messages as read:', error);
  }
};

// Typing holatni yangilash
export const updateTypingStatus = async (
  chatId: string,
  userId: string,
  isTyping: boolean
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'chats', chatId), {
      [`typing.${userId}`]: isTyping,
    });
  } catch (error) {
    console.error('Error updating typing status:', error);
  }
};

// Chat typing holatini real-time kuzatish
export const subscribeToTypingStatus = (
  chatId: string,
  callback: (typing: { [userId: string]: boolean }) => void
) => {
  const chatRef = doc(db, 'chats', chatId);

  return onSnapshot(chatRef, (snapshot) => {
    const data = snapshot.data();
    callback(data?.typing || {});
  });
};

// ========== BAN FUNKSIYALARI ==========

// Foydalanuvchini bloklash
export const banUser = async (
  bannedBy: string,
  bannedUser: string
): Promise<void> => {
  try {
    await addDoc(collection(db, 'bans'), {
      bannedBy,
      bannedUser,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error banning user:', error);
    throw error;
  }
};

// Blokdan chiqarish
export const unbanUser = async (
  bannedBy: string,
  bannedUser: string
): Promise<void> => {
  try {
    const bansRef = collection(db, 'bans');
    const q = query(
      bansRef,
      where('bannedBy', '==', bannedBy),
      where('bannedUser', '==', bannedUser)
    );

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (docSnapshot) => {
      await deleteDoc(doc(db, 'bans', docSnapshot.id));
    });
  } catch (error) {
    console.error('Error unbanning user:', error);
    throw error;
  }
};

// Bloklangan foydalanuvchilar ro'yxati
export const getBannedUsers = async (userId: string): Promise<string[]> => {
  try {
    const bansRef = collection(db, 'bans');
    const q = query(bansRef, where('bannedBy', '==', userId));

    const querySnapshot = await getDocs(q);
    const bannedUserIds: string[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      bannedUserIds.push(data.bannedUser);
    });

    return bannedUserIds;
  } catch (error) {
    console.error('Error getting banned users:', error);
    return [];
  }
};

// Foydalanuvchi bloklangan yoki yo'q tekshirish
export const isUserBanned = async (
  checkingUserId: string,
  targetUserId: string
): Promise<boolean> => {
  try {
    const bansRef = collection(db, 'bans');

    // Ikki tomonlama tekshirish: hech biri boshqasini bloklamagan bo'lishi kerak
    const q1 = query(
      bansRef,
      where('bannedBy', '==', checkingUserId),
      where('bannedUser', '==', targetUserId)
    );

    const q2 = query(
      bansRef,
      where('bannedBy', '==', targetUserId),
      where('bannedUser', '==', checkingUserId)
    );

    const [snapshot1, snapshot2] = await Promise.all([
      getDocs(q1),
      getDocs(q2),
    ]);

    return !snapshot1.empty || !snapshot2.empty;
  } catch (error) {
    console.error('Error checking if user is banned:', error);
    return false;
  }
};

// Gender filter bilan foydalanuvchilarni olish
export const getUsersByGenderFilter = async (
  currentUserId: string,
  genderFilter: 'male' | 'female' | 'all'
): Promise<User[]> => {
  try {
    // Bloklangan foydalanuvchilarni olish
    const bannedUserIds = await getBannedUsers(currentUserId);

    const usersRef = collection(db, 'users');
    let q = query(usersRef);

    // Gender filter qo'llash
    if (genderFilter !== 'all') {
      q = query(usersRef, where('gender', '==', genderFilter));
    }

    const querySnapshot = await getDocs(q);
    const users: User[] = [];

    // Men bloklaganlar va meni bloklaganlar va o'zim filterlash
    for (const docSnapshot of querySnapshot.docs) {
      const userId = docSnapshot.id;

      // O'zimni o'chirish
      if (userId === currentUserId) continue;

      // Bloklangan foydalanuvchilarni o'chirish
      if (bannedUserIds.includes(userId)) continue;

      // Meni bloklagan foydalanuvchilarni tekshirish
      const isBanned = await isUserBanned(currentUserId, userId);
      if (isBanned) continue;

      users.push({ id: userId, ...docSnapshot.data() } as User);
    }

    return users;
  } catch (error) {
    console.error('Error getting users by gender filter:', error);
    return [];
  }
};
