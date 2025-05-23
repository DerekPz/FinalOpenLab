// src/pages/portal/DashboardView.tsx
import { useAuth } from '../../context/AuthContext';

const stats = [
  { label: 'Proyectos', value: 4 },
  { label: 'Likes recibidos', value: 12 },
  { label: 'Última actividad', value: 'Hace 2 días' },
];

export default function DashboardView() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">
          Bienvenido {user?.displayName || user?.email || 'usuario'} 👋
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Este es tu panel personal de OpenShelf.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((item) => (
          <div
            key={item.label}
            className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-5 shadow"
          >
            <p className="text-primary text-3xl font-bold">{item.value}</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
