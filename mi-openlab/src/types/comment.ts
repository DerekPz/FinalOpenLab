export interface FirebaseTimestamp {
  toDate(): Date;
  seconds: number;
  nanoseconds: number;
}

export interface UserComment {
  id: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  comment: string;
  createdAt: FirebaseTimestamp;
} 