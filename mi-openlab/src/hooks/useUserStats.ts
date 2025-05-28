import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

interface FirebaseTimestamp {
  toDate(): Date;
  seconds: number;
  nanoseconds: number;
}

interface Project {
  id: string;
  likes?: number;
  likedBy?: string[];
  updatedAt: FirebaseTimestamp;
  userId: string;
  deleted?: boolean;
}

export interface UserStats {
  projectCount: number;
  totalLikes: number;
  lastActivity: string;
  isLoading: boolean;
}

export function useUserStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    projectCount: 0,
    totalLikes: 0,
    lastActivity: '',
    isLoading: true,
  });

  useEffect(() => {
    async function fetchStats() {
      if (!user) {
        return;
      }

      try {
        console.log('Fetching stats for user ID:', user.uid);
        
        // Obtener proyectos del usuario
        const projectsRef = collection(db, 'projects');
        const userProjectsQuery = query(
          projectsRef,
          where('userId', '==', user.uid),
          where('deleted', '==', false)
        );
        
        const projectsSnapshot = await getDocs(userProjectsQuery);
        const projects = projectsSnapshot.docs.map<Project>(doc => {
          const data = doc.data();
          console.log('Project data:', { id: doc.id, ...data });
          return {
            id: doc.id,
            ...data,
            updatedAt: data.updatedAt as FirebaseTimestamp
          } as Project;
        });

        // Filtrar proyectos no eliminados (por si acaso)
        const activeProjects = projects.filter(project => !project.deleted);
        console.log('Active projects:', activeProjects.length);

        const projectCount = activeProjects.length;
        let totalLikes = 0;
        let lastActivityTimestamp: FirebaseTimestamp | null = null;

        // Procesar cada proyecto
        activeProjects.forEach((project) => {
          // Contar likes - usar el número directo de likes si existe, si no, usar la longitud de likedBy
          if (typeof project.likes === 'number') {
            totalLikes += project.likes;
          } else if (Array.isArray(project.likedBy)) {
            totalLikes += project.likedBy.length;
          }

          // Actualizar última actividad
          const updatedAt = project.updatedAt;
          if (!lastActivityTimestamp || updatedAt.seconds > lastActivityTimestamp.seconds) {
            lastActivityTimestamp = updatedAt;
          }
        });

        // Formatear última actividad
        let lastActivity = 'Sin actividad reciente';
        if (lastActivityTimestamp) {
          const lastActivityDate = lastActivityTimestamp.toDate();
          const now = new Date();
          const diffTime = now.getTime() - lastActivityDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
          const diffMinutes = Math.floor(diffTime / (1000 * 60));

          if (diffMinutes < 1) {
            lastActivity = 'Hace unos segundos';
          } else if (diffMinutes < 60) {
            lastActivity = `Hace ${diffMinutes} minutos`;
          } else if (diffHours < 24) {
            lastActivity = `Hace ${diffHours} horas`;
          } else if (diffDays === 1) {
            lastActivity = 'Ayer';
          } else {
            lastActivity = `Hace ${diffDays} días`;
          }
        }

        console.log('Setting final stats:', {
          projectCount,
          totalLikes,
          lastActivity,
          lastActivityDate: lastActivityTimestamp?.toDate().toISOString()
        });

        setStats({
          projectCount,
          totalLikes,
          lastActivity,
          isLoading: false,
        });
      } catch (error) {
        console.error('Error fetching user stats:', error);
        setStats(prev => ({ ...prev, isLoading: false }));
      }
    }

    fetchStats();
  }, [user]);

  return stats;
} 