import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebaseConfig';

// Profil rasmini yuklash
export const uploadProfileImage = async (
  userId: string,
  uri: string
): Promise<string> => {
  try {
    // URI'dan blob yaratish
    const response = await fetch(uri);
    const blob = await response.blob();

    // Storage'ga yuklash
    const storageRef = ref(storage, `profile_pictures/${userId}.jpg`);
    await uploadBytes(storageRef, blob);

    // Download URL olish
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};
