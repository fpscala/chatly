import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileStackParamList, User } from '../types';
import { getUserData, updateUserProfile } from '../services/firestoreService';
import { uploadProfileImage } from '../services/storageService';
import { auth } from '../firebaseConfig';

type EditProfileScreenNavigationProp = StackNavigationProp<
  ProfileStackParamList,
  'EditProfile'
>;

interface Props {
  navigation: EditProfileScreenNavigationProp;
}

const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [age, setAge] = useState('');
  const [location, setLocation] = useState('');
  const [interests, setInterests] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUserData();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Ruxsat kerak',
        'Rasm tanlash uchun galereyaga ruxsat bering'
      );
    }
  };

  const loadUserData = async () => {
    try {
      const currentUserId = auth.currentUser?.uid;
      if (!currentUserId) return;

      const userData = await getUserData(currentUserId);
      if (userData) {
        setUser(userData);
        setName(userData.name);
        setBio(userData.bio || '');
        setAge(userData.age?.toString() || '');
        setLocation(userData.location || '');
        setInterests(userData.interests?.join(', ') || '');
        setPhotoURL(userData.photoURL);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotoURL(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Xato', 'Rasm tanlashda xatolik yuz berdi');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Xato', 'Iltimos, ismingizni kiriting');
      return;
    }

    setSaving(true);
    try {
      const currentUserId = auth.currentUser?.uid;
      if (!currentUserId) return;

      let updatedPhotoURL = photoURL;

      // Agar yangi rasm tanlangan bo'lsa, yuklash
      if (photoURL !== user?.photoURL) {
        updatedPhotoURL = await uploadProfileImage(currentUserId, photoURL);
      }

      // Interests'ni array'ga aylantirish
      const interestsArray = interests
        .split(',')
        .map((i) => i.trim())
        .filter((i) => i.length > 0);

      // Age'ni number'ga aylantirish
      const ageNum = age ? parseInt(age) : undefined;

      await updateUserProfile(currentUserId, {
        name: name.trim(),
        bio: bio.trim(),
        age: ageNum,
        location: location.trim(),
        interests: interestsArray,
        photoURL: updatedPhotoURL,
      } as Partial<User>);

      Alert.alert('Muvaffaqiyatli', 'Profil yangilandi');
      navigation.goBack();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Xato', 'Profilni yangilashda xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
          <Image source={{ uri: photoURL }} style={styles.avatar} />
          <View style={styles.cameraIcon}>
            <Ionicons name="camera" size={20} color="#fff" />
          </View>
        </TouchableOpacity>

        <Text style={styles.label}>Ism</Text>
        <TextInput
          style={styles.input}
          placeholder="Ismingizni kiriting"
          value={name}
          onChangeText={setName}
          maxLength={50}
        />

        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={[styles.input, styles.bioInput]}
          placeholder="O'zingiz haqingizda yozing..."
          value={bio}
          onChangeText={setBio}
          multiline
          maxLength={200}
        />
        <Text style={styles.charCount}>{bio.length}/200</Text>

        <Text style={styles.label}>Yosh (ixtiyoriy)</Text>
        <TextInput
          style={styles.input}
          placeholder="Yoshingiz"
          value={age}
          onChangeText={setAge}
          keyboardType="number-pad"
          maxLength={3}
        />

        <Text style={styles.label}>Manzil (ixtiyoriy)</Text>
        <TextInput
          style={styles.input}
          placeholder="Toshkent, O'zbekiston"
          value={location}
          onChangeText={setLocation}
          maxLength={100}
        />

        <Text style={styles.label}>Qiziqishlar (ixtiyoriy)</Text>
        <TextInput
          style={styles.input}
          placeholder="Sport, Musiqa, Dasturlash (vergul bilan ajrating)"
          value={interests}
          onChangeText={setInterests}
          maxLength={200}
        />

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Saqlash</Text>
          )}
        </TouchableOpacity>
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
  content: {
    padding: 24,
  },
  avatarContainer: {
    alignSelf: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8E8E8',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6200EE',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  label: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
  },
  bioInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: -16,
    marginBottom: 24,
  },
  saveButton: {
    backgroundColor: '#6200EE',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditProfileScreen;
