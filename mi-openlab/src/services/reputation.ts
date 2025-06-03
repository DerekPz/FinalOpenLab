import { db } from './firebase';
import { 
  doc, 
  updateDoc, 
  getDoc, 
  increment, 
  arrayUnion,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  Timestamp,
  where,
  writeBatch
} from 'firebase/firestore';
import type { Achievement, ReputationEvent, UserProfile } from '../types/user';

// Puntos por cada tipo de acción
const REPUTATION_POINTS = {
  like_received: 10,
  comment_received: 15,
  project_published: 50,
  follower_gained: 20
};

// Definición de logros disponibles
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_project',
    name: 'Primer Proyecto',
    description: 'Publicaste tu primer proyecto',
    icon: '🚀'
  },
  {
    id: 'ten_followers',
    name: '10 Seguidores',
    description: 'Conseguiste 10 seguidores',
    icon: '👥'
  },
  {
    id: 'hundred_likes',
    name: '100 Likes',
    description: 'Tus proyectos recibieron 100 likes',
    icon: '❤️'
  },
  {
    id: 'featured_project',
    name: 'Proyecto Destacado',
    description: 'Uno de tus proyectos fue destacado',
    icon: '⭐'
  },
  {
    id: 'active_commenter',
    name: 'Comentarista Activo',
    description: 'Realizaste 50 comentarios',
    icon: '💬'
  }
];

