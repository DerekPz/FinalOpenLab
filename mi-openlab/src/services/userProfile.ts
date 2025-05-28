import { db, storage } from './firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { UserProfile, UserProfileFormData } from '../types/user';

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    console.log('Fetching user profile for UID:', uid);
    const userDoc = await getDoc(doc(db, 'userProfiles', uid));
    console.log('Firestore response:', userDoc.exists(), userDoc.data());
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      const profile = {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as UserProfile;
      
      console.log('Parsed profile:', profile);
      return profile;
    }
    console.log('No profile found for UID:', uid);
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

export async function createUserProfile(uid: string, data: UserProfileFormData): Promise<void> {
  try {
    console.log('Creating user profile for UID:', uid, 'with data:', data);
    const profile: UserProfile = {
      ...data,
      uid,
      email: data.email,
      createdAt: new Date(),
      updatedAt: new Date(),
      techStack: data.techStack || [],
      reputation: 0,
      achievements: [],
      reputationHistory: [],
      projectCount: 0,
      followersCount: 0,
      likesReceived: 0,
      commentsReceived: 0
    };

    const profileWithTimestamps = {
      ...profile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'userProfiles', uid), profileWithTimestamps);
    console.log('Profile created successfully');
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}

export async function updateUserProfile(uid: string, data: Partial<UserProfileFormData>): Promise<void> {
  try {
    console.log('Updating user profile for UID:', uid, 'with data:', data);
    const updateData = {
      ...data,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(doc(db, 'userProfiles', uid), updateData);
    console.log('Profile updated successfully');
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

export async function uploadProfileImage(uid: string, file: File): Promise<string> {
  try {
    // Validar el archivo
    if (!file.type.startsWith('image/')) {
      throw new Error('El archivo debe ser una imagen');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('La imagen no debe superar los 5MB');
    }

    console.log('Uploading profile image for UID:', uid);
    
    // Crear una referencia única para la imagen
    const fileName = `${Date.now()}-${file.name}`;
    const fileRef = ref(storage, `profileImages/${uid}/${fileName}`);
    
    // Subir la imagen
    console.log('Starting upload...');
    await uploadBytes(fileRef, file);
    console.log('Upload completed, getting download URL...');
    
    // Obtener la URL de descarga
    const downloadURL = await getDownloadURL(fileRef);
    console.log('Got download URL:', downloadURL);
    
    // Actualizar el perfil con la nueva URL
    await updateUserProfile(uid, { photoURL: downloadURL });
    console.log('Profile updated with new image URL');
    
    return downloadURL;
  } catch (error: any) {
    console.error('Error uploading profile image:', error);
    
    // Mejorar los mensajes de error
    if (error.code === 'storage/unauthorized') {
      throw new Error('No tienes permiso para subir imágenes. Por favor, inicia sesión nuevamente.');
    } else if (error.code === 'storage/canceled') {
      throw new Error('La subida fue cancelada.');
    } else if (error.code === 'storage/unknown') {
      throw new Error('Ocurrió un error desconocido. Por favor, intenta de nuevo.');
    }
    
    throw error;
  }
} 