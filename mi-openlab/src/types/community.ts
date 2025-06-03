import { Timestamp } from 'firebase/firestore';

export type CommunityCategory = 
  | 'Frontend' 
  | 'Backend' 
  | 'DevOps' 
  | 'Mobile' 
  | 'AI/ML' 
  | 'Design' 
  | 'Database' 
  | 'Cloud' 
  | 'Security'
  | 'Other';

export type CommunityRole = 'creator' | 'moderator' | 'member' | 'visitor';

export type CommunityStatus = 'active' | 'archived';

export interface Community {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  category: CommunityCategory;
  tags: string[];
  createdAt: Date;
  creatorId: string;
  moderatorIds: string[];
  memberCount: number;
  rules: string[];
  status: CommunityStatus;
}

export type DiscussionType = 'question' | 'resource' | 'debate' | 'announcement';
export type DiscussionStatus = 'open' | 'resolved' | 'closed';

export interface Discussion {
  id: string;
  communityId: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  type: DiscussionType;
  tags: string[];
  status: DiscussionStatus;
  upvotes: number;
  downvotes: number;
  responseCount: number;
  acceptedResponseId?: string;
  views: number;
  attachmentUrl?: string;
}

export interface Response {
  id: string;
  discussionId: string;
  content: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  upvotes: number;
  downvotes: number;
  isAccepted: boolean;
  parentResponseId?: string;
}

export interface CommunityMember {
  userId: string;
  communityId: string;
  role: CommunityRole;
  joinedAt: Date;
}

export interface FirestoreCommunity extends Omit<Community, 'createdAt'> {
  createdAt: Timestamp;
}

export interface FirestoreDiscussion extends Omit<Discussion, 'createdAt' | 'updatedAt'> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreResponse extends Omit<Response, 'createdAt' | 'updatedAt'> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
} 