import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import type { Project } from '../data/types';

interface ProjectStats {
  id: string;
  likes?: number;
  likedBy?: string[];
  updatedAt: Timestamp;
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
    lastActivity: 'Sin actividad reciente',
    isLoading: true,
  });

  useEffect(() => {
    async function fetchStats() {
      if (!user) {
        setStats(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        const projectsRef = collection(db, 'projects');
        const userProjectsQuery = query(
          projectsRef,
          where('userId', '==', user.uid)
        );
        
        const projectsSnapshot = await getDocs(userProjectsQuery);
        const projects = projectsSnapshot.docs.map<ProjectStats>(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            likes: data.likes,
            likedBy: data.likedBy,
            updatedAt: data.updatedAt as Timestamp,
            userId: data.userId,
            deleted: data.deleted
          };
        });

        const activeProjects = projects.filter(project => !project.deleted);
        const projectCount = activeProjects.length;
        let totalLikes = 0;
        let lastActivityTimestamp: Timestamp | null = null;

        activeProjects.forEach((project) => {
          if (typeof project.likes === 'number') {
            totalLikes += project.likes;
          } else if (Array.isArray(project.likedBy)) {
            totalLikes += project.likedBy.length;
          }

          if (!lastActivityTimestamp || project.updatedAt.seconds > lastActivityTimestamp.seconds) {
            lastActivityTimestamp = project.updatedAt;
          }
        });

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