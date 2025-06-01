import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  deleteDoc,
  increment,
  serverTimestamp,
  Timestamp,
  startAfter,
  Query,
  runTransaction
} from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';
import type {
  Community,
  CommunityMember,
  FirestoreCommunity,
  CommunityRole,
  CommunityCategory
} from '../types/community';
import { logUserActivity } from '../services/userActivity';

// Crear una nueva comunidad
export async function createCommunity(
  name: string,
  description: string,
  category: CommunityCategory,
  creatorId: string,
  tags: string[] = [],
  rules: string[] = []
): Promise<string> {
  try {
    const communityData: Omit<FirestoreCommunity, 'id'> = {
      name,
      description,
      category,
      tags,
      creatorId,
      moderatorIds: [creatorId],
      memberCount: 1, // El creador es el primer miembro
      rules,
      status: 'active',
      createdAt: serverTimestamp() as Timestamp
    };

    // Crear la comunidad
    const communityRef = await addDoc(collection(db, 'communities'), communityData);

    // Agregar al creador como miembro
    const memberData: CommunityMember = {
      userId: creatorId,
      communityId: communityRef.id,
      role: 'creator',
      joinedAt: new Date()
    };

    await addDoc(collection(db, `communities/${communityRef.id}/members`), memberData);

    return communityRef.id;
  } catch (error) {
    console.error('Error creating community:', error);
    throw error;
  }
}

// Obtener una comunidad por ID
export async function getCommunity(communityId: string): Promise<Community | null> {
  try {
    const communityDoc = await getDoc(doc(db, 'communities', communityId));
    
    if (!communityDoc.exists()) {
      return null;
    }

    const data = communityDoc.data() as FirestoreCommunity;
    return {
      ...data,
      id: communityDoc.id,
      createdAt: data.createdAt.toDate()
    };
  } catch (error) {
    console.error('Error getting community:', error);
    throw error;
  }
}

// Obtener todas las comunidades (con paginación)
export async function getCommunities(
  category?: CommunityCategory,
  pageLimit = 10,
  lastCommunity?: Community
) {
  try {
    const communitiesRef = collection(db, 'communities');
    let queryRef: Query<DocumentData>;
    
    if (category) {
      queryRef = query(communitiesRef, where('category', '==', category));
    } else {
      queryRef = query(communitiesRef);
    }

    const snapshot = await getDocs(queryRef);
    
    // Agregar log para debug
    console.log('Snapshot empty?:', snapshot.empty);
    console.log('Number of documents:', snapshot.docs.length);
    if (!snapshot.empty) {
      console.log('First doc data:', snapshot.docs[0].data());
    }

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || '',
        description: data.description || '',
        category: data.category || 'Other',
        tags: data.tags || [],
        createdAt: data.createdAt?.toDate() || new Date(),
        creatorId: data.creatorId || '',
        moderatorIds: data.moderatorIds || [],
        memberCount: data.memberCount || 0,
        rules: data.rules || [],
        status: data.status || 'active',
        imageUrl: data.imageUrl
      } as Community;
    });
  } catch (error) {
    // Mejorar el log de error
    console.error('Error detallado al obtener comunidades:', error);
    if (error instanceof Error) {
      console.error('Mensaje de error:', error.message);
      console.error('Stack trace:', error.stack);
    }
    throw error;
  }
}

// Unirse a una comunidad
export async function joinCommunity(communityId: string, userId: string): Promise<void> {
  try {
    await runTransaction(db, async (transaction) => {
      // Verificar si ya es miembro
      const memberRef = doc(db, `communities/${communityId}/members/${userId}`);
      const memberDoc = await transaction.get(memberRef);
      
      if (memberDoc.exists()) {
        throw new Error('Ya eres miembro de esta comunidad');
      }

      // Obtener la comunidad
      const communityRef = doc(db, 'communities', communityId);
      const communityDoc = await transaction.get(communityRef);
      
      if (!communityDoc.exists()) {
        throw new Error('La comunidad no existe');
      }

      // Agregar como miembro
      transaction.set(memberRef, {
        userId,
        joinedAt: serverTimestamp(),
        role: 'member'
      });

      // Incrementar el contador de miembros
      transaction.update(communityRef, {
        memberCount: increment(1)
      });
    });

    // Obtener el nombre de la comunidad para el log
    const commSnap = await getDoc(doc(db, 'communities', communityId));
    const commName = commSnap.exists() ? commSnap.data().name : '';
    await logUserActivity(
      userId,
      'join_community',
      `Te uniste a la comunidad "${commName}"`,
      communityId
    );
  } catch (error) {
    console.error('Error joining community:', error);
    throw error;
  }
}

