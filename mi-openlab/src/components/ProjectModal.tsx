import * as React from 'react';
import type { Project, Comment } from '../data/types';
import { db } from '../services/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';

interface ProjectModalProps {
  open: boolean;
  onClose: () => void;
  project: Project | null; 
  user?: { uid: string; displayName: string | null };
}

export default function ProjectModal({ open, onClose, project, user }: ProjectModalProps) {
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [newComment, setNewComment] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  // Escuchar comentarios en tiempo real
  React.useEffect(() => {
    if (!project) {
      console.log('No hay proyecto, no se pueden cargar comentarios');
      return;
    }
    console.log('Configurando listener de comentarios para proyecto:', project.id);
    
    const q = query(
      collection(db, 'projects', project.id, 'comments'),
      orderBy('createdAt', 'asc')
    );
    
    const unsub = onSnapshot(q, (snap) => {
      console.log('Snapshot de comentarios recibido:', snap.docs.length, 'comentarios');
      const newComments = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Comment));
      console.log('Comentarios procesados:', newComments);
      setComments(newComments);
    }, (error) => {
      console.error('Error en el listener de comentarios:', error);
    });

    return () => {
      console.log('Limpiando listener de comentarios');
      unsub();
    };
  }, [project]);

  // Agregar comentario
  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || !project) return;
    
    try {
      setLoading(true);
      const userName = user.displayName || 'Anónimo';
      console.log('Nombre de usuario a usar:', userName);
      
      await addDoc(collection(db, 'projects', project.id, 'comments'), {
        userId: user.uid,
        userName: userName,
        comment: newComment.trim(),
        createdAt: Timestamp.now(),
      });
      setNewComment('');
    } catch (error) {
      console.error('Error al guardar el comentario:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!open || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-3xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center py-4 px-6 border-b border-zinc-200 dark:border-zinc-700">
          <h3 className="font-bold text-xl text-zinc-800 dark:text-zinc-100">{project.title}</h3>
          <button
            onClick={onClose}
            className="size-8 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
            aria-label="Cerrar"
          >
            <svg className="w-5 h-5 text-zinc-700 dark:text-zinc-200" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
        {/* Content */}
        <div className="overflow-y-auto p-6 flex-1">
          <img
            src={project.imageUrl || 'https://via.placeholder.com/600x300'}
            alt={project.title}
            className="w-full rounded-lg mb-4 max-h-64 object-cover"
          />
          <div className="mb-2 text-zinc-600 dark:text-zinc-300">
            <span className="font-semibold">Autor:</span> {project.author || 'Anónimo'}
          </div>
          <div className="mb-4 text-zinc-700 dark:text-zinc-200">{project.description}</div>
          <div className="mb-4 flex flex-wrap gap-2">
            {project.tags?.map(tag => (
              <span key={tag} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">#{tag}</span>
            ))}
          </div>
          <div className="flex items-center gap-2 text-lg mb-6">
            <span>❤️ {project.likes ?? 0}</span>
          </div>
          {/* Comentarios */}
          <div className="mt-8">
            <h4 className="font-semibold mb-2 text-zinc-800 dark:text-zinc-100">Comentarios</h4>
            <div className="space-y-4 max-h-48 overflow-y-auto mb-4">
              {comments.length === 0 && (
                <div className="text-zinc-500 text-sm">No hay comentarios aún.</div>
              )}
              {comments.map((c) => (
                <div
                  key={c.id}
                  className="flex items-start gap-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3"
                >
                  {/* Avatar circular */}
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                      c.userName || "A"
                    )}&background=random&size=64`}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {/* Contenido del comentario */}
                  <div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 font-semibold">
                      @{c.userName || "Anónimo"}{" "}
                      <span className="font-normal">
                        · {c.createdAt?.toDate().toLocaleString()}
                      </span>
                    </div>
                    <div className="text-zinc-800 dark:text-zinc-100">{c.comment}</div>
                  </div>
                </div>
              ))}
            </div>
            {user ? (
              <form onSubmit={handleComment} className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100"
                  placeholder="Escribe un comentario..."
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  disabled={loading}
                  maxLength={300}
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
                  disabled={loading || !newComment.trim()}
                >
                  Comentar
                </button>
              </form>
            ) : (
              <div className="text-zinc-500 text-sm">Inicia sesión para comentar.</div>
            )}
          </div>
        </div>
        {/* Footer */}
        <div className="flex justify-end items-center gap-x-2 py-3 px-6 border-t border-zinc-200 dark:border-zinc-700">
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}