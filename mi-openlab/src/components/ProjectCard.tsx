// src/components/ProjectCard.tsx
import type { FC } from 'react';
import { ExternalLink } from 'lucide-react';

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
      className="rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-zinc-800/50 dark:backdrop-blur-sm border border-zinc-200 dark:border-zinc-700/50 transition hover:shadow-lg dark:hover:bg-zinc-800/70 dark:hover:border-zinc-600/50 cursor-pointer"
      onClick={onClick}
      aria-label={`Ver detalles del proyecto ${title}`}
    >
      <img
        src={imageUrl}
        alt={`Imagen del proyecto ${title}`}
        className="w-full h-48 object-cover"
      />

      <div className="p-4 space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {description.length > 60
            ? description.slice(0, 60) + '...'
            : description}
        </p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="bg-indigo-100 dark:bg-indigo-500/20 text-sm text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          {demoUrl && (
            <button
              onClick={(e) => handleLinkClick(e, demoUrl)}
              className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              <ExternalLink size={14} />
              Demo
            </button>
          )}
          {githubUrl && (
            <button
              onClick={(e) => handleLinkClick(e, githubUrl)}
              className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              <ExternalLink size={14} />
              GitHub
            </button>
          )}
        </div>

        <div className="flex items-center justify-between mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          <span className="truncate">👤 {author}</span>
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLike?.();
              }}
              className={`hover:text-red-500 dark:hover:text-red-400 transition ${isLiked ? 'text-red-500 dark:text-red-500' : ''}`}
              aria-label="Dar like"
            >
              ❤️ {likes}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onFavorite?.();
              }}
              className={`hover:text-yellow-500 dark:hover:text-yellow-400 transition ${isFavorite ? 'text-yellow-500 dark:text-yellow-500' : ''}`}
              aria-label="Marcar como favorito"
            >
              ⭐
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ProjectCard;
