// src/pages/portal/DashboardView.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import type { UserProfile, FirestoreUserProfile, Project } from '../../types/user';
import { BookOpen, ThumbsUp, Users, Trophy } from 'lucide-react';

interface LikeInfo {
  userId: string;
  userName: string;
  userAvatar?: string;
  timestamp: Date;
  projectId?: string;
  projectTitle?: string;
}

interface FollowerInfo {
  userId: string;
  userName: string;
  userAvatar?: string;
  timestamp: Date;
}

export default function DashboardView() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [followers, setFollowers] = useState<FollowerInfo[]>([]);
  const [recentLikes, setRecentLikes] = useState<LikeInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        setError(null);
        
        // 1. Cargar perfil del usuario
        const userRef = doc(db, 'userProfiles', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          throw new Error('Perfil no encontrado');
        }

        const userData = userDoc.data() as FirestoreUserProfile;

        // 2. Cargar proyectos del usuario y sus likes
        const projectsRef = collection(db, 'projects');
        const projectsQuery = query(projectsRef, where('userId', '==', user.uid), where('deleted', '==', false));
        const projectsSnapshot = await getDocs(projectsQuery);
        const projects = projectsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Project));

        // 3. Cargar seguidores
        const followersRef = collection(db, `userProfiles/${user.uid}/followers`);
        const followersSnapshot = await getDocs(followersRef);
        
        const followersPromises = followersSnapshot.docs.map(async (docSnap) => {
          const followerData = docSnap.data();
          const followerProfileRef = doc(db, 'userProfiles', docSnap.id);
          const followerProfileSnap = await getDoc(followerProfileRef);
          const followerInfo = followerProfileSnap.data() as FirestoreUserProfile;
          
          return {
            userId: docSnap.id,
            userName: followerInfo?.displayName || 'Usuario',
            userAvatar: followerInfo?.photoURL,
            timestamp: followerData.timestamp instanceof Timestamp ? followerData.timestamp.toDate() : new Date()
          };
        });

        const followersData = await Promise.all(followersPromises);
        setFollowers(followersData);

        // 4. Cargar información de usuarios que dieron like
        const allLikes: LikeInfo[] = [];
        
        // Obtener todos los IDs únicos de usuarios que dieron like
        const likerIds = new Set<string>();
        projects.forEach(project => {
          const likedBy = project.likedBy || [];
          likedBy.forEach((userId: string) => likerIds.add(userId));
        });

        // Obtener información de cada usuario que dio like
        const likerPromises = Array.from(likerIds).map(async (userId: string) => {
          const likerRef = doc(db, 'userProfiles', userId);
          const likerSnap = await getDoc(likerRef);
          if (!likerSnap.exists()) return null;
          
          const likerData = likerSnap.data() as FirestoreUserProfile;
          
          // Encontrar en qué proyectos dio like este usuario
          projects.forEach(project => {
            if (project.likedBy?.includes(userId)) {
              allLikes.push({
                userId,
                userName: likerData.displayName || 'Usuario',
                userAvatar: likerData.photoURL,
                timestamp: new Date(), // Como no tenemos timestamp en likedBy, usamos la fecha actual
                projectId: project.id,
                projectTitle: project.title
              });
            }
          });
        });

        await Promise.all(likerPromises);

        // Ordenar likes (aunque no tengamos timestamp real)
        allLikes.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setRecentLikes(allLikes);

        // 5. Actualizar el perfil
        setProfile({
          uid: user.uid,
          email: user.email || '',
          displayName: userData.displayName,
          photoURL: userData.photoURL,
          bio: userData.bio,
          techStack: userData.techStack || [],
          projects: projects,
          achievements: [],
          reputation: userData.reputation || 0,
          rank: userData.rank || 0,
          createdAt: userData.createdAt instanceof Timestamp ? userData.createdAt.toDate() : new Date(),
          updatedAt: userData.updatedAt instanceof Timestamp ? userData.updatedAt.toDate() : new Date(),
          followersCount: followers.length,
          followingCount: 0,
          likesReceived: projects.reduce((total, project) => total + (project.likes || 0), 0)
        });

      } catch (error) {
        console.error('Error loading data:', error);
        setError('Error al cargar los datos. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin mb-2"></div>
          <p className="text-zinc-400">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-400">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Bienvenida */}
      <div className="bg-white dark:bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 border border-zinc-200 dark:border-zinc-700/50">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Bienvenido {profile?.displayName || user?.email?.split('@')[0] || 'usuario'} 👋
        </h1>
        <p className="text-zinc-600 dark:text-zinc-300 mt-2">
          Este es tu panel personal de OpenShelf. Aquí puedes ver un resumen de tu actividad.
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: 'Proyectos',
            value: profile?.projects?.length || 0,
            icon: BookOpen,
            color: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-100 dark:bg-blue-500/10',
            borderColor: 'border-blue-200 dark:border-blue-500/20'
          },
          {
            label: 'Seguidores',
            value: followers.length,
            icon: Users,
            color: 'text-purple-600 dark:text-purple-400',
            bgColor: 'bg-purple-100 dark:bg-purple-500/10',
            borderColor: 'border-purple-200 dark:border-purple-500/20'
          },
          {
            label: 'Reputación',
            value: profile?.reputation || 0,
            icon: Trophy,
            color: 'text-amber-600 dark:text-amber-400',
            bgColor: 'bg-amber-100 dark:bg-amber-500/10',
            borderColor: 'border-amber-200 dark:border-amber-500/20'
          },
          {
            label: 'Likes recibidos',
            value: recentLikes.length,
            icon: ThumbsUp,
            color: 'text-green-600 dark:text-green-400',
            bgColor: 'bg-green-100 dark:bg-green-500/10',
            borderColor: 'border-green-200 dark:border-green-500/20'
          }
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`bg-white dark:bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 border ${stat.borderColor}`}
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">
                    {stat.label}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detalles de Seguidores y Likes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Seguidores */}
        <div className="bg-white dark:bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 border border-zinc-200 dark:border-zinc-700/50">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">Seguidores</h2>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {followers.length > 0 ? (
              followers.map((follower) => (
                <div key={follower.userId} className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-700/30 p-3 rounded-lg border border-zinc-200 dark:border-zinc-600/50 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-600">
                    <img
                      src={follower.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(follower.userName)}&background=18181b&color=fff`}
                      alt={follower.userName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <span className="text-zinc-900 dark:text-white block font-medium">{follower.userName}</span>
                    <span className="text-zinc-500 dark:text-zinc-400 text-sm">
                      Te sigue desde {new Date(follower.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">Aún no tienes seguidores</p>
            )}
          </div>
        </div>

        {/* Lista de Likes */}
        <div className="bg-white dark:bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 border border-zinc-200 dark:border-zinc-700/50">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">Lista de Likes</h2>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {recentLikes.length > 0 ? (
              recentLikes.map((like) => (
                <div 
                  key={`${like.userId}-${like.projectId || 'profile'}-${like.timestamp.getTime()}`} 
                  className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-700/30 p-3 rounded-lg border border-zinc-200 dark:border-zinc-600/50 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-600">
                    <img
                      src={like.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(like.userName)}&background=18181b&color=fff`}
                      alt={like.userName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <span className="text-zinc-900 dark:text-white block font-medium">{like.userName}</span>
                    <span className="text-zinc-500 dark:text-zinc-400 text-sm">
                      {like.projectId ? (
                        <>Le gustó tu proyecto "{like.projectTitle}"</>
                      ) : (
                        'Le gustó tu perfil'
                      )}
                      {' • '}
                      {new Date(like.timestamp).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">Aún no has recibido likes</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
