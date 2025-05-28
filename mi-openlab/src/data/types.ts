export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];              // <- asegúrate que es un array de strings
  visibility: 'public' | 'private';
  github?: string;
  demo?: string;
  imageUrl?: string;           // <- puede ser opcional
  userId: string;
  createdAt?: any;             // o Timestamp si lo estás usando con Firebase
  deleted?: boolean;
    author?: string;
  likes?: number;
  favoritedBy?: string[];
  likedBy?: string[];
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  comment: string;
  createdAt: any; // o Timestamp si usas Firebase Timestamp
}

