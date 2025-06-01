import { db } from './firebase';
import { collection, addDoc, query, where, orderBy, limit, getDocs, serverTimestamp } from 'firebase/firestore';
import type { UserActivity, UserActivityType } from '../types/userActivity';

export async function logUserActivity(
  userId: string,
  type: UserActivityType,
  description: string,
  relatedId?: string,
  extra?: any
) {
  await addDoc(collection(db, 'userActivities'), {
    userId,
    type,
    description,
    relatedId: relatedId || null,
    extra: extra || null,
    timestamp: serverTimestamp(),
  });
}

export async function getUserActivity(userId: string, max = 20): Promise<UserActivity[]> {
  const q = query(
    collection(db, 'userActivities'),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc'),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp?.toDate?.() || new Date(),
  })) as UserActivity[];
} 