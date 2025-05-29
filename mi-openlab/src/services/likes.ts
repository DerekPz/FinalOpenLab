import { db } from './firebase';
import { 
  collection, 
  getDocs,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import type { Project } from '../data/types';

// Función para obtener todos los proyectos que el usuario ha dado like
export async function getLikedProjects(userId: string): Promise<Project[]> {
  try {
    // Primero obtenemos los proyectos que el usuario ha dado like
    const projectsRef = collection(db, 'projects');
    const likedProjectsQuery = query(
      projectsRef,
      where('likedBy', 'array-contains', userId),
      where('deleted', '==', false)
    );
    
    const projectsSnapshot = await getDocs(likedProjectsQuery);
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
    console.error('Error getting liked projects:', error);
    throw error;
  }
} 