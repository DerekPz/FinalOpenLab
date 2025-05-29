import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getFavoriteProjects } from '../../services/favorites';
import { getLikedProjects } from '../../services/likes';
import type { Project } from '../../data/types';
import ProjectCard from '../../components/ProjectCard';
import ProjectModal from '../../components/ProjectModal';
import { Star, Heart } from 'lucide-react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { addFavorite, removeFavorite } from '../../services/favorites';

type ViewMode = 'favorites' | 'likes';

export default function FavoritesView() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('favorites');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const loadProjects = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);
        
        const projectsData = viewMode === 'favorites' 
          ? await getFavoriteProjects(user.uid)
          : await getLikedProjects(user.uid);
        
        setProjects(projectsData);
      } catch (error) {
        console.error('Error loading projects:', error);
        setError(`Error al cargar los proyectos ${viewMode === 'favorites' ? 'favoritos' : 'con like'}`);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [user, viewMode]);

  const toggleViewMode = (mode: ViewMode) => {
    setViewMode(mode);
  };

  const handleLike = async (projectId: string) => {
    if (!user) return;
    
    try {
      const projectRef = doc(db, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);
      const projectData = projectDoc.data();
      
      if (projectData) {
        const likedBy = projectData.likedBy || [];
        const isCurrentlyLiked = likedBy.includes(user.uid);
        const newLikedBy = isCurrentlyLiked
          ? likedBy.filter((uid: string) => uid !== user.uid)
          : [...likedBy, user.uid];
        
        await updateDoc(projectRef, {
          likedBy: newLikedBy,
          likes: newLikedBy.length
        });

        // Actualizar estado local
        setProjects(prev => prev.map(p => {
          if (p.id === projectId) {
            return {
              ...p,
              likes: newLikedBy.length
            };
          }
          return p;
        }));

        // Si ya no está en la lista de likes, removerlo
        if (viewMode === 'likes' && isCurrentlyLiked) {
          setProjects(prev => prev.filter(p => p.id !== projectId));
        }
      }
    } catch (error) {
      console.error('Error al actualizar like:', error);
    }
  };

  const handleFavorite = async (projectId: string) => {
    if (!user) return;
    
    try {
      const projectRef = doc(db, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);
      const projectData = projectDoc.data();
      
      if (projectData) {
        const favoritedBy = projectData.favoritedBy || [];
        const isCurrentlyFavorite = favoritedBy.includes(user.uid);
        const newFavoritedBy = isCurrentlyFavorite
          ? favoritedBy.filter((uid: string) => uid !== user.uid)
          : [...favoritedBy, user.uid];
        
        // Actualizar el proyecto
        await updateDoc(projectRef, {
          favoritedBy: newFavoritedBy
        });

        // Actualizar la colección de favoritos del usuario
        if (isCurrentlyFavorite) {
          await removeFavorite(user.uid, projectId);
        } else {
          await addFavorite(user.uid, projectId);
        }

        // Si ya no está en favoritos, removerlo de la lista
        if (viewMode === 'favorites' && isCurrentlyFavorite) {
          setProjects(prev => prev.filter(p => p.id !== projectId));
        }
      }
    } catch (error) {
      console.error('Error al actualizar favorito:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Mis Proyectos Guardados
        </h1>
        
        {/* Filtro de vista */}
        <div className="flex items-center bg-white dark:bg-zinc-800 rounded-lg p-1 shadow-sm border border-zinc-200 dark:border-zinc-700">
          <button
            onClick={() => toggleViewMode('favorites')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
              viewMode === 'favorites'
                ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'
            }`}
          >
            <Star size={18} className={viewMode === 'favorites' ? 'fill-indigo-500' : ''} />
            <span className="text-sm font-medium">Favoritos</span>
          </button>
          <button
            onClick={() => toggleViewMode('likes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
              viewMode === 'likes'
                ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'
            }`}
          >
            <Heart size={18} className={viewMode === 'likes' ? 'fill-indigo-500' : ''} />
            <span className="text-sm font-medium">Me gusta</span>
          </button>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
            {viewMode === 'favorites' 
              ? 'No tienes proyectos favoritos'
              : 'No has dado like a ningún proyecto'}
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            {viewMode === 'favorites'
              ? 'Explora proyectos y marca como favoritos los que quieras guardar'
              : 'Explora proyectos y dale like a los que te gusten'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <ProjectCard 
              key={project.id}
              projectId={project.id}
              title={project.title}
              description={project.description || ''}
              imageUrl={project.imageUrl || ''}
              tags={project.tags || []}
              author={project.author || 'Anónimo'}
              likes={project.likes || 0}
              isLiked={viewMode === 'likes'}
              isFavorite={viewMode === 'favorites'}
              demoUrl={project.demoUrl}
              githubUrl={project.githubUrl}
              onLike={() => handleLike(project.id)}
              onFavorite={() => handleFavorite(project.id)}
              onClick={() => {
                setSelectedProject(project);
                setModalOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedProject && (
        <ProjectModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          project={selectedProject}
          user={user || undefined}
        />
      )}
    </div>
  );
} 