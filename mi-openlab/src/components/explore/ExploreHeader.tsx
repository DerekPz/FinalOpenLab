

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
    <div className="w-full flex flex-col gap-6 mb-10">
      <h2 className="text-center text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 animate-fade-in-up leading-tight pb-1">
        Explorar Proyectos 
      </h2>

      <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Buscar proyectos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-2 text-sm text-darkText dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition"
          />
          <span className="absolute right-3 top-2.5 text-gray-400 dark:text-gray-500">🔍</span>
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-darkText dark:text-white"
        >
          <option>Todas</option>
          <option>Favoritos</option>
          <option>Populares</option>
          <option>Recientes</option>
        </select>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-darkText dark:text-white"
        >
          <option>Todas</option>
          {categorias.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
