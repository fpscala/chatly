import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList, User } from '../types';
import { getUsersByGenderFilter, getUserData } from '../services/firestoreService';
import { auth } from '../firebaseConfig';
import UserListItem from '../components/UserListItem';

type HomeScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'UserList'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [genderFilter, setGenderFilter] = useState<'male' | 'female' | 'all'>('all');

  useEffect(() => {
    loadUsers();
  }, [genderFilter]);

  useEffect(() => {
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) return;

    const userData = await getUserData(currentUserId);
    if (userData && userData.preferences) {
      setGenderFilter(userData.preferences.showGender);
    }
  };

  const loadUsers = async () => {
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) return;

    setLoading(true);
    try {
      const fetchedUsers = await getUsersByGenderFilter(currentUserId, genderFilter);
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

  const toggleGenderFilter = () => {
    if (genderFilter === 'all') {
      setGenderFilter('male');
    } else if (genderFilter === 'male') {
      setGenderFilter('female');
    } else {
      setGenderFilter('all');
    }
  };

  const handleUserPress = (user: User) => {
    navigation.navigate('Chat', {
      userId: user.id,
      userName: user.name,
    });
  };

  const handleUserLongPress = (user: User) => {
    navigation.navigate('UserProfile', { userId: user.id });
  };

  const getFilterIcon = () => {
    switch (genderFilter) {
      case 'male':
        return 'male';
      case 'female':
        return 'female';
      default:
        return 'people';
    }
  };

  const getFilterLabel = () => {
    switch (genderFilter) {
      case 'male':
        return 'Erkaklar';
      case 'female':
        return 'Ayollar';
      default:
        return 'Hammasi';
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.filterButton} onPress={toggleGenderFilter}>
        <Ionicons name={getFilterIcon()} size={20} color="#6200EE" />
        <Text style={styles.filterText}>{getFilterLabel()}</Text>
      </TouchableOpacity>

      {users.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>
            Hozircha foydalanuvchilar yo'q
          </Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <UserListItem
              user={item}
              onPress={() => handleUserPress(item)}
              onLongPress={() => handleUserLongPress(item)}
            />
          )}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
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
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  filterText: {
    fontSize: 16,
    color: '#6200EE',
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default HomeScreen;
