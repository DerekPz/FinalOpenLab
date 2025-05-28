export interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  userId: string;
  author?: string;
  visibility: 'public' | 'private';
  deleted: boolean;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  views: number;
  githubUrl?: string;
  demoUrl?: string;
  techStack?: string[];
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userPhotoURL: string;
  comment: string;
  createdAt: {
    toDate: () => Date;
  };
}

