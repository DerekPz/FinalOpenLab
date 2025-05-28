import { useState, useEffect } from 'react';
import ProjectCard from '../components/ProjectCard';
import ExploreHeader from '../components/explore/ExploreHeader';
import ProjectModal from '../components/ProjectModal';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import type { Project } from '../data/types';

type ProjectWithFavorite = Project & { isFavorite?: boolean };

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
          return {
            id: doc.id,
            title: data.title ?? '',
            description: data.description ?? '',
            tags: data.tags ?? [], // <-- asegura array
            visibility: data.visibility ?? 'public',
            github: data.github,
            demo: data.demo,
            imageUrl: data.imageUrl,
            userId: data.userId ?? '', // <-- asegura string
            createdAt: data.createdAt,
            deleted: data.deleted,
            author: data.author,
            likes: data.likes,
            favoritedBy: data.favoritedBy,
            likedBy: data.likedBy,
          } as Project;
        })
        .filter((project) => !project.deleted && project.visibility === 'public');
      setProjects(results);
    };
    fetchProjects();
  }, []);

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
      (filter === 'Recientes' && Number(project.id) > 2); // Simulación

    return searchMatch && categoryMatch && filterMatch;
  });

  return (
    <div className="min-h-screen px-4 py-10 sm:px-8 lg:px-20 bg-light dark:bg-darkBackground text-darkText dark:text-white">
      <ExploreHeader
        search={search}
        setSearch={setSearch}
        filter={filter}
        setFilter={setFilter}
        category={category}
        setCategory={setCategory}
      />

      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <div className="text-5xl">🔎</div>
            <h3 className="text-2xl font-semibold text-zinc-700 dark:text-zinc-200">
              No se encontraron proyectos
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
              Intenta ajustar los filtros o usa otras palabras clave.
            </p>
          </div>
        </div>
      ) : (
        <section className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
              isFavorite={project.isFavorite ?? false}
              onClick={() => {
                setSelectedProject(project);
                setModalOpen(true);
              }}
              onLike={() => console.log(`Like en: ${project.title}`)}
              onFavorite={() => console.log(`Favorito en: ${project.title}`)}
            />
          ))}
        </section>
      )}

      {/* Modal */}
      <ProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        project={selectedProject}
        user={user ? {
          uid: user.uid,
          displayName: user.displayName || user.email?.split('@')[0] || 'Anónimo'
        } : undefined}
      />
    </div>
  );
}
