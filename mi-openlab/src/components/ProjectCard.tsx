// src/components/ProjectCard.tsx
import type { FC } from 'react';
import { ExternalLink, Heart, Star } from 'lucide-react';

export interface ProjectCardProps {
  projectId: string;
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
  author: string;
  likes: number;
  isLiked?: boolean;
  isFavorite?: boolean;
  demoUrl?: string;
  githubUrl?: string;
  onLike?: () => void;
  onFavorite?: () => void;
  onClick?: () => void;
}

const ProjectCard: FC<ProjectCardProps> = ({
  title,
  description,
  imageUrl,
  tags,
  author,
  likes,
  isLiked,
  isFavorite = false,
  demoUrl,
  githubUrl,
  onLike,
  onFavorite,
  onClick,
}) => {
  const handleLinkClick = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <article
      className="rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-zinc-800/50 dark:backdrop-blur-sm border border-zinc-200 dark:border-zinc-700/50 transition hover:shadow-lg dark:hover:bg-zinc-800/70 dark:hover:border-zinc-600/50 cursor-pointer flex flex-col h-full"
      onClick={onClick}
      aria-label={`Ver detalles del proyecto ${title}`}
    >
      <div className="relative aspect-video">
        <img
          src={imageUrl}
          alt={`Imagen del proyecto ${title}`}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex flex-col flex-1 p-3 sm:p-4 space-y-2 sm:space-y-3">
        <h2 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">{title}</h2>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
          {description}
        </p>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="bg-indigo-100 dark:bg-indigo-500/20 text-xs text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded-full"
            >
              #{tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400 px-2 py-0.5">
              +{tags.length - 3}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-auto pt-2">
          {demoUrl && (
            <button
              onClick={(e) => handleLinkClick(e, demoUrl)}
              className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              <ExternalLink size={12} className="flex-shrink-0" />
              <span>Demo</span>
            </button>
          )}
          {githubUrl && (
            <button
              onClick={(e) => handleLinkClick(e, githubUrl)}
              className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              <ExternalLink size={12} className="flex-shrink-0" />
              <span>GitHub</span>
            </button>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-700/50">
          <span className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 truncate max-w-[120px] sm:max-w-[150px]">
            👤 {author}
          </span>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLike?.();
              }}
              className="flex items-center gap-1 transition-all duration-200"
              aria-label={isLiked ? 'Quitar like' : 'Dar like'}
            >
              <Heart
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-200 ${
                  isLiked
                    ? 'fill-red-500 text-red-500 scale-110'
                    : 'text-zinc-400 hover:text-red-500'
                }`}
              />
              <span className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                {likes}
              </span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onFavorite?.();
              }}
              className="transition-all duration-200"
              aria-label={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            >
              <Star
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-200 ${
                  isFavorite
                    ? 'fill-yellow-400 text-yellow-400 scale-110'
                    : 'text-zinc-400 hover:text-yellow-400'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ProjectCard;
