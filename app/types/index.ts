// Foydalanuvchi tipi
export interface User {
  id: string;
  name: string;
  bio: string;
  photoURL: string;
  isOnline: boolean;
  lastSeen: number;
  email: string;
}

// Xabar tipi
export interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: number;
}

// Chat tipi
export interface Chat {
  id: string;
  members: string[];
  lastMessage?: Message;
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
};

export type HomeStackParamList = {
  UserList: undefined;
  Chat: { userId: string; userName: string };
};

export type ProfileStackParamList = {
  ProfileView: undefined;
  EditProfile: undefined;
};
