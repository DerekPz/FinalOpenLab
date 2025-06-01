import type { Project } from '../data/types';
export type { Project };

export interface TechStack {
  name: string;
  level: 'Básico' | 'Intermedio' | 'Avanzado';
  yearsOfExperience: number;
  monthsOfExperience?: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
}

export interface ReputationEvent {
  type: 'like_received' | 'comment_received' | 'project_published' | 'follower_gained';
  points: number;
  timestamp: Date;
  sourceId: string;
}

export interface UserComment {
  id: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  content: string;
  comment?: string;
  createdAt: {
    toDate: () => Date;
  } | Date;
  updatedAt?: Date;
  likes: number;
  projectId: string;
  parentCommentId?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  techStack: TechStack[];
  projects?: Project[];
  achievements?: Achievement[];
  reputation: number;
  rank: number;
  linkedInUrl?: string;
  githubUrl?: string;
  websiteUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  followersCount: number;
  followingCount: number;
  isTopRanked?: boolean;
  projectCount?: number;
  likesReceived: number;
}

export interface FirestoreUserProfile {
  displayName: string;
  photoURL?: string;
  email: string;
  bio?: string;
  techStack: TechStack[];
  reputation: number;
  rank: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FirestoreFollower {
  followerId: string;
  followedId: string;
  timestamp: Date;
}

export interface FirestoreLike {
  userId: string;
  targetUserId: string;
  projectId?: string;
  commentId?: string;
  timestamp: Date | any;
  type: 'project' | 'profile' | 'comment';
}

export interface UserProfileFormData {
  displayName: string;
  email: string;
  photoURL?: string;
  bio?: string;
  techStack: TechStack[];
  linkedInUrl?: string;
  githubUrl?: string;
  websiteUrl?: string;
}

// Tipos de respuesta de la API
export interface RankingUser {
  rank: number;
  uid: string;
  displayName: string;
  photoURL?: string;
  email: string;
  reputation: number;
  projectCount: number;
  createdAt: Date;
  updatedAt: Date;
} 