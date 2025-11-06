import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { Gender } from '../types';

// Ro'yxatdan o'tish
export const registerUser = async (
  email: string,
  password: string,
  name: string,
  gender: Gender,
  age?: number
): Promise<FirebaseUser> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Qarshi jinsni default filter sifatida o'rnatish
    const defaultShowGender: 'male' | 'female' = gender === 'male' ? 'female' : 'male';

    // Firestore'da foydalanuvchi ma'lumotlarini saqlash
    await setDoc(doc(db, 'users', user.uid), {
      name,
      bio: '',
      gender,
      age: age || null,
      interests: [],
      location: '',
      photoURL: 'https://via.placeholder.com/150',
      isOnline: true,
      lastSeen: serverTimestamp(),
      email: user.email,
      preferences: {
        showGender: defaultShowGender,
        notificationsEnabled: true,
      },
    });

    return user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Tizimga kirish
export const loginUser = async (
  email: string,
  password: string
): Promise<FirebaseUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Tizimdan chiqish
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
};
