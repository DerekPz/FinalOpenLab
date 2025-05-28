import { Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { UserProfile } from '../types/user';

interface RankingUserCardProps {
  user: UserProfile & { rank: number };
}

export default function RankingUserCard({ user }: RankingUserCardProps) {
  return (
    <Link 
      to={`/user/${user.uid}`}
      className="flex items-center gap-4 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition cursor-pointer"
    >
      {/* Foto de perfil y badge */}
      <div className="relative">
        <img
          src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=random`}
          alt={user.displayName}
          className="w-12 h-12 rounded-full object-cover border-2 border-zinc-100 dark:border-zinc-700"
        />
        {user.isTopRanked && (
          <div 
            className="absolute -top-1 -right-1 bg-gradient-to-br from-yellow-400 to-yellow-600 text-white p-1 rounded-full shadow-lg animate-pulse"
            title="Top 1 del Ranking"
          >
            <Trophy className="w-3 h-3" />
          </div>
        )}
      </div>

      {/* Información del usuario */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-zinc-900 dark:text-white">
            {user.displayName}
          </h3>
          {user.isTopRanked && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              Top #1 🏆
            </span>
          )}
        </div>
      </div>

      {/* Puntos y ranking */}
      <div className="text-right">
        <div className="font-semibold text-zinc-900 dark:text-white">
          {user.reputation} pts
        </div>
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          Rank #{user.rank}
        </div>
      </div>
    </Link>
  );
} 