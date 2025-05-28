import Modal from 'react-modal';
import type { Project } from '../data/types';
import { X } from 'lucide-react';

interface Props {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => Promise<void>;
  isOwner?: boolean;
}

Modal.setAppElement('#root');

export default function ProjectDetailModal({ project, isOpen, onClose, onEdit, onDelete, isOwner }: Props) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Detalles del Proyecto"
      className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg bg-white dark:bg-zinc-900 shadow-xl p-6 custom-scrollbar-styling"
      overlayClassName="fixed inset-0 z-50 flex justify-center items-center bg-gradient-to-br from-black/70 via-zinc-900/60 to-black/70 backdrop-blur-sm px-2"
    >
      {/* Botón de cierre */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 dark:hover:text-white transition-colors"
      >
        <X size={22} />
      </button>

      <h2 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-white">
        {project.title}
      </h2>

      <img
        src={project.imageUrl || 'https://via.placeholder.com/500'}
        alt={project.title}
        className="w-full h-64 object-cover rounded-lg mb-4"
      />

      <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm leading-relaxed">
        {project.description}
      </p>

      {project.tags && project.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tags.map(tag => (
            <span
              key={tag}
              className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 text-xs font-medium px-2 py-1 rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-4 mb-6">
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-500 underline hover:text-indigo-400 text-sm"
          >
            Ver GitHub
          </a>
        )}
        {project.demoUrl && (
          <a
            href={project.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-500 underline hover:text-indigo-400 text-sm"
          >
            Ver demo
          </a>
        )}
      </div>

      {isOwner && (
        <div className="flex gap-4 justify-end">
          <button
            onClick={onEdit}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
          >
            Editar
          </button>
          <button
            onClick={onDelete}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Eliminar
          </button>
        </div>
      )}
    </Modal>
  );
}
