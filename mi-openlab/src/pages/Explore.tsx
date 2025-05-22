import { useState } from 'react';
import ProjectCard from '../components/ProjectCard';
import ExploreHeader from '../components/explore/ExploreHeader';
import { mockProjects } from '../data/mockProjects';

export default function Explore() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Todas');
  const [category, setCategory] = useState('Todas');

  const filteredProjects = mockProjects.filter((project) => {
    const searchMatch =
  project.title.toLowerCase().includes(search.toLowerCase()) ||
  project.description.toLowerCase().includes(search.toLowerCase()) ||
  project.author.toLowerCase().includes(search.toLowerCase()) ||
  project.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));


    const categoryMatch =
      category === 'Todas' || project.tags.includes(category);

    const filterMatch =
      filter === 'Todas' ||
      (filter === 'Favoritos' && project.isFavorite) ||
      (filter === 'Populares' && project.likes > 30) ||
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
        title={project.title}
        description={project.description}
        imageUrl={project.imageUrl}
        tags={project.tags}
        author={project.author}
        likes={project.likes}
        isFavorite={project.isFavorite}
        onClick={() => console.log(`Ver detalles del proyecto: ${project.title}`)}
        onLike={() => console.log(`Like en: ${project.title}`)}
        onFavorite={() => console.log(`Favorito en: ${project.title}`)}
      />
    ))}
  </section>
)}

    </div>
  );
}
