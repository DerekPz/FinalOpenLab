import { useState, useEffect } from 'react';
import { getUserRanking, ACHIEVEMENTS } from '../services/reputation';
import type { UserProfile } from '../types/user';
import { Trophy, Medal, Award, Star, ThumbsUp, MessageSquare, Users, Info, Rocket, Group, Heart, Crown, MessageCircle, ArrowLeft } from 'lucide-react';
import RankingUserCard from '../components/RankingUserCard';
import { useNavigate } from 'react-router-dom';

export default function Ranking() {
  const [users, setUsers] = useState<(UserProfile & { rank: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [tooltipAchievement, setTooltipAchievement] = useState<string | null>(null);
  const [tooltipPoint, setTooltipPoint] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadRanking = async () => {
      try {
        const ranking = await getUserRanking(20);
        console.log('Ranking loaded:', ranking);
        setUsers(ranking);
      } catch (error) {
        console.error('Error loading ranking:', error);
        setError('Error al cargar el ranking. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    loadRanking();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-700" />;
      default:
        return <Award className="w-6 h-6 text-zinc-400" />;
    }
  };

  const pointsInfo = [
    {
      id: 'publish_project',
      icon: <Star className="w-5 h-5" />,
      action: 'Publicar proyecto',
      points: 50,
      description: 'Por cada proyecto que publiques en la plataforma'
    },
    {
      id: 'receive_like',
      icon: <ThumbsUp className="w-5 h-5" />,
      action: 'Recibir like',
      points: 10,
      description: 'Por cada like que reciban tus proyectos'
    },
    {
      id: 'receive_comment',
      icon: <MessageSquare className="w-5 h-5" />,
      action: 'Recibir comentario',
      points: 15,
      description: 'Por cada comentario en tus proyectos'
    },
    {
      id: 'gain_follower',
      icon: <Users className="w-5 h-5" />,
      action: 'Ganar seguidor',
      points: 20,
      description: 'Por cada nuevo seguidor que consigas'
    }
  ];

  const achievementIcons = {
    first_project: <Rocket className="w-5 h-5" />,
    ten_followers: <Group className="w-5 h-5" />,
    hundred_likes: <Heart className="w-5 h-5" />,
    featured_project: <Crown className="w-5 h-5" />,
    active_commenter: <MessageCircle className="w-5 h-5" />
  };

  if (error) {
    return (
      <div className="min-h-screen w-full bg-zinc-50/80 dark:bg-zinc-900">
        <div className="w-full max-w-[2000px] mx-auto px-4 py-6 sm:py-10 sm:px-6 lg:px-8">
          <div className="bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm rounded-xl shadow-lg p-6 text-center border border-zinc-200/20 dark:border-zinc-700/50">
            <p className="text-red-500 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-zinc-50/80 dark:bg-zinc-900">
      {/* Botón flotante de volver a Explore */}
      <button
        onClick={() => navigate('/explore')}
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-zinc-900/90 text-white dark:bg-zinc-800/90 dark:text-zinc-100 rounded-full shadow-lg hover:bg-zinc-800 dark:hover:bg-zinc-700 transition-all backdrop-blur-md"
        style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
        aria-label="Volver a Explorar"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium hidden sm:inline">Volver a Explorar</span>
      </button>
      <div className="w-full max-w-[2000px] mx-auto px-4 py-6 sm:py-10 sm:px-6 lg:px-8">
        {/* Header con título y descripción */}
        <div className="pt-16 sm:pt-20 pb-8 sm:pb-12 text-center space-y-2">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 animate-gradient-x pb-2">
            Ranking de Usuarios
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            Los usuarios más activos y con mejor reputación en la plataforma
          </p>
        </div>

        {/* Contenedor principal */}
        <div className="bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-zinc-200/20 dark:border-zinc-700/50">
          {/* Header con botón de info */}
          <div className="p-6 border-b border-zinc-200/50 dark:border-zinc-700/50 flex justify-end">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition-colors"
            >
              <Info className="w-4 h-4" />
              {showInfo ? 'Ocultar información' : 'Ver sistema de puntos'}
            </button>
          </div>

          {/* Sistema de Puntos y Logros (Colapsable) */}
          {showInfo && (
            <div className="p-6 border-b border-zinc-200/50 dark:border-zinc-700/50 space-y-8">
              {/* Sistema de Puntos */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  Sistema de Puntos
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {pointsInfo.map((info) => (
                    <div
                      key={info.id}
                      className="relative group"
                      onMouseEnter={() => setTooltipPoint(info.id)}
                      onMouseLeave={() => setTooltipPoint(null)}
                    >
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-white/80 dark:bg-zinc-700/50 border border-zinc-200/50 dark:border-zinc-600/50 group-hover:border-indigo-500/50 dark:group-hover:border-indigo-400/50 transition-all">
                        <div className="p-2 rounded-lg bg-indigo-500/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400">
                          {info.icon}
                        </div>
                        <div>
                          <div className="font-medium text-zinc-900 dark:text-white">
                            {info.action}
                          </div>
                          <div className="text-sm text-indigo-600 dark:text-indigo-400">
                            +{info.points} pts
                          </div>
                        </div>
                      </div>
                      {tooltipPoint === info.id && (
                        <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 text-xs text-center text-white bg-zinc-800 dark:bg-black rounded-lg shadow-xl">
                          {info.description}
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-zinc-800 dark:bg-black"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Logros Disponibles */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  Logros Disponibles
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ACHIEVEMENTS.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="relative group"
                      onMouseEnter={() => setTooltipAchievement(achievement.id)}
                      onMouseLeave={() => setTooltipAchievement(null)}
                    >
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-white/80 dark:bg-zinc-700/50 border border-zinc-200/50 dark:border-zinc-600/50 group-hover:border-purple-500/50 dark:group-hover:border-purple-400/50 transition-all">
                        <div className="p-2 rounded-lg bg-purple-500/10 dark:bg-purple-400/10 text-purple-600 dark:text-purple-400">
                          {achievementIcons[achievement.id as keyof typeof achievementIcons]}
                        </div>
                        <span className="font-medium text-zinc-900 dark:text-white">
                          {achievement.name}
                        </span>
                      </div>
                      {tooltipAchievement === achievement.id && (
                        <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 text-xs text-center text-white bg-zinc-800 dark:bg-black rounded-lg shadow-xl">
                          {achievement.description}
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-zinc-800 dark:bg-black"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Lista de usuarios */}
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-[3px] border-current border-t-transparent text-indigo-600 dark:text-indigo-400" role="status" aria-label="loading">
                <span className="sr-only">Cargando...</span>
              </div>
              <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">Cargando ranking...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-zinc-600 dark:text-zinc-400">No hay usuarios en el ranking todavía.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-200/50 dark:divide-zinc-700/50">
              {users.map((user) => (
                <div key={user.uid} className="flex items-center">
                  <div className="flex items-center justify-center w-16 pl-6">
                    {getRankIcon(user.rank)}
                  </div>
                  <div className="flex-1">
                    <RankingUserCard user={user} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 