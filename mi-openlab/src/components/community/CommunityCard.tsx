import { Link } from 'react-router-dom';
import { Users, MessageSquare } from 'lucide-react';
import type { Community } from '../../types/community';

interface CommunityCardProps {
  community: Community;
  memberCount: number;
  discussionCount: number;
}

export default function CommunityCard({
  community,
  memberCount,
  discussionCount
}: CommunityCardProps) {
  return (
    <Link
      to={`/communities/${community.id}`}
      className="block bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden hover:border-indigo-500/50 dark:hover:border-indigo-400/50 transition-all group"
    >
      {/* Header con imagen */}
      <div className="relative h-32 bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden">
        {community.imageUrl && (
          <img
            src={community.imageUrl}
            alt={community.name}
            className="w-full h-full object-cover opacity-50"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4">
          <h3 className="text-lg font-semibold text-white truncate max-w-[200px]">
            {community.name}
          </h3>
          <span className="inline-block px-2 py-1 text-xs font-medium text-white/90 bg-white/10 rounded-full backdrop-blur-sm">
            {community.category}
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4">
        <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-4">
          {community.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {community.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-full"
            >
              {tag}
            </span>
          ))}
          {community.tags.length > 3 && (
            <span className="px-2 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-700/50 rounded-full">
              +{community.tags.length - 3}
            </span>
          )}
        </div>

        {/* Estadísticas */}
        <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{memberCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            <span>{discussionCount}</span>
          </div>
        </div>
      </div>
    </Link>
  );
} 