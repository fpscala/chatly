import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../firebaseConfig';
import { getUserData, updateUserProfile, updateOnlineStatus } from '../services/firestoreService';
import { logoutUser } from '../services/authService';
import { User } from '../types';

const SettingsScreen: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) return;

    const userData = await getUserData(currentUserId);
    setUser(userData);
    setLoading(false);
  };

  const handleGenderFilterChange = async (filter: 'male' | 'female' | 'all') => {
    if (!user) return;

    try {
      await updateUserProfile(user.id, {
        preferences: {
          ...user.preferences,
          showGender: filter,
        },
      } as Partial<User>);

      setUser({
        ...user,
        preferences: {
          ...user.preferences,
          showGender: filter,
        },
      });

      Alert.alert('Muvaffaqiyatli', 'Sozlamalar saqlandi');
    } catch (error) {
      Alert.alert('Xato', 'Sozlamalarni saqlashda xatolik');
    }
  };

  const handleNotificationsToggle = async (value: boolean) => {
    if (!user) return;

    try {
      await updateUserProfile(user.id, {
        preferences: {
          ...user.preferences,
          notificationsEnabled: value,
        },
      } as Partial<User>);

      setUser({
        ...user,
        preferences: {
          ...user.preferences,
          notificationsEnabled: value,
        },
      });
    } catch (error) {
      Alert.alert('Xato', 'Sozlamalarni saqlashda xatolik');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Chiqish',
      'Tizimdan chiqishni xohlaysizmi?',
      [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: 'Chiqish',
          style: 'destructive',
          onPress: async () => {
            try {
              if (auth.currentUser?.uid) {
                await updateOnlineStatus(auth.currentUser.uid, false);
              }
              await logoutUser();
            } catch (error: any) {
              Alert.alert('Xato', error.message);
            }
          },
        },
      ]
    );
  };

  if (loading || !user) {
    return (
      <View style={styles.container}>
        <Text>Yuklanmoqda...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ko'rsatish filtri</Text>
        <Text style={styles.sectionDesc}>
          Kim bilan suhbatlashishni xohlaysiz?
        </Text>

        <TouchableOpacity
          style={[
            styles.filterOption,
            user.preferences.showGender === 'male' && styles.filterOptionActive,
          ]}
          onPress={() => handleGenderFilterChange('male')}
        >
          <Ionicons name="male" size={24} color={user.preferences.showGender === 'male' ? '#6200EE' : '#666'} />
          <Text style={[
            styles.filterOptionText,
            user.preferences.showGender === 'male' && styles.filterOptionTextActive,
          ]}>
            Faqat erkaklar
          </Text>
          {user.preferences.showGender === 'male' && (
            <Ionicons name="checkmark-circle" size={24} color="#6200EE" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterOption,
            user.preferences.showGender === 'female' && styles.filterOptionActive,
          ]}
          onPress={() => handleGenderFilterChange('female')}
        >
          <Ionicons name="female" size={24} color={user.preferences.showGender === 'female' ? '#6200EE' : '#666'} />
          <Text style={[
            styles.filterOptionText,
            user.preferences.showGender === 'female' && styles.filterOptionTextActive,
          ]}>
            Faqat ayollar
          </Text>
          {user.preferences.showGender === 'female' && (
            <Ionicons name="checkmark-circle" size={24} color="#6200EE" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterOption,
            user.preferences.showGender === 'all' && styles.filterOptionActive,
          ]}
          onPress={() => handleGenderFilterChange('all')}
        >
          <Ionicons name="people" size={24} color={user.preferences.showGender === 'all' ? '#6200EE' : '#666'} />
          <Text style={[
            styles.filterOptionText,
            user.preferences.showGender === 'all' && styles.filterOptionTextActive,
          ]}>
            Hammasi
          </Text>
          {user.preferences.showGender === 'all' && (
            <Ionicons name="checkmark-circle" size={24} color="#6200EE" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bildirishnomalar</Text>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Push bildirishnomalar</Text>
          <Switch
            value={user.preferences.notificationsEnabled}
            onValueChange={handleNotificationsToggle}
            trackColor={{ false: '#E8E8E8', true: '#BB86FC' }}
            thumbColor={user.preferences.notificationsEnabled ? '#6200EE' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#F44336" />
          <Text style={styles.logoutButtonText}>Chiqish</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Chatly v2.0</Text>
        <Text style={styles.footerText}>© 2024</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  sectionDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 12,
  },
  filterOptionActive: {
    backgroundColor: '#E8D5FF',
    borderWidth: 2,
    borderColor: '#6200EE',
  },
  filterOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
  },
  filterOptionTextActive: {
    color: '#6200EE',
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: '#000',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBEE',
    padding: 16,
    borderRadius: 12,
  },
  logoutButtonText: {
    fontSize: 16,
    color: '#F44336',
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});

export default SettingsScreen;
