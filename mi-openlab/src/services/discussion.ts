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
  increment,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import type {
  Discussion,
  Response,
  DiscussionType,
  FirestoreDiscussion,
  FirestoreResponse
} from '../types/community';
import { logUserActivity } from './userActivity';

// Crear una nueva discusión
export async function createDiscussion(
  communityId: string,
  title: string,
  content: string,
  authorId: string,
  type: DiscussionType,
  tags: string[] = []
): Promise<string> {
  try {
    const discussionData: Omit<FirestoreDiscussion, 'id'> = {
      communityId,
      title,
      content,
      authorId,
      type,
      tags,
      status: 'open',
      upvotes: 0,
      downvotes: 0,
      responseCount: 0,
      views: 0,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp
    };

    const discussionRef = await addDoc(
      collection(db, 'communities', communityId, 'discussions'),
      discussionData
    );

    // Registrar actividad de creación de discusión
    await logUserActivity(
      authorId,
      'create_discussion',
      `Publicaste la discusión "${title}"`,
      discussionRef.id
    );

    return discussionRef.id;
  } catch (error) {
    console.error('Error creating discussion:', error);
    throw error;
  }
}

// Obtener una discusión por ID
export async function getDiscussion(
  communityId: string,
  discussionId: string
): Promise<Discussion | null> {
  try {
    const discussionDoc = await getDoc(
      doc(db, 'communities', communityId, 'discussions', discussionId)
    );

    if (!discussionDoc.exists()) {
      return null;
    }

    const data = discussionDoc.data() as FirestoreDiscussion;
    
    // Incrementar vistas
    await updateDoc(discussionDoc.ref, {
      views: increment(1)
    });

    return {
      ...data,
      id: discussionDoc.id,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate()
    };
  } catch (error) {
    console.error('Error getting discussion:', error);
    throw error;
  }
}

// Obtener discusiones de una comunidad
export async function getCommunityDiscussions(
  communityId: string,
  limitCount = 10,
  lastDiscussion?: Discussion
) {
  try {
    const discussionsRef = collection(db, 'communities', communityId, 'discussions');
    let q = query(
      discussionsRef,
      orderBy('createdAt', 'desc')
    );

    if (lastDiscussion) {
      q = query(q, where('createdAt', '<', lastDiscussion.createdAt));
    }

    q = query(q, limit(limitCount));

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    })) as Discussion[];
  } catch (error) {
    console.error('Error getting community discussions:', error);
    throw error;
  }
}

// Agregar una respuesta
export async function addResponse(
  communityId: string,
  discussionId: string,
  content: string,
  authorId: string,
  parentResponseId?: string
): Promise<string> {
  try {
    // Solo incluir parentResponseId si tiene valor
    const responseData: Omit<FirestoreResponse, 'id'> = {
      discussionId,
      content,
      authorId,
      upvotes: 0,
      downvotes: 0,
      isAccepted: false,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
      ...(parentResponseId ? { parentResponseId } : {})
    };

    const responseRef = await addDoc(
      collection(db, 'communities', communityId, 'discussions', discussionId, 'responses'),
      responseData
    );

    // Incrementar el contador de respuestas en la discusión
    await updateDoc(
      doc(db, 'communities', communityId, 'discussions', discussionId),
      {
        responseCount: increment(1)
      }
    );

    // Obtener el título de la discusión para la descripción
    const discussionDoc = await getDoc(doc(db, 'communities', communityId, 'discussions', discussionId));
    const discussionTitle = discussionDoc.exists() ? discussionDoc.data().title : '';

    await logUserActivity(
      authorId,
      'comment',
      `Comentaste en la discusión "${discussionTitle}"`,
      discussionId
    );
    return responseRef.id;
  } catch (error) {
    console.error('Error adding response:', error);
    throw error;
  }
}

// Obtener respuestas de una discusión
export async function getDiscussionResponses(
  communityId: string,
  discussionId: string,
  limitCount = 20
): Promise<Response[]> {
  try {
    const responsesRef = collection(
      db,
      'communities',
      communityId,
      'discussions',
      discussionId,
      'responses'
    );
    
    const q = query(
      responsesRef,
      orderBy('isAccepted', 'desc'),
      orderBy('upvotes', 'desc'),
      orderBy('createdAt', 'asc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    })) as Response[];
  } catch (error) {
    console.error('Error getting discussion responses:', error);
    throw error;
  }
}

// Votar una discusión
export async function voteDiscussion(
  communityId: string,
  discussionId: string,
  isUpvote: boolean
): Promise<void> {
  try {
    await updateDoc(
      doc(db, 'communities', communityId, 'discussions', discussionId),
      {
        [isUpvote ? 'upvotes' : 'downvotes']: increment(1)
      }
    );
  } catch (error) {
    console.error('Error voting discussion:', error);
    throw error;
  }
}

// Marcar una respuesta como aceptada
export async function acceptResponse(
  communityId: string,
  discussionId: string,
  responseId: string
): Promise<void> {
  try {
    // Actualizar la discusión
    await updateDoc(
      doc(db, 'communities', communityId, 'discussions', discussionId),
      {
        acceptedResponseId: responseId,
        status: 'resolved'
      }
    );

    // Actualizar la respuesta
    await updateDoc(
      doc(db, 'communities', communityId, 'discussions', discussionId, 'responses', responseId),
      {
        isAccepted: true
      }
    );
  } catch (error) {
    console.error('Error accepting response:', error);
    throw error;
  }
} 