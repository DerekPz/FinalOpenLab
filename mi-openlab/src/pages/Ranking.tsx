import { useState, useEffect } from 'react';
import { getUserRanking, ACHIEVEMENTS } from '../services/reputation';
import type { UserProfile } from '../types/user';
import { Trophy, Medal, Award, Star, ThumbsUp, MessageSquare, Users, Info, Rocket, Group, Heart, Crown, MessageCircle } from 'lucide-react';
import RankingUserCard from '../components/RankingUserCard';

export default function Ranking() {
  const [users, setUsers] = useState<(UserProfile & { rank: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [tooltipAchievement, setTooltipAchievement] = useState<string | null>(null);
  const [tooltipPoint, setTooltipPoint] = useState<string | null>(null);

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
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-6 text-center">
            <p className="text-red-500 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-8">
      <div className="container mx-auto px-4 space-y-6">
        {/* Ranking de Usuarios */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm">
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                  Ranking de Usuarios
                </h1>
                <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                  Los usuarios más activos y con mejor reputación en la plataforma
                </p>
              </div>
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                title="Ver cómo funciona el sistema de puntos"
              >
                <Info className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
              </button>
            </div>
          </div>

          {/* Sistema de Puntos y Logros (Colapsable) */}
          {showInfo && (
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-700">
              <div className="space-y-6">
                {/* Sistema de Puntos */}
                <div>
                  <h3 className="font-medium text-sm text-zinc-900 dark:text-white mb-3">
                    Sistema de Puntos
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {pointsInfo.map((info) => (
                      <div
                        key={info.id}
                        className="relative"
                        onMouseEnter={() => setTooltipPoint(info.id)}
                        onMouseLeave={() => setTooltipPoint(null)}
                      >
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-zinc-700/50 border border-zinc-200 dark:border-zinc-600">
                          <div className="text-primary">
                            {info.icon}
                          </div>
                          <span className="text-sm text-zinc-700 dark:text-zinc-300">
                            {info.action}
                          </span>
                          <span className="text-sm font-medium text-primary">
                            +{info.points}
                          </span>
                        </div>
                        {tooltipPoint === info.id && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 text-xs text-center text-white bg-zinc-800 dark:bg-zinc-700 rounded-lg shadow-lg">
                            {info.description}
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-zinc-800 dark:bg-zinc-700"></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Logros Disponibles */}
                <div>
                  <h3 className="font-medium text-sm text-zinc-900 dark:text-white mb-3">
                    Logros Disponibles
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {ACHIEVEMENTS.map((achievement) => (
                      <div
                        key={achievement.id}
                        className="relative"
                        onMouseEnter={() => setTooltipAchievement(achievement.id)}
                        onMouseLeave={() => setTooltipAchievement(null)}
                      >
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-zinc-700/50 border border-zinc-200 dark:border-zinc-600">
                          <div className="text-primary">
                            {achievementIcons[achievement.id as keyof typeof achievementIcons]}
                          </div>
                          <span className="text-sm text-zinc-700 dark:text-zinc-300">
                            {achievement.name}
                          </span>
                        </div>
                        {tooltipAchievement === achievement.id && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 text-xs text-center text-white bg-zinc-800 dark:bg-zinc-700 rounded-lg shadow-lg">
                            {achievement.description}
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-zinc-800 dark:bg-zinc-700"></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="p-6 text-center text-zinc-600 dark:text-zinc-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              Cargando ranking...
            </div>
          ) : users.length === 0 ? (
            <div className="p-6 text-center text-zinc-600 dark:text-zinc-400">
              No hay usuarios en el ranking todavía.
            </div>
          ) : (
            <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {users.map((user) => (
                <div key={user.uid} className="flex items-center">
                  <div className="flex items-center justify-center w-12 pl-4">
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