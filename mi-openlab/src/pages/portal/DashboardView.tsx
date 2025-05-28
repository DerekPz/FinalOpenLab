// src/pages/portal/DashboardView.tsx
import { useAuth } from '../../context/AuthContext';
import { useUserStats } from '../../hooks/useUserStats';
import { Activity, BookOpen, ThumbsUp } from 'lucide-react';

export default function DashboardView() {
  const { user } = useAuth();
  const { projectCount, totalLikes, lastActivity, isLoading } = useUserStats();

  const stats = [
    {
      label: 'Proyectos',
      value: isLoading ? '-' : projectCount,
      icon: BookOpen,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Likes recibidos',
      value: isLoading ? '-' : totalLikes,
      icon: ThumbsUp,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      label: 'Última actividad',
      value: isLoading ? '-' : lastActivity,
      icon: Activity,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
          Bienvenido {user?.displayName || user?.email?.split('@')[0] || 'usuario'} 👋
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Este es tu panel personal de OpenShelf. Aquí puedes ver un resumen de tu actividad.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-700"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {stat.label}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
