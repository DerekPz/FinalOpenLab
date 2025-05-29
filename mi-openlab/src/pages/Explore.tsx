import { useState, useEffect } from 'react';
import ProjectCard from '../components/ProjectCard';
import ExploreHeader from '../components/explore/ExploreHeader';
import ProjectModal from '../components/ProjectModal';
import { collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import type { Project } from '../data/types';
import { updateReputation } from '../services/reputation';
import { addFavorite, removeFavorite } from '../services/favorites';

type ProjectWithFavorite = Project & { 
  isFavorite?: boolean;
  isLiked?: boolean;
  likedBy?: string[];
  favoritedBy?: string[];
};

export default function Explore() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Todas');
  const [category, setCategory] = useState('Todas');
  const [projects, setProjects] = useState<ProjectWithFavorite[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectWithFavorite | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      const snapshot = await getDocs(collection(db, 'projects'));
      const results = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          const project: ProjectWithFavorite = {
            id: doc.id,
            title: data.title ?? '',
            description: data.description ?? '',
            tags: data.tags ?? [],
            visibility: data.visibility ?? 'public',
            imageUrl: data.imageUrl,
            userId: data.userId ?? '',
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            deleted: data.deleted ?? false,
            author: data.author ?? '',
            likes: data.likes ?? 0,
            views: data.views ?? 0,
            githubUrl: data.githubUrl,
            demoUrl: data.demoUrl,
            techStack: data.techStack ?? [],
            likedBy: data.likedBy ?? [],
            favoritedBy: data.favoritedBy ?? [],
            isLiked: user ? (data.likedBy ?? []).includes(user.uid) : false,
            isFavorite: user ? (data.favoritedBy ?? []).includes(user.uid) : false,
          };
          return project;
        })
        .filter((project) => !project.deleted && project.visibility === 'public');
      setProjects(results);
    };
    fetchProjects();
  }, [user]);

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

        // Si es un nuevo like (no un unlike), actualizar la reputación del autor
        if (!isCurrentlyLiked) {
          await updateReputation(
            projectData.userId,
            'like_received',
            projectId
          );
        }
        
        // Actualizar estado local
        setProjects(prev => prev.map(p => {
          if (p.id === projectId) {
            return {
              ...p,
              likes: newLikedBy.length,
              likedBy: newLikedBy,
              isLiked: !isCurrentlyLiked
            };
          }
          return p;
        }));
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
        
        // Actualizar estado local
        setProjects(prev => prev.map(p => {
          if (p.id === projectId) {
            return {
              ...p,
              favoritedBy: newFavoritedBy,
              isFavorite: !isCurrentlyFavorite
            };
          }
          return p;
        }));
      }
    } catch (error) {
      console.error('Error al actualizar favorito:', error);
    }
  };

  const filteredProjects = projects.filter((project) => {
    const searchMatch =
      project.title?.toLowerCase().includes(search.toLowerCase()) ||
      project.description?.toLowerCase().includes(search.toLowerCase()) ||
      project.author?.toLowerCase().includes(search.toLowerCase()) ||
      (project.tags && project.tags.some((tag: string) => tag.toLowerCase().includes(search.toLowerCase())));

    const categoryMatch =
      category === 'Todas' || (project.tags && project.tags.includes(category));

    const filterMatch =
      filter === 'Todas' ||
      (filter === 'Favoritos' && project.isFavorite) ||
      (filter === 'Populares' && (project.likes ?? 0) > 30) ||
      (filter === 'Recientes' && project.createdAt);

    return searchMatch && categoryMatch && filterMatch;
  });

  return (
    <div className="min-h-screen w-full bg-zinc-50/80 dark:bg-zinc-900">
      <div className="w-full max-w-[2000px] mx-auto px-4 py-6 sm:py-10 sm:px-6 lg:px-8">
        <div className="pt-16 sm:pt-20 pb-8 sm:pb-12">
          <ExploreHeader
            search={search}
            setSearch={setSearch}
            filter={filter}
            setFilter={setFilter}
            category={category}
            setCategory={setCategory}
          />
        </div>

        {filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16">
            <div className="flex flex-col items-center justify-center gap-3 text-center px-4">
              <div className="text-4xl sm:text-5xl">🔎</div>
              <h3 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                No se encontraron proyectos
              </h3>
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-sm">
                Intenta ajustar los filtros o usa otras palabras clave.
              </p>
            </div>
          </div>
        ) : (
          <section className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                projectId={project.id}
                title={project.title ?? ''}
                description={project.description ?? ''}
                imageUrl={project.imageUrl ?? ''}
                tags={project.tags ?? []}
                author={project.author ?? ''}
                likes={project.likes ?? 0}
                isLiked={project.isLiked}
                isFavorite={project.isFavorite}
                demoUrl={project.demoUrl}
                githubUrl={project.githubUrl}
                onClick={() => {
                  setSelectedProject(project);
                  setModalOpen(true);
                }}
                onLike={() => handleLike(project.id)}
                onFavorite={() => handleFavorite(project.id)}
              />
            ))}
          </section>
        )}

        {/* Modal */}
        <ProjectModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          project={selectedProject as Project}
          user={user || undefined}
        />
      </div>
    </div>
  );
}
