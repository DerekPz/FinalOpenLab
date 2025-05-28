import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Project, Comment, UserComment } from '../data/types';
import { db } from '../services/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, Timestamp, getDoc, doc, updateDoc } from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { X, Heart, Star } from 'lucide-react';
import type { UserProfile } from '../types/user';

interface ProjectModalProps {
  open: boolean;
  onClose: () => void;
  project: Project | null; 
  user?: { uid: string; displayName: string | null; photoURL?: string | null };
}

export default function ProjectModal({ open, onClose, project, user }: ProjectModalProps) {
  const [comments, setComments] = React.useState<UserComment[]>([]);
  const [newComment, setNewComment] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [isLiked, setIsLiked] = React.useState(false);
  const [isFavorite, setIsFavorite] = React.useState(false);
  const [likeCount, setLikeCount] = React.useState(0);
  const navigate = useNavigate();

  // Inicializar estados de like y favorito
  React.useEffect(() => {
    if (project && user) {
      // Inicializar el contador de likes
      setLikeCount(project.likes || 0);
      
      // Verificar si el usuario actual ha dado like
      const checkLikeStatus = async () => {
        const projectDoc = await getDoc(doc(db, 'projects', project.id));
        const projectData = projectDoc.data();
        if (projectData) {
          const likedBy = projectData.likedBy || [];
          const favoritedBy = projectData.favoritedBy || [];
          setIsLiked(likedBy.includes(user.uid));
          setIsFavorite(favoritedBy.includes(user.uid));
        }
      };
      
      checkLikeStatus();
    }
  }, [project, user]);

  // Manejar likes
  const handleLike = async () => {
    if (!project || !user) return;
    
    try {
      const projectRef = doc(db, 'projects', project.id);
      const projectDoc = await getDoc(projectRef);
      const projectData = projectDoc.data();
      
      if (projectData) {
        const likedBy = projectData.likedBy || [];
        const newLikedBy = isLiked
          ? likedBy.filter((uid: string) => uid !== user.uid)
          : [...likedBy, user.uid];
        
        await updateDoc(projectRef, {
          likedBy: newLikedBy,
          likes: newLikedBy.length
        });
        
        setIsLiked(!isLiked);
        setLikeCount(newLikedBy.length);
      }
    } catch (error) {
      console.error('Error al actualizar like:', error);
    }
  };

  // Manejar favoritos
  const handleFavorite = async () => {
    if (!project || !user) return;
    
    try {
      const projectRef = doc(db, 'projects', project.id);
      const projectDoc = await getDoc(projectRef);
      const projectData = projectDoc.data();
      
      if (projectData) {
        const favoritedBy = projectData.favoritedBy || [];
        const newFavoritedBy = isFavorite
          ? favoritedBy.filter((uid: string) => uid !== user.uid)
          : [...favoritedBy, user.uid];
        
        await updateDoc(projectRef, {
          favoritedBy: newFavoritedBy
        });
        
        setIsFavorite(!isFavorite);
      }
    } catch (error) {
      console.error('Error al actualizar favorito:', error);
    }
  };

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
    
    const unsub = onSnapshot(q, async (snap) => {
      console.log('Snapshot de comentarios recibido:', snap.docs.length, 'comentarios');
      const commentsPromises = snap.docs.map(async (docSnapshot) => {
        const commentData = docSnapshot.data() as UserComment;
        // Intentar obtener la foto del perfil actualizada
        try {
          const userProfileDoc = await getDoc(doc(db, 'userProfiles', commentData.userId));
          const userProfile = userProfileDoc.data() as UserProfile | undefined;
          if (userProfile?.photoURL) {
            commentData.userPhotoURL = userProfile.photoURL;
          }
        } catch (error) {
          console.error('Error fetching user profile for comment:', error);
        }
        return { ...commentData, id: docSnapshot.id };
      });

      const newComments = await Promise.all(commentsPromises);
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
      
      // Obtener la foto del perfil del usuario
      const userProfileDoc = await getDoc(doc(db, 'userProfiles', user.uid));
      const userProfile = userProfileDoc.data();
      
      // Usar la foto del perfil, o la foto de auth, o generar un avatar por defecto
      const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user.displayName || 'A'
      )}&background=random&size=128&bold=true&color=ffffff`;
      
      const userPhotoURL = userProfile?.photoURL || user.photoURL || defaultAvatar;
      const userName = user.displayName || 'Anónimo';
      
      console.log('Creando comentario con foto:', userPhotoURL);
      
      await addDoc(collection(db, 'projects', project.id, 'comments'), {
        userId: user.uid,
        userName: userName,
        userPhotoURL: userPhotoURL,
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

  const handleUserClick = (userId: string) => {
    navigate(`/user/${userId}`);
  };

  if (!open || !project) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
        
        <div className="relative bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
          {/* Header con título y botón de cerrar */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              {project.title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
            </button>
          </div>

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
            <div className="flex items-center gap-4 mb-6">
              {user ? (
                <>
                  <button
                    onClick={handleLike}
                    className="flex items-center gap-2 text-lg transition-all duration-200 ease-in-out"
                    aria-label={isLiked ? 'Quitar like' : 'Dar like'}
                  >
                    <Heart
                      className={`w-6 h-6 transition-all duration-200 ${
                        isLiked
                          ? 'fill-red-500 text-red-500 scale-110'
                          : 'text-zinc-400 hover:text-red-500'
                      }`}
                    />
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      {likeCount}
                    </span>
                  </button>
                  <button
                    onClick={handleFavorite}
                    className="flex items-center gap-2 text-lg transition-all duration-200 ease-in-out"
                    aria-label={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                  >
                    <Star
                      className={`w-6 h-6 transition-all duration-200 ${
                        isFavorite
                          ? 'fill-yellow-400 text-yellow-400 scale-110'
                          : 'text-zinc-400 hover:text-yellow-400'
                      }`}
                    />
                  </button>
                </>
              ) : (
                <div className="text-sm text-zinc-500">
                  Inicia sesión para interactuar con el proyecto
                </div>
              )}
            </div>

            {/* Comentarios */}
            <div className="mt-8">
              <h4 className="font-semibold mb-4 text-zinc-800 dark:text-zinc-100">Comentarios</h4>
              <div className="space-y-4 max-h-48 overflow-y-auto mb-4">
                {comments.length === 0 && (
                  <div className="text-zinc-500 text-sm">No hay comentarios aún.</div>
                )}
                {comments.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-start gap-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3"
                  >
                    {/* Avatar circular clickeable */}
                    <button
                      onClick={() => handleUserClick(c.userId)}
                      className="flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
                    >
                      <img
                        src={c.userPhotoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          c.userName.charAt(0)
                        )}&background=random&size=64&bold=true&color=ffffff`}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover hover:opacity-90 transition-opacity"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            c.userName.charAt(0)
                          )}&background=random&size=64&bold=true&color=ffffff`;
                        }}
                      />
                    </button>
                    {/* Contenido del comentario */}
                    <div className="flex-1">
                      <button
                        onClick={() => handleUserClick(c.userId)}
                        className="text-sm font-semibold text-primary hover:text-primary-dark focus:outline-none focus:underline"
                      >
                        @{c.userName}
                      </button>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-2">
                        {c.createdAt?.toDate().toLocaleString()}
                      </span>
                      <div className="mt-1 text-zinc-800 dark:text-zinc-100">{c.comment}</div>
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
        </div>
      </div>
    </div>
  );
}