import { db } from './firebase';
import { 
  doc, 
  collection, 
  getDoc,
  increment,
  updateDoc,
  writeBatch,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { updateReputation } from './reputation';

// Función para seguir a un usuario
export async function followUser(followerId: string, followedId: string): Promise<void> {
  try {
    const batch = writeBatch(db);

    // Crear el documento en la colección de seguidores del usuario seguido
    const followerDoc = doc(db, `userProfiles/${followedId}/followers/${followerId}`);
    batch.set(followerDoc, {
      timestamp: serverTimestamp()
    });

    // Crear el documento en la colección de seguidos del seguidor
    const followingDoc = doc(db, `userProfiles/${followerId}/following/${followedId}`);
    batch.set(followingDoc, {
      timestamp: serverTimestamp()
    });

    // Incrementar contadores
    const followedRef = doc(db, 'userProfiles', followedId);
    batch.update(followedRef, {
      followersCount: increment(1)
    });

    const followerRef = doc(db, 'userProfiles', followerId);
    batch.update(followerRef, {
      followingCount: increment(1)
    });

    // Ejecutar todas las operaciones en una transacción
    await batch.commit();

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
    const batch = writeBatch(db);

    // Eliminar el documento de la colección de seguidores
    const followerDoc = doc(db, `userProfiles/${followedId}/followers/${followerId}`);
    batch.delete(followerDoc);

    // Eliminar el documento de la colección de seguidos
    const followingDoc = doc(db, `userProfiles/${followerId}/following/${followedId}`);
    batch.delete(followingDoc);

    // Decrementar contadores
    const followedRef = doc(db, 'userProfiles', followedId);
    batch.update(followedRef, {
      followersCount: increment(-1)
    });

    const followerRef = doc(db, 'userProfiles', followerId);
    batch.update(followerRef, {
      followingCount: increment(-1)
    });

    // Ejecutar todas las operaciones en una transacción
    await batch.commit();
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

// Función para obtener el recuento de seguidores
export async function getFollowersCount(userId: string): Promise<number> {
  try {
    const userRef = doc(db, 'userProfiles', userId);
    const userSnap = await getDoc(userRef);
    return userSnap.data()?.followersCount || 0;
  } catch (error) {
    console.error('Error getting followers count:', error);
    throw error;
  }
}

// Función para obtener el recuento de seguidos
export async function getFollowingCount(userId: string): Promise<number> {
  try {
    const userRef = doc(db, 'userProfiles', userId);
    const userSnap = await getDoc(userRef);
    return userSnap.data()?.followingCount || 0;
  } catch (error) {
    console.error('Error getting following count:', error);
    throw error;
  }
}

// Función para sincronizar los contadores de following
export async function syncFollowingCounts(userId: string): Promise<void> {
  try {
    // Obtener el número real de documentos en la colección following
    const followingRef = collection(db, `userProfiles/${userId}/following`);
    const followingSnapshot = await getDocs(followingRef);
    const actualFollowingCount = followingSnapshot.size;

    // Actualizar el contador en el perfil del usuario
    const userRef = doc(db, 'userProfiles', userId);
    await updateDoc(userRef, {
      followingCount: actualFollowingCount
    });

    console.log(`Synchronized following count for user ${userId}: ${actualFollowingCount}`);
  } catch (error) {
    console.error('Error syncing following count:', error);
    throw error;
  }
}

// Función para sincronizar los contadores de todos los usuarios
export async function syncAllFollowCounts(): Promise<void> {
  try {
    const usersRef = collection(db, 'userProfiles');
    const usersSnapshot = await getDocs(usersRef);

    const batch = writeBatch(db);
    const updates: Promise<void>[] = [];

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      
      // Contar seguidores
      const followersRef = collection(db, `userProfiles/${userId}/followers`);
      const followersSnapshot = await getDocs(followersRef);
      const followersCount = followersSnapshot.size;

      // Contar seguidos
      const followingRef = collection(db, `userProfiles/${userId}/following`);
      const followingSnapshot = await getDocs(followingRef);
      const followingCount = followingSnapshot.size;

      // Actualizar contadores en el perfil
      const userRef = doc(db, 'userProfiles', userId);
      batch.update(userRef, {
        followersCount,
        followingCount
      });

      if (updates.length >= 500) {
        await batch.commit();
        updates.length = 0;
      }
    }

    if (updates.length > 0) {
      await batch.commit();
    }

    console.log('Successfully synchronized all follow counts');
  } catch (error) {
    console.error('Error syncing all follow counts:', error);
    throw error;
  }
} 