import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserProfile } from '../services/userProfile';
import { getProjectsByUser } from '../services/projects';
import { followUser, unfollowUser, isFollowing as checkIsFollowing } from '../services/follow';
import type { UserProfile } from '../types/user';
import type { Project } from '../data/types';
import { Linkedin, Github, Globe, ArrowLeft, UserPlus, UserMinus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getTechIconUrl } from '../utils/techStackIcons';

export default function UserProfileView() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUserFollowing, setIsUserFollowing] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      if (!userId) {
        setError('ID de usuario no proporcionado');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const [userProfile, userProjects] = await Promise.all([
          getUserProfile(userId),
          getProjectsByUser(userId)
        ]);
        
        if (!userProfile) {
          setError('Este usuario aún no ha configurado su perfil');
          setProfile(null);
          return;
        }
        
        setProfile(userProfile);
        setProjects(userProjects);

        // Verificar si el usuario actual sigue al usuario del perfil
        if (user && userId) {
          const followStatus = await checkIsFollowing(user.uid, userId);
          setIsUserFollowing(followStatus);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setError('Error al cargar el perfil. Por favor, intenta de nuevo más tarde.');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadProfile();
  }, [userId, navigate, user]);

  // Redireccionar a la vista de edición si es el propio perfil
  useEffect(() => {
    if (user && userId === user.uid) {
      navigate('/portal/profile');
    }
  }, [user, userId, navigate]);

  const handleFollow = async () => {
    if (!user || !userId) return;

    try {
      if (isUserFollowing) {
        await unfollowUser(user.uid, userId);
      } else {
        await followUser(user.uid, userId);
      }
      setIsUserFollowing(!isUserFollowing);
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
      // Mostrar un mensaje de error al usuario
      setError('Error al actualizar el seguimiento. Por favor, intenta de nuevo.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center max-w-md mx-auto p-6 bg-white dark:bg-zinc-800 rounded-xl shadow-sm">
          <div className="text-4xl mb-4">😕</div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
            Perfil no disponible
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            {error || 'No se pudo encontrar el perfil solicitado'}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-600 transition"
          >
            Volver atrás
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Header con botón volver */}
      <div className="sticky top-0 z-10 bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Volver</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Cabecera del perfil */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="w-32 h-32 flex-shrink-0">
                <img
                  src={profile?.photoURL || '/default-avatar.png'}
                  alt={profile?.displayName}
                  className="w-full h-full rounded-full object-cover border-4 border-white dark:border-zinc-700 shadow-lg"
                />
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                      {profile?.displayName}
                    </h1>
                    <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                      {profile?.bio || 'Sin biografía'}
                    </p>
                  </div>
                  
                  {user && user.uid !== userId && (
                    <button
                      onClick={handleFollow}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition w-full sm:w-auto justify-center ${
                        isUserFollowing
                          ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-primary text-white hover:bg-indigo-600'
                      }`}
                    >
                      {isUserFollowing ? (
                        <>
                          <UserMinus className="w-5 h-5" />
                          Dejar de seguir
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-5 h-5" />
                          Seguir
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Enlaces profesionales */}
                <div className="mt-6 flex flex-wrap justify-center sm:justify-start gap-4">
                  {profile?.linkedInUrl && (
                    <a
                      href={profile.linkedInUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:text-indigo-700 transition"
                    >
                      <Linkedin className="w-5 h-5" />
                      LinkedIn
                    </a>
                  )}
                  {profile?.githubUrl && (
                    <a
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white transition"
                    >
                      <Github className="w-5 h-5" />
                      GitHub
                    </a>
                  )}
                  {profile?.websiteUrl && (
                    <a
                      href={profile.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white transition"
                    >
                      <Globe className="w-5 h-5" />
                      Sitio web
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stack tecnológico */}
          {profile?.techStack && profile.techStack.length > 0 && (
            <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 sm:p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">Stack Tecnológico</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {profile.techStack.map(tech => (
                  <div
                    key={tech.name}
                    className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-700 rounded-lg"
                  >
                    <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-white dark:bg-zinc-800 rounded-lg">
                      <img
                        src={getTechIconUrl(tech.name)}
                        alt={`${tech.name} logo`}
                        className="w-6 h-6"
                        onError={(e) => {
                          e.currentTarget.src = getTechIconUrl('code');
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-zinc-900 dark:text-white truncate">{tech.name}</h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {tech.level} · {tech.yearsOfExperience} {tech.yearsOfExperience === 1 ? 'año' : 'años'} de experiencia
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Proyectos del usuario */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 sm:p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">Proyectos</h2>
            
            {projects.length === 0 ? (
              <p className="text-zinc-600 dark:text-zinc-400 text-center py-8">
                Este usuario aún no ha publicado ningún proyecto
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {projects.map(project => (
                  <div
                    key={project.id}
                    className="group relative bg-zinc-50 dark:bg-zinc-700 rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition"
                    onClick={() => {/* TODO: Abrir modal de proyecto */}}
                  >
                    <div className="aspect-video">
                      <img
                        src={project.imageUrl || '/project-placeholder.png'}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:opacity-75 transition"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-zinc-900 dark:text-white mb-2 truncate">
                        {project.title}
                      </h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                        {project.description}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {project.tags?.map(tag => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-1 bg-zinc-200 dark:bg-zinc-600 text-zinc-700 dark:text-zinc-300 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 