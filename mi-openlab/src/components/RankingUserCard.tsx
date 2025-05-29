import { Trophy, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { UserProfile } from '../types/user';

interface RankingUserCardProps {
  user: UserProfile & { rank: number };
}

export default function RankingUserCard({ user }: RankingUserCardProps) {
  return (
    <Link 
      to={`/user/${user.uid}`}
      className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4 hover:bg-white/50 dark:hover:bg-zinc-700/50 transition-all group w-full"
    >
      {/* Foto de perfil y badge */}
      <div className="relative flex-shrink-0">
        <img
          src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=random`}
          alt={user.displayName}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-zinc-200/50 dark:border-zinc-700/50 group-hover:border-indigo-500/50 dark:group-hover:border-indigo-400/50 transition-all"
        />
        {user.isTopRanked && (
          <div 
            className="absolute -top-1 -right-1 bg-gradient-to-br from-yellow-400 to-yellow-600 text-white p-1.5 rounded-full shadow-lg"
            title="Top 1 del Ranking"
          >
            <Trophy className="w-3 h-3" />
          </div>
        )}
      </div>

      {/* Información del usuario */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-zinc-900 dark:text-white truncate">
            {user.displayName}
          </h3>
          {user.isTopRanked && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/80 dark:text-yellow-200">
              <Trophy className="w-3 h-3" />
              Top #1
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 flex-wrap">
          <div className="flex items-center gap-1" title="Proyectos publicados">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-500 dark:text-indigo-400" />
            <span>{user.projectCount || 0} proyectos publicados</span>
          </div>
          <span className="hidden sm:inline">•</span>
          <span>{user.followersCount || 0} seguidores</span>
        </div>
      </div>

      {/* Puntos y ranking */}
      <div className="text-right flex-shrink-0">
        <div className="font-semibold text-sm sm:text-base text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
          {user.reputation} pts
        </div>
        <div className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
          Rank #{user.rank}
        </div>
      </div>
    </Link>
  );
} 