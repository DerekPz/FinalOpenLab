import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Project } from '../data/types';
import type { UserComment } from '../types/user';
import { db } from '../services/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, Timestamp, getDoc, doc, updateDoc } from 'firebase/firestore';
import { X, Heart, Star, ExternalLink } from 'lucide-react';
import type { UserProfile } from '../types/user';
import { addFavorite, removeFavorite } from '../services/favorites';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { User } from 'firebase/auth';
import type { FirebaseTimestamp } from '../types/comment';
import { logUserActivity } from '../services/userActivity';
import { updateReputation } from '../services/reputation';


interface ProjectModalProps {
  open: boolean;
  onClose: () => void;
  project: Project;
  user?: User;
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
        
        // Actualizar el proyecto
        await updateDoc(projectRef, {
          favoritedBy: newFavoritedBy
        });

        // Actualizar la colección de favoritos del usuario
        if (isFavorite) {
          await removeFavorite(user.uid, project.id);
        } else {
          await addFavorite(user.uid, project.id);
        }
        
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
        // Obtener el perfil actualizado del usuario para cada comentario
        try {
          const userProfileDoc = await getDoc(doc(db, 'userProfiles', commentData.userId));
          const userProfile = userProfileDoc.data() as UserProfile | undefined;
          if (userProfile) {
            commentData.userName = userProfile.displayName; // Usar el nombre actualizado
            commentData.userPhotoURL = userProfile.photoURL || commentData.userPhotoURL;
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
      
      // Obtener el perfil actualizado del usuario
      const userProfileDoc = await getDoc(doc(db, 'userProfiles', user.uid));
      const userProfile = userProfileDoc.data() as UserProfile;
      
      // Usar el nombre del perfil en lugar del nombre de auth
      const userName = userProfile?.displayName || user.displayName || 'Anónimo';
      const userPhotoURL = userProfile?.photoURL || user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random&size=128&bold=true&color=ffffff`;
      
      console.log('Creando comentario con nombre:', userName);
      
      await addDoc(collection(db, 'projects', project.id, 'comments'), {
        userId: user.uid,
        userName: userName,
        userPhotoURL: userPhotoURL,
        comment: newComment.trim(),
        createdAt: Timestamp.now(),
      });
      // Registrar actividad de comentario en el historial
      await logUserActivity(
        user.uid,
        'comment',
        `Comentaste en el proyecto "${project.title}"`,
        project.id
      );
      if (project.userId !== user.uid) {
        await updateReputation(project.userId, 'comment_received', project.id);
      }
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

  const formatDate = (date: FirebaseTimestamp) => {
    return formatDistanceToNow(date.toDate(), { addSuffix: true, locale: es });
  };

  if (!open || !project) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose}></div>
        
        <div className="relative bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
          {/* Header con título y botón de cerrar */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-zinc-200 dark:border-zinc-700">
            <h2 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-white line-clamp-1 pr-2">
              {project.title}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-500 dark:text-zinc-400" />
            </button>
          </div>

          <div className="overflow-y-auto p-4 sm:p-6 flex-1 custom-scrollbar">
            <div className="space-y-4 sm:space-y-6">
              {/* Imagen del proyecto */}
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                <img
                  src={project.imageUrl || 'https://via.placeholder.com/600x300'}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Información del proyecto */}
              <div className="space-y-4">
                {/* Autor y metadatos */}
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                    <span className="font-medium">Autor:</span>
                    <span>{project.author || 'Anónimo'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {user ? (
                      <>
                        <button
                          onClick={handleLike}
                          className="flex items-center gap-1.5 transition-all duration-200"
                          aria-label={isLiked ? 'Quitar like' : 'Dar like'}
                        >
                          <Heart
                            className={`w-5 h-5 transition-all duration-200 ${
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
                          className="flex items-center gap-1.5 transition-all duration-200"
                          aria-label={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                        >
                          <Star
                            className={`w-5 h-5 transition-all duration-200 ${
                              isFavorite
                                ? 'fill-yellow-400 text-yellow-400 scale-110'
                                : 'text-zinc-400 hover:text-yellow-400'
                            }`}
                          />
                        </button>
                      </>
                    ) : (
                      <div className="text-sm text-zinc-500 dark:text-zinc-400">
                        Inicia sesión para interactuar
                      </div>
                    )}
                  </div>
                </div>

                {/* Descripción */}
                <p className="text-sm sm:text-base text-zinc-700 dark:text-zinc-200 whitespace-pre-line">
                  {project.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {project.tags?.map(tag => (
                    <span 
                      key={tag} 
                      className="bg-indigo-100 dark:bg-indigo-500/20 text-xs sm:text-sm text-indigo-800 dark:text-indigo-300 px-2.5 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Enlaces */}
                <div className="flex flex-wrap gap-4 pt-2">
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
                    >
                      <ExternalLink size={16} />
                      Ver demo
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
                    >
                      <ExternalLink size={16} />
                      Ver código
                    </a>
                  )}
                </div>
              </div>

              {/* Comentarios */}
              <div className="pt-4 sm:pt-6 border-t border-zinc-200 dark:border-zinc-700">
                <h4 className="font-semibold mb-4 text-zinc-800 dark:text-zinc-100">
                  Comentarios
                </h4>
                <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
                  {comments.length === 0 ? (
                    <div className="text-zinc-500 dark:text-zinc-400 text-sm">
                      No hay comentarios aún.
                    </div>
                  ) : (
                    comments.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-start gap-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3"
                      >
                        <button
                          onClick={() => handleUserClick(c.userId)}
                          className="flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
                        >
                          <img
                            src={c.userPhotoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              c.userName.charAt(0)
                            )}&background=random&size=64&bold=true&color=ffffff`}
                            alt=""
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover hover:opacity-90 transition-opacity"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                c.userName.charAt(0)
                              )}&background=random&size=64&bold=true&color=ffffff`;
                            }}
                          />
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm text-zinc-900 dark:text-white truncate">
                              {c.userName}
                            </span>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">
                              {formatDate(c.createdAt as FirebaseTimestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-zinc-700 dark:text-zinc-300 break-words">
                            {c.comment}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Formulario de comentarios */}
                {user && (
                  <form onSubmit={handleComment} className="mt-4">
                    <div className="flex gap-3">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Escribe un comentario..."
                        className="flex-1 min-h-[80px] rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-3 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                      />
                    </div>
                    <div className="flex justify-end mt-3">
                      <button
                        type="submit"
                        disabled={!newComment.trim() || loading}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {loading ? 'Enviando...' : 'Comentar'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}