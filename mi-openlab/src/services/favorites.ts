import { db } from './firebase';
import { 
  doc, 
  collection, 
  setDoc, 
  deleteDoc, 
  getDoc,
  getDocs,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import type { Project } from '../data/types';
import { logUserActivity } from './userActivity';

// Función para marcar un proyecto como favorito
export async function addFavorite(userId: string, projectId: string): Promise<void> {
  try {
    const favoriteDoc = doc(db, `userProfiles/${userId}/favorites/${projectId}`);
    await setDoc(favoriteDoc, {
      timestamp: new Date()
    });
    await logUserActivity(userId, 'favorite', `Marcaste como favorito el proyecto con ID ${projectId}`, projectId);
  } catch (error) {
    console.error('Error adding favorite:', error);
    throw error;
  }
}

// Función para quitar un proyecto de favoritos
export async function removeFavorite(userId: string, projectId: string): Promise<void> {
  try {
    const favoriteDoc = doc(db, `userProfiles/${userId}/favorites/${projectId}`);
    await deleteDoc(favoriteDoc);
  } catch (error) {
    console.error('Error removing favorite:', error);
    throw error;
  }
}

// Función para verificar si un proyecto está en favoritos
export async function isFavorite(userId: string, projectId: string): Promise<boolean> {
  try {
    const favoriteDoc = doc(db, `userProfiles/${userId}/favorites/${projectId}`);
    const docSnap = await getDoc(favoriteDoc);
    return docSnap.exists();
  } catch (error) {
    console.error('Error checking favorite status:', error);
    throw error;
  }
}

// Función para obtener todos los proyectos favoritos de un usuario
export async function getFavoriteProjects(userId: string): Promise<Project[]> {
  try {
    // Primero obtenemos los IDs de los favoritos
    const favoritesRef = collection(db, `userProfiles/${userId}/favorites`);
    const favoritesSnapshot = await getDocs(favoritesRef);
    const favoriteIds = favoritesSnapshot.docs.map(doc => doc.id);

    if (favoriteIds.length === 0) {
      return [];
    }

    // Luego obtenemos los proyectos correspondientes
    const projectsRef = collection(db, 'projects');
    const projectsQuery = query(
      projectsRef,
      where('__name__', 'in', favoriteIds),
      where('deleted', '==', false)
    );
    
    const projectsSnapshot = await getDocs(projectsQuery);
    return projectsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || '',
        description: data.description || '',
        imageUrl: data.imageUrl,
        userId: data.userId || '',
        author: data.author || '',
        visibility: data.visibility || 'public',
        deleted: data.deleted || false,
        tags: data.tags || [],
        createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : new Date(),
        updatedAt: data.updatedAt ? (data.updatedAt as Timestamp).toDate() : new Date(),
        likes: data.likes || 0,
        views: data.views || 0,
        githubUrl: data.githubUrl,
        demoUrl: data.demoUrl,
        techStack: data.techStack || []
      };
    });
  } catch (error) {
    console.error('Error getting favorite projects:', error);
    throw error;
  }
} 