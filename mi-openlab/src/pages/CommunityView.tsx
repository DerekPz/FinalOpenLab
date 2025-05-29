import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCommunity, joinCommunity, leaveCommunity, isCommunityMember } from '../services/community';
import type { Community } from '../types/community';
import { useAuth } from '../context/AuthContext';

export default function CommunityView() {
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);

  useEffect(() => {
    // Si no está autenticado o no hay ID de comunidad, redirigir a login
    if (!user || !communityId) {
      navigate('/login', { state: { from: `/communities/${communityId || ''}` } });
      return;
    }

    async function loadCommunityData(cid: string, uid: string) {
      try {
        const [communityData, membershipStatus] = await Promise.all([
          getCommunity(cid),
          isCommunityMember(cid, uid)
        ]);

        if (!communityData) {
          setError('Comunidad no encontrada');
          return;
        }

        setCommunity(communityData);
        setIsMember(membershipStatus);
      } catch (err) {
        console.error('Error loading community:', err);
        setError('Error al cargar la comunidad');
      } finally {
        setLoading(false);
      }
    }

    loadCommunityData(communityId, user.uid);
  }, [communityId, user, navigate]);

  const handleJoinLeave = async () => {
    if (!user || !communityId || !community) return;

    setJoinLoading(true);
    try {
      if (isMember) {
        await leaveCommunity(communityId, user.uid);
        setIsMember(false);
        setCommunity(prev => prev ? {
          ...prev,
          memberCount: Math.max(0, prev.memberCount - 1)
        } : null);
      } else {
        await joinCommunity(communityId, user.uid);
        setIsMember(true);
        setCommunity(prev => prev ? {
          ...prev,
          memberCount: prev.memberCount + 1
        } : null);
      }
    } catch (err) {
      console.error('Error al unirse/abandonar la comunidad:', err);
    } finally {
      setJoinLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-[3px] border-current border-t-transparent text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <h2 className="text-2xl font-bold text-red-500 dark:text-red-400 mb-4">
          {error}
        </h2>
        <button
          onClick={() => navigate('/communities')}
          className="text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Volver a comunidades
        </button>
      </div>
    );
  }

  if (!community) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Encabezado de la comunidad */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
                {community.name}
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                {community.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {community.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={handleJoinLeave}
              disabled={joinLoading}
              className={`px-4 py-2 rounded-xl font-medium text-sm transition-colors ${
                isMember
                  ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'
                  : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50'
              }`}
            >
              {joinLoading ? (
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
              ) : isMember ? (
                'Abandonar comunidad'
              ) : (
                'Unirse a la comunidad'
              )}
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-4">
            <div className="text-sm text-zinc-600 dark:text-zinc-400">Miembros</div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">
              {community.memberCount}
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-4">
            <div className="text-sm text-zinc-600 dark:text-zinc-400">Categoría</div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">
              {community.category}
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-4">
            <div className="text-sm text-zinc-600 dark:text-zinc-400">Estado</div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">
              {community.status === 'active' ? 'Activa' : 'Archivada'}
            </div>
          </div>
        </div>

        {/* Reglas de la comunidad */}
        {community.rules.length > 0 && (
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">
              Reglas de la comunidad
            </h2>
            <ul className="space-y-2">
              {community.rules.map((rule, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-zinc-600 dark:text-zinc-400"
                >
                  <span className="font-medium">{index + 1}.</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 