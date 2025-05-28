import { Trophy } from 'lucide-react';
import type { UserProfile } from '../types/user';

interface UserProfileCardProps {
  profile: UserProfile;
  showStats?: boolean;
}

export default function UserProfileCard({ profile, showStats = true }: UserProfileCardProps) {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-6">
      <div className="flex items-start gap-6">
        {/* Foto de perfil con badge de top rank */}
        <div className="relative">
          <img
            src={profile.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.displayName)}&background=random`}
            alt={profile.displayName}
            className="w-20 h-20 rounded-full object-cover border-2 border-zinc-100 dark:border-zinc-700"
          />
          {profile.isTopRanked && (
            <div 
              className="absolute -top-2 -right-2 bg-gradient-to-br from-yellow-400 to-yellow-600 text-white p-1.5 rounded-full shadow-lg animate-pulse"
              title="Top 1 del Ranking"
            >
              <Trophy className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Información del usuario */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              {profile.displayName}
            </h2>
            {profile.isTopRanked && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                Top #1 🏆
              </span>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2">
              {profile.bio}
            </p>
          )}

          {/* Estadísticas */}
          {showStats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Reputación</p>
                <p className="font-semibold text-primary">{profile.reputation} pts</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Proyectos</p>
                <p className="font-semibold text-zinc-900 dark:text-white">{profile.projectCount}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Seguidores</p>
                <p className="font-semibold text-zinc-900 dark:text-white">{profile.followersCount}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Likes</p>
                <p className="font-semibold text-zinc-900 dark:text-white">{profile.likesReceived}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 