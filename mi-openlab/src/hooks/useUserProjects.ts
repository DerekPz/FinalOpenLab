import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  imageUrl?: string;
  visibility: 'public' | 'private';
  githubUrl?: string;
  demoUrl?: string;
  createdAt?: any;
}

export function useUserProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchProjects = async () => {
      setLoading(true);
      setError(null);

      try {
        const q = query(collection(db, 'projects'), where('owner', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const results: Project[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
        setProjects(results);
      } catch (err: any) {
        console.error('Error fetching projects:', err);
        setError('No se pudieron obtener los proyectos.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  return { projects, loading, error };
}
