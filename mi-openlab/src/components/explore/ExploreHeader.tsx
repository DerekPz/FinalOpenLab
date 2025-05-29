interface Props {
  search: string;
  setSearch: (value: string) => void;
  filter: string;
  setFilter: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
}

export default function ExploreHeader({
  search,
  setSearch,
  filter,
  setFilter,
  category,
  setCategory,
}: Props) {
  const categorias = ['IA', 'Frontend', 'Backend', 'Mobile', 'Fullstack'];

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6">
      <div className="text-center space-y-2">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 animate-gradient-x pb-2">
          Explorar Proyectos 
        </h2>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
          Descubre proyectos increíbles de la comunidad
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 bg-white/10 dark:bg-zinc-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-5  ">
        <div className="relative flex-1 sm:max-w-md">
          <input
            type="text"
            placeholder="Buscar proyectos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 dark:border-zinc-600/40 bg-white dark:bg-zinc-800/50 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors"
          />
          <span className="absolute right-3 top-2.5 text-zinc-400 dark:text-zinc-500">🔍</span>
        </div>

        <div className="flex flex-row gap-3 sm:gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="flex-1 sm:flex-none rounded-lg border border-zinc-200 dark:border-zinc-600/40 bg-white dark:bg-zinc-800/50 px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors"
          >
            <option>Todas</option>
            <option>Favoritos</option>
            <option>Populares</option>
            <option>Recientes</option>
          </select>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex-1 sm:flex-none rounded-lg border border-zinc-200 dark:border-zinc-600/40 bg-white dark:bg-zinc-800/50 px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors"
          >
            <option>Todas</option>
            {categorias.map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
