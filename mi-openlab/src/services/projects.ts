import { db } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { Project } from '../data/types';

export async function getProjectsByUser(userId: string): Promise<Project[]> {
  try {
    const projectsRef = collection(db, 'projects');
    const q = query(
      projectsRef,
      where('userId', '==', userId),
      where('visibility', '==', 'public'),
      where('deleted', '==', false)
    );

    const querySnapshot = await getDocs(q);
    const projects = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Project[];

    return projects;
  } catch (error) {
    console.error('Error fetching user projects:', error);
    return [];
  }
} 