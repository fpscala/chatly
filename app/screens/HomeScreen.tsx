import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList, User } from '../types';
import { getAllUsers } from '../services/firestoreService';
import { auth } from '../firebaseConfig';
import UserListItem from '../components/UserListItem';

type HomeScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'UserList'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Foydalanuvchilarni real-time kuzatish
    const unsubscribe = getAllUsers((fetchedUsers) => {
      // Joriy foydalanuvchini ro'yxatdan chiqarish
      const filteredUsers = fetchedUsers.filter(
        (user) => user.id !== auth.currentUser?.uid
      );
      setUsers(filteredUsers);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUserPress = (user: User) => {
    navigation.navigate('Chat', {
      userId: user.id,
      userName: user.name,
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  if (users.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>
          Hozircha boshqa foydalanuvchilar yo'q
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <UserListItem user={item} onPress={() => handleUserPress(item)} />
        )}
      />
    </View>
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
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default HomeScreen;
