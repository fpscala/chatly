// Gender tipi
export type Gender = 'male' | 'female';

// Foydalanuvchi tipi
export interface User {
  id: string;
  name: string;
  bio: string;
  gender: Gender;
  age?: number;
  interests?: string[];
  location?: string;
  photoURL: string;
  isOnline: boolean;
  lastSeen: number;
  email: string;
  preferences: {
    showGender: 'male' | 'female' | 'all';
    notificationsEnabled: boolean;
  };
}

// Xabar tipi
export interface Message {
  id: string;
  senderId: string;
  text?: string;
  imageURL?: string;
  createdAt: number;
  read?: boolean; // Read receipt
}

// Chat tipi
export interface Chat {
  id: string;
  members: string[];
  lastMessage?: Message;
  typing?: {
    [userId: string]: boolean; // userId: isTyping
  };
}

// Ban tipi
export interface Ban {
  id: string;
  bannedBy: string;
  bannedUser: string;
  createdAt: number;
}

// Navigation tiplari
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
};

export type HomeStackParamList = {
  UserList: undefined;
  Chat: { userId: string; userName: string };
  UserProfile: { userId: string };
};

export type ProfileStackParamList = {
  ProfileView: undefined;
  EditProfile: undefined;
};

export type SettingsStackParamList = {
  SettingsView: undefined;
};
