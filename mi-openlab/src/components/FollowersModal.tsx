import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { doc, collection, getDocs, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Link } from 'react-router-dom';

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  mode: 'followers' | 'following';
}

interface FollowUser {
  id: string;
  displayName: string;
  photoURL?: string;
  timestamp: Date;
}

export default function FollowersModal({ isOpen, onClose, userId, mode }: FollowersModalProps) {
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      if (!isOpen) return;

      try {
        setLoading(true);
        setError(null);

        // Determinar la colección a consultar basado en el modo
        const collectionPath = mode === 'followers'
          ? `userProfiles/${userId}/followers`
          : `userProfiles/${userId}/following`;

        const querySnapshot = await getDocs(collection(db, collectionPath));
        
        // Obtener los datos de los usuarios
        const userPromises = querySnapshot.docs.map(async (followDoc) => {
          try {
            // Para seguidores, el ID del documento es el ID del seguidor
            // Para seguidos, el ID del documento es el ID del usuario seguido
            const targetUserId = followDoc.id;
            const userRef = doc(db, 'userProfiles', targetUserId);
            const userSnap = await getDoc(userRef);
            
            if (!userSnap.exists()) {
              console.warn(`User profile not found for ID: ${targetUserId}`);
              return null;
            }

            const userData = userSnap.data();
            return {
              id: targetUserId,
              displayName: userData.displayName,
              photoURL: userData.photoURL,
              timestamp: followDoc.data().timestamp?.toDate() || new Date()
            } as FollowUser;
          } catch (error) {
            console.error(`Error fetching user ${followDoc.id}:`, error);
            return null;
          }
        });

        const usersData = (await Promise.all(userPromises))
          .filter((user): user is FollowUser => user !== null)
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // Ordenar por más reciente primero

        setUsers(usersData);
      } catch (error) {
        console.error('Error loading users:', error);
        setError('Error al cargar los usuarios. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [isOpen, userId, mode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-black bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-zinc-800 shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-zinc-900 dark:text-white">
              {mode === 'followers' ? 'Seguidores' : 'Siguiendo'}
            </h3>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-500 dark:text-zinc-500 dark:hover:text-zinc-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-zinc-500 dark:text-zinc-400">
                {mode === 'followers'
                  ? 'No hay seguidores aún'
                  : 'No sigue a nadie aún'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map(user => (
                <Link
                  key={user.id}
                  to={`/user/${user.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition"
                >
                  <img
                    src={user.photoURL || '/default-avatar.png'}
                    alt={user.displayName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-medium text-zinc-900 dark:text-white">
                      {user.displayName}
                    </h4>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {new Date(user.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 