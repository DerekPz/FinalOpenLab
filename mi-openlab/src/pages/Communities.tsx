import { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCommunities } from '../services/community';
import type { Community, CommunityCategory } from '../types/community';
import CommunityCard from '../components/community/CommunityCard';

const CATEGORIES: CommunityCategory[] = [
  'Frontend',
  'Backend',
  'DevOps',
  'Mobile',
  'AI/ML',
  'Design',
  'Database',
  'Cloud',
  'Security',
  'Other'
];

export default function Communities() {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CommunityCategory | 'all'>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCommunities();
  }, [selectedCategory]);

  const loadCommunities = async () => {
    try {
      setLoading(true);
      const results = await getCommunities(
        selectedCategory === 'all' ? undefined : selectedCategory
      );
      setCommunities(results);
    } catch (error) {
      console.error('Error loading communities:', error);
      setError('Error al cargar las comunidades');
    } finally {
      setLoading(false);
    }
  };

  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(search.toLowerCase()) ||
    community.description.toLowerCase().includes(search.toLowerCase()) ||
    community.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen w-full bg-zinc-50/80 dark:bg-zinc-900">
      <div className="w-full max-w-[2000px] mx-auto px-4 py-6 sm:py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="pt-16 sm:pt-20 pb-8 sm:pb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
                Comunidades
              </h1>
              <p className="mt-2 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
                Únete a comunidades, comparte conocimiento y aprende de otros desarrolladores
              </p>
            </div>
            {user && (
              <Link
                to="/communities/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" />
                Crear comunidad
              </Link>
            )}
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar comunidades..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as CommunityCategory | 'all')}
                className="pl-10 pr-8 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer"
              >
                <option value="all">Todas las categorías</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Lista de comunidades */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-[3px] border-current border-t-transparent text-indigo-600 dark:text-indigo-400" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 dark:text-red-400">{error}</p>
          </div>
        ) : filteredCommunities.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              No se encontraron comunidades
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              {search
                ? 'Intenta con otros términos de búsqueda'
                : 'Sé el primero en crear una comunidad'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCommunities.map((community) => (
              <CommunityCard
                key={community.id}
                community={community}
                memberCount={community.memberCount}
                discussionCount={0} // TODO: Implementar conteo de discusiones
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 