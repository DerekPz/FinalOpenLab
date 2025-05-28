import { db } from './firebase';
import { 
  doc, 
  collection, 
  setDoc, 
  deleteDoc, 
  getDoc,
  increment,
  updateDoc
} from 'firebase/firestore';
import { updateReputation } from './reputation';

// Función para seguir a un usuario
export async function followUser(followerId: string, followedId: string): Promise<void> {
  try {
    // Crear el documento de seguimiento
    const followDoc = doc(db, `userProfiles/${followedId}/followers/${followerId}`);
    await setDoc(followDoc, {
      timestamp: new Date()
    });

    // Incrementar el contador de seguidores
    const userRef = doc(db, 'userProfiles', followedId);
    await updateDoc(userRef, {
      followersCount: increment(1)
    });

    // Actualizar la reputación del usuario seguido
    await updateReputation(followedId, 'follower_gained', followerId);
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
}

// Función para dejar de seguir a un usuario
export async function unfollowUser(followerId: string, followedId: string): Promise<void> {
  try {
    // Eliminar el documento de seguimiento
    const followDoc = doc(db, `userProfiles/${followedId}/followers/${followerId}`);
    await deleteDoc(followDoc);

    // Decrementar el contador de seguidores
    const userRef = doc(db, 'userProfiles', followedId);
    await updateDoc(userRef, {
      followersCount: increment(-1)
    });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
}

// Función para verificar si un usuario sigue a otro
export async function isFollowing(followerId: string, followedId: string): Promise<boolean> {
  try {
    const followDoc = doc(db, `userProfiles/${followedId}/followers/${followerId}`);
    const docSnap = await getDoc(followDoc);
    return docSnap.exists();
  } catch (error) {
    console.error('Error checking follow status:', error);
    throw error;
  }
} 