// Función para actualizar la reputación de un usuario
export async function updateReputation(
  userId: string,
  eventType: ReputationEvent['type'],
  sourceId: string
) {
  try {
    const userRef = doc(db, 'userProfiles', userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();

    if (!userData) return;

    const points = REPUTATION_POINTS[eventType];
    const event: ReputationEvent = {
      type: eventType,
      points,
      timestamp: new Date(),
      sourceId
    };

    // Actualizar reputación y estadísticas
    await updateDoc(userRef, {
      reputation: increment(points),
      reputationHistory: arrayUnion(event),
      ...(eventType === 'like_received' && { likesReceived: increment(1) }),
      ...(eventType === 'comment_received' && { commentsReceived: increment(1) }),
      ...(eventType === 'follower_gained' && { followersCount: increment(1) }),
      ...(eventType === 'project_published' && { projectCount: increment(1) })
    });

    // Verificar y otorgar logros
    await checkAndAwardAchievements(userId);
  } catch (error) {
    console.error('Error updating reputation:', error);
  }
}

// Función para verificar y otorgar logros
async function checkAndAwardAchievements(userId: string) {
  try {
    const userRef = doc(db, 'userProfiles', userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();

    if (!userData) return;

    const newAchievements: Achievement[] = [];

    // Verificar cada logro posible
    if (userData.projectCount === 1) {
      newAchievements.push({
        ...ACHIEVEMENTS.find(a => a.id === 'first_project')!,
        unlockedAt: new Date()
      });
    }

    if (userData.followersCount >= 10) {
      newAchievements.push({
        ...ACHIEVEMENTS.find(a => a.id === 'ten_followers')!,
        unlockedAt: new Date()
      });
    }

    if (userData.likesReceived >= 100) {
      newAchievements.push({
        ...ACHIEVEMENTS.find(a => a.id === 'hundred_likes')!,
        unlockedAt: new Date()
      });
    }

    // Si hay nuevos logros, actualizarlos en el perfil
    if (newAchievements.length > 0) {
      await updateDoc(userRef, {
        achievements: arrayUnion(...newAchievements)
      });
    }
  } catch (error) {
    console.error('Error checking achievements:', error);
  }
}

// Función para obtener el ranking de usuarios
export async function getUserRanking(limitCount = 10, isAuthenticated = false) {
  try {
    console.log('Fetching user ranking...');
    const usersRef = collection(db, 'userProfiles');
    
    // Filtrar usuarios con reputación > 0 y ordenar por reputación
    const q = query(
      usersRef,
      where('reputation', '>', 0),
      orderBy('reputation', 'desc'),
      orderBy('updatedAt', 'asc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    console.log('Snapshot received:', snapshot.size, 'documents');
    
    if (snapshot.empty) {
      console.log('No users found in ranking');
      return [];
    }

    if (isAuthenticated) {
      const prevTopQuery = query(
        usersRef,
        where('isTopRanked', '==', true)
      );
      const prevTopSnapshot = await getDocs(prevTopQuery);
    
      const batch = writeBatch(db);
      prevTopSnapshot.docs.forEach(doc => {
        if (doc.id !== snapshot.docs[0].id) {
          batch.update(doc.ref, { isTopRanked: false });
        }
      });
    
      batch.update(doc(usersRef, snapshot.docs[0].id), { isTopRanked: true });
      await batch.commit();
    }
    

    // Obtener el conteo real de proyectos para cada usuario
    const usersWithProjects = await Promise.all(snapshot.docs.map(async (doc, index) => {
      const data = doc.data();
      
      // Obtener proyectos del usuario
      const projectsRef = collection(db, 'projects');
      const projectsQuery = query(
        projectsRef,
        where('userId', '==', doc.id),
        where('deleted', '==', false),
        where('visibility', '==', 'public')
      );
      const projectsSnapshot = await getDocs(projectsQuery);
      const realProjectCount = projectsSnapshot.size;

      return {
        ...(data as UserProfile),
        rank: index + 1,
        projectCount: realProjectCount,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt
      };
    }));

    return usersWithProjects;
  } catch (error) {
    console.error('Error fetching user ranking:', error);
    throw error;
  }
}

// Función para migrar datos históricos y calcular reputación
export async function migrateHistoricalReputation() {
  try {
    console.log('Starting historical reputation migration...');
    const usersRef = collection(db, 'userProfiles');
    const usersSnapshot = await getDocs(usersRef);

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data() as UserProfile;
      console.log(`Processing user: ${userData.displayName}`);

      // Obtener proyectos del usuario
      const projectsRef = collection(db, 'projects');
      const projectsQuery = query(projectsRef, where('userId', '==', userDoc.id));
      const projectsSnapshot = await getDocs(projectsQuery);
      const projectCount = projectsSnapshot.size;

      // Contar likes y comentarios recibidos en todos sus proyectos
      let totalLikes = 0;
      let totalComments = 0;

      for (const projectDoc of projectsSnapshot.docs) {
        const likesRef = collection(db, 'projects', projectDoc.id, 'likes');
        const commentsRef = collection(db, 'projects', projectDoc.id, 'comments');
        
        const [likesSnapshot, commentsSnapshot] = await Promise.all([
          getDocs(likesRef),
          getDocs(commentsRef)
        ]);

        totalLikes += likesSnapshot.size;
        totalComments += commentsSnapshot.size;
      }

      // Obtener seguidores
      const followersRef = collection(db, 'userProfiles', userDoc.id, 'followers');
      const followersSnapshot = await getDocs(followersRef);
      const followersCount = followersSnapshot.size;

      // Calcular reputación total
      const reputation = 
        (projectCount * REPUTATION_POINTS.project_published) +
        (totalLikes * REPUTATION_POINTS.like_received) +
        (totalComments * REPUTATION_POINTS.comment_received) +
        (followersCount * REPUTATION_POINTS.follower_gained);

      // Crear eventos históricos
      const reputationHistory: ReputationEvent[] = [];
      
      if (projectCount > 0) {
        reputationHistory.push({
          type: 'project_published',
          points: projectCount * REPUTATION_POINTS.project_published,
          timestamp: new Date(),
          sourceId: 'historical_migration'
        });
      }

      if (totalLikes > 0) {
        reputationHistory.push({
          type: 'like_received',
          points: totalLikes * REPUTATION_POINTS.like_received,
          timestamp: new Date(),
          sourceId: 'historical_migration'
        });
      }

      if (totalComments > 0) {
        reputationHistory.push({
          type: 'comment_received',
          points: totalComments * REPUTATION_POINTS.comment_received,
          timestamp: new Date(),
          sourceId: 'historical_migration'
        });
      }

      if (followersCount > 0) {
        reputationHistory.push({
          type: 'follower_gained',
          points: followersCount * REPUTATION_POINTS.follower_gained,
          timestamp: new Date(),
          sourceId: 'historical_migration'
        });
      }

      // Actualizar el perfil del usuario
      await updateDoc(doc(db, 'userProfiles', userDoc.id), {
        reputation,
        reputationHistory: arrayUnion(...reputationHistory),
        projectCount,
        likesReceived: totalLikes,
        commentsReceived: totalComments,
        followersCount
      });

      console.log(`Updated ${userData.displayName} with reputation: ${reputation}`);
    }

    console.log('Historical reputation migration completed successfully');
  } catch (error) {
    console.error('Error during historical reputation migration:', error);
    throw error;
  }
} 