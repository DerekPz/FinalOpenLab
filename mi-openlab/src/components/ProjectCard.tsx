// src/components/ProjectCard.tsx
import type { FC } from 'react';

export interface ProjectCardProps {
  projectId: string;
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
  author: string;
  likes: number;
  isFavorite?: boolean;
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
  isFavorite = false,
  onLike,
  onFavorite,
  onClick,
}) => {
  return (
    <article
      className="rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-dark border border-gray-200 dark:border-gray-700 transition hover:shadow-lg cursor-pointer"
      onClick={onClick}
      aria-label={`Ver detalles del proyecto ${title}`}
    >
      <img
        src={imageUrl}
        alt={`Imagen del proyecto ${title}`}
        className="w-full h-48 object-cover"
      />

      <div className="p-4 space-y-2">
        <h2 className="text-lg font-semibold text-dark dark:text-white">{title}</h2>
        <p className="text-sm text-muted dark:text-gray-400">
          {description.length > 60
            ? description.slice(0, 60) + '...'
            : description}
        </p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="bg-accent text-sm text-primary px-2 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between mt-3 text-sm text-muted dark:text-gray-400">
          <span className="truncate">👤 {author}</span>
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLike?.();
              }}
              className="hover:text-red-500 transition"
              aria-label="Dar like"
            >
              ❤️ {likes}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onFavorite?.();
              }}
              className={`hover:text-yellow-500 transition ${isFavorite ? 'text-yellow-500' : ''}`}
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
