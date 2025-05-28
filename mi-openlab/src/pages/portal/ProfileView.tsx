import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import type { UserProfile } from '../../types/user';
import UserAchievements from '../../components/profile/UserAchievements';

export default function ProfileView() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        const userRef = doc(db, 'userProfiles', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          setProfile(userDoc.data() as UserProfile);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="p-6 text-center text-zinc-600 dark:text-zinc-400">
        Cargando perfil...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 text-center text-zinc-600 dark:text-zinc-400">
        No se encontró el perfil
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Información básica del perfil */}
      <div className="bg-white dark:bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 border border-zinc-200 dark:border-zinc-700/50">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-indigo-500/50 shadow-xl">
            <img
              src={profile.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.displayName)}&background=random`}
              alt={profile.displayName}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              {profile.displayName}
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400">{profile.email}</p>
          </div>
        </div>
        {profile.bio && (
          <p className="mt-4 text-zinc-600 dark:text-zinc-300">{profile.bio}</p>
        )}
      </div>

      {/* Logros y reputación */}
      <UserAchievements
        achievements={profile.achievements || []}
        reputation={profile.reputation || 0}
        rank={profile.rank}
      />

      {/* Enlaces y redes sociales */}
      {(profile.linkedInUrl || profile.githubUrl || profile.websiteUrl) && (
        <div className="bg-white dark:bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 border border-zinc-200 dark:border-zinc-700/50">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
            Enlaces
          </h2>
          <div className="space-y-3">
            {profile.linkedInUrl && (
              <a
                href={profile.linkedInUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 rounded-lg border border-indigo-100 dark:border-indigo-500/20"
              >
                LinkedIn
              </a>
            )}
            {profile.githubUrl && (
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 rounded-lg border border-indigo-100 dark:border-indigo-500/20"
              >
                GitHub
              </a>
            )}
            {profile.websiteUrl && (
              <a
                href={profile.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 rounded-lg border border-indigo-100 dark:border-indigo-500/20"
              >
                Sitio web
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 