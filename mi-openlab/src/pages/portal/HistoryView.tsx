// src/pages/portal/HistoryView.tsx

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserActivity } from '../../services/userActivity';
import type { UserActivity, UserActivityType } from '../../types/userActivity';
import { Calendar, Star, Heart, Trash2, MessageCircle, Users, FilePlus } from 'lucide-react';

const activityTypes: { value: UserActivityType | 'all', label: string }[] = [
  { value: 'all', label: 'Todo' },
  { value: 'create_project', label: 'Creación de proyecto' },
  { value: 'edit_project', label: 'Edición de proyecto' },
  { value: 'delete_project', label: 'Eliminación de proyecto' },
  { value: 'comment', label: 'Comentarios' },
  { value: 'like', label: 'Likes' },
  { value: 'favorite', label: 'Favoritos' },
  { value: 'create_discussion', label: 'Publicaciones en foro' },
  { value: 'join_community', label: 'Unirse a comunidad' },
  { value: 'leave_community', label: 'Salir de comunidad' },
];

const typeIcon = {
  'create_project': <FilePlus className="text-indigo-500" />,
  'edit_project': <FilePlus className="text-yellow-500" />,
  'delete_project': <Trash2 className="text-red-500" />,
  'comment': <MessageCircle className="text-blue-500" />,
  'like': <Heart className="text-pink-500" />,
  'favorite': <Star className="text-yellow-400" />,
  'create_discussion': <MessageCircle className="text-green-500" />,
  'join_community': <Users className="text-indigo-400" />,
  'leave_community': <Users className="text-red-400" />,
};

function formatDate(date: Date) {
  return date.toLocaleString(); // O usa dayjs/fecha relativa si prefieres
}

export default function HistoryView() {
  const { user } = useAuth();
  const [history, setHistory] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<UserActivityType | 'all'>('all');

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getUserActivity(user.uid, 50).then(setHistory).finally(() => setLoading(false));
  }, [user]);

  const filteredHistory = filter === 'all'
    ? history
    : history.filter(item => item.type === filter);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2 text-darkText dark:text-white">
        <Calendar className="w-6 h-6 text-indigo-500" />
        Historial de actividad
      </h2>
      <div className="mb-4">
        <select
          value={filter}
          onChange={e => setFilter(e.target.value as UserActivityType | 'all')}
          className="border rounded px-3 py-2"
        >
          {activityTypes.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      {loading ? (
        <div>Cargando...</div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.length === 0 ? (
            <div className="text-zinc-500">No hay actividad reciente.</div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-sm p-4"
              >
                <div className="flex-shrink-0 mt-1">
                  {typeIcon[item.type] || <Calendar className="text-zinc-400" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      item.type === 'delete_project' ? 'bg-red-100 text-red-600' :
                      item.type === 'favorite' ? 'bg-yellow-100 text-yellow-700' :
                      item.type === 'like' ? 'bg-pink-100 text-pink-600' :
                      item.type === 'comment' ? 'bg-blue-100 text-blue-600' :
                      item.type === 'create_project' ? 'bg-indigo-100 text-indigo-700' :
                      item.type === 'create_discussion' ? 'bg-green-100 text-green-700' :
                      item.type === 'join_community' ? 'bg-indigo-100 text-indigo-700' :
                      item.type === 'leave_community' ? 'bg-red-100 text-red-700' :
                      'bg-zinc-100 text-zinc-600'
                    }`}>
                      {item.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <span className="text-xs text-zinc-400">{formatDate(item.timestamp)}</span>
                  </div>
                  <div className="text-sm text-zinc-800 dark:text-zinc-200">{item.description}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
