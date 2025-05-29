import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createCommunity } from '../services/community';
import type { CommunityCategory } from '../types/community';
import { ArrowLeft } from 'lucide-react';

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

export default function CreateCommunity() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CommunityCategory>('Other');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [rules, setRules] = useState<string[]>(['Sé respetuoso', 'No spam']);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      if (!name.trim()) {
        setError('El nombre es obligatorio');
        return;
      }

      if (!description.trim()) {
        setError('La descripción es obligatoria');
        return;
      }

      const communityId = await createCommunity(
        name.trim(),
        description.trim(),
        category,
        user.uid,
        tags,
        rules
      );

      navigate(`/communities/${communityId}`);
    } catch (error) {
      console.error('Error creating community:', error);
      setError('Error al crear la comunidad');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddRule = () => {
    setRules([...rules, '']);
  };

  const handleUpdateRule = (index: number, value: string) => {
    const newRules = [...rules];
    newRules[index] = value;
    setRules(newRules);
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen w-full bg-zinc-50/80 dark:bg-zinc-900">
      <div className="w-full max-w-3xl mx-auto px-4 py-6 sm:py-10 sm:px-6">
        <div className="pt-16 sm:pt-20 pb-8">
          {/* Header */}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 mb-2">
            Crear nueva comunidad
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            Crea un espacio para compartir conocimiento y conectar con otros desarrolladores
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-zinc-900 dark:text-white mb-2"
            >
              Nombre
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              placeholder="ej. React Developers"
              disabled={loading}
            />
          </div>

          {/* Descripción */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-zinc-900 dark:text-white mb-2"
            >
              Descripción
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 min-h-[100px]"
              placeholder="Describe el propósito de tu comunidad..."
              disabled={loading}
            />
          </div>

          {/* Categoría */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-zinc-900 dark:text-white mb-2"
            >
              Categoría
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as CommunityCategory)}
              className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              disabled={loading}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label
              htmlFor="tags"
              className="block text-sm font-medium text-zinc-900 dark:text-white mb-2"
            >
              Tags
            </label>
            <div className="space-y-2">
              <input
                type="text"
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="Presiona Enter para agregar un tag"
                disabled={loading}
              />
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-indigo-400 hover:text-indigo-600 dark:text-indigo-500 dark:hover:text-indigo-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Reglas */}
          <div>
            <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
              Reglas de la comunidad
            </label>
            <div className="space-y-2">
              {rules.map((rule, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={rule}
                    onChange={(e) => handleUpdateRule(index, e.target.value)}
                    className="flex-1 px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    placeholder="Escribe una regla..."
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveRule(index)}
                    className="px-3 py-2 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddRule}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
              >
                + Agregar regla
              </button>
            </div>
          </div>

          {/* Botón submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-400 text-white font-medium rounded-xl transition-colors"
          >
            {loading ? 'Creando...' : 'Crear comunidad'}
          </button>
        </form>
      </div>
    </div>
  );
} 