// Abandonar una comunidad
export async function leaveCommunity(communityId: string, userId: string): Promise<void> {
  try {
    await runTransaction(db, async (transaction) => {
      // Verificar si es miembro
      const memberRef = doc(db, `communities/${communityId}/members/${userId}`);
      const memberDoc = await transaction.get(memberRef);
      
      if (!memberDoc.exists()) {
        throw new Error('No eres miembro de esta comunidad');
      }

      // Obtener la comunidad
      const communityRef = doc(db, 'communities', communityId);
      const communityDoc = await transaction.get(communityRef);
      
      if (!communityDoc.exists()) {
        throw new Error('La comunidad no existe');
      }

      // Verificar que no sea el creador
      const communityData = communityDoc.data();
      if (communityData?.creatorId === userId) {
        throw new Error('El creador no puede abandonar la comunidad');
      }

      // Eliminar membresía
      transaction.delete(memberRef);

      // Decrementar el contador de miembros
      transaction.update(communityRef, {
        memberCount: increment(-1)
      });
    });

    // Obtener el nombre de la comunidad para el log
    const commSnap = await getDoc(doc(db, 'communities', communityId));
    const commName = commSnap.exists() ? commSnap.data().name : '';
    await logUserActivity(
      userId,
      'leave_community',
      `Saliste de la comunidad "${commName}"`,
      communityId
    );
  } catch (error) {
    console.error('Error leaving community:', error);
    throw error;
  }
}

// Verificar si un usuario es miembro de una comunidad
export async function isCommunityMember(communityId: string, userId: string): Promise<boolean> {
  try {
    const memberRef = doc(db, `communities/${communityId}/members/${userId}`);
    const memberDoc = await getDoc(memberRef);
    return memberDoc.exists();
  } catch (error) {
    console.error('Error checking community membership:', error);
    return false;
  }
}

// Obtener el rol de un usuario en una comunidad
export async function getUserCommunityRole(
  communityId: string,
  userId: string
): Promise<CommunityRole | null> {
  try {
    const membersRef = collection(db, `communities/${communityId}/members`);
    const q = query(membersRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    return snapshot.docs[0].data().role as CommunityRole;
  } catch (error) {
    console.error('Error getting user community role:', error);
    throw error;
  }
}

// Actualizar una comunidad
export async function updateCommunity(
  communityId: string,
  updates: Partial<Omit<Community, 'id' | 'createdAt' | 'creatorId'>>
): Promise<void> {
  try {
    await updateDoc(doc(db, 'communities', communityId), updates);
  } catch (error) {
    console.error('Error updating community:', error);
    throw error;
  }
}

// Archivar una comunidad
export async function archiveCommunity(communityId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'communities', communityId), {
      status: 'archived'
    });
  } catch (error) {
    console.error('Error archiving community:', error);
    throw error;
  }
}

export async function getCommunitiesByCreator(creatorId: string): Promise<Community[]> {
  const q = query(collection(db, "communities"), where("creatorId", "==", creatorId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    ...(doc.data() as Community),
    id: doc.id,
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  }));
}

export async function getCommunityMembers(communityId: string): Promise<CommunityMember[]> {
  const membersRef = collection(db, `communities/${communityId}/members`);
  const snapshot = await getDocs(membersRef);
  return snapshot.docs.map(doc => doc.data() as CommunityMember);
}

export async function removeCommunityMember(communityId: string, userId: string) {
  await deleteDoc(doc(db, `communities/${communityId}/members/${userId}`));
}

export async function getUserProfile(userId: string) {
  const userRef = doc(db, "userProfiles", userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return null;
  return userSnap.data();
} 