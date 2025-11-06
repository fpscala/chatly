import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList, User } from '../types';
import { getUserData, isUserBanned, banUser } from '../services/firestoreService';
import { auth } from '../firebaseConfig';

type UserProfileScreenRouteProp = RouteProp<HomeStackParamList, 'UserProfile'>;
type UserProfileScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'UserProfile'>;

interface Props {
  route: UserProfileScreenRouteProp;
  navigation: UserProfileScreenNavigationProp;
}

const UserProfileScreen: React.FC<Props> = ({ route, navigation }) => {
  const { userId } = route.params;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBanned, setIsBanned] = useState(false);
  const [banning, setBanning] = useState(false);

  useEffect(() => {
    loadUserData();
    checkBanStatus();
  }, [userId]);

  const loadUserData = async () => {
    try {
      const userData = await getUserData(userId);
      setUser(userData);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkBanStatus = async () => {
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) return;

    const banned = await isUserBanned(currentUserId, userId);
    setIsBanned(banned);
  };

  const handleBan = async () => {
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId || !user) return;

    Alert.alert(
      'Foydalanuvchini bloklash',
      `${user.name}ni bloklashni xohlaysizmi? U sizga xabar yubora olmaydi va profilingizni ko'ra olmaydi.`,
      [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: 'Bloklash',
          style: 'destructive',
          onPress: async () => {
            setBanning(true);
            try {
              await banUser(currentUserId, userId);
              Alert.alert('Muvaffaqiyatli', 'Foydalanuvchi bloklandi');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Xato', 'Bloklashda xatolik yuz berdi');
            } finally {
              setBanning(false);
            }
          },
        },
      ]
    );
  };

  const handleStartChat = () => {
    if (!user) return;
    navigation.navigate('Chat', { userId: user.id, userName: user.name });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Foydalanuvchi topilmadi</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: user.photoURL }} style={styles.avatar} />
        <View style={styles.onlineIndicatorContainer}>
          {user.isOnline && <View style={styles.onlineIndicator} />}
        </View>
        <Text style={styles.name}>{user.name}</Text>
        {user.age && (
          <Text style={styles.age}>{user.age} yosh</Text>
        )}
        {user.location && (
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={16} color="#666" />
            <Text style={styles.location}>{user.location}</Text>
          </View>
        )}
      </View>

      {user.bio && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Bio</Text>
          <Text style={styles.bioText}>{user.bio}</Text>
        </View>
      )}

      {user.interests && user.interests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Qiziqishlar</Text>
          <View style={styles.interestsContainer}>
            {user.interests.map((interest, index) => (
              <View key={index} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Ma'lumotlar</Text>
        <View style={styles.infoRow}>
          <Ionicons name={user.gender === 'male' ? 'male' : 'female'} size={20} color="#666" />
          <Text style={styles.infoText}>
            {user.gender === 'male' ? 'Erkak' : 'Ayol'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="mail" size={20} color="#666" />
          <Text style={styles.infoText}>{user.email}</Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.chatButton}
          onPress={handleStartChat}
        >
          <Ionicons name="chatbubble" size={20} color="#fff" />
          <Text style={styles.chatButtonText}>Xabar yuborish</Text>
        </TouchableOpacity>

        {!isBanned && (
          <TouchableOpacity
            style={[styles.banButton, banning && styles.banButtonDisabled]}
            onPress={handleBan}
            disabled={banning}
          >
            {banning ? (
              <ActivityIndicator color="#F44336" size="small" />
            ) : (
              <>
                <Ionicons name="ban" size={20} color="#F44336" />
                <Text style={styles.banButtonText}>Bloklash</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
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
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#F5F5F5',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8E8E8',
    marginBottom: 16,
  },
  onlineIndicatorContainer: {
    position: 'absolute',
    top: 50,
    right: '35%',
  },
  onlineIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    borderWidth: 3,
    borderColor: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  age: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  section: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  sectionLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 12,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  bioText: {
    fontSize: 16,
    color: '#000',
    lineHeight: 24,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: '#E8D5FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  interestText: {
    fontSize: 14,
    color: '#6200EE',
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
  },
  actionButtons: {
    padding: 24,
    gap: 12,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6200EE',
    padding: 16,
    borderRadius: 12,
  },
  chatButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  banButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBEE',
    padding: 16,
    borderRadius: 12,
  },
  banButtonDisabled: {
    opacity: 0.5,
  },
  banButtonText: {
    fontSize: 16,
    color: '#F44336',
    fontWeight: '600',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
});

export default UserProfileScreen;
