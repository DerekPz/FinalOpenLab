import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getCommunitiesByCreator } from "../../services/community";
import { useNavigate } from "react-router-dom";
import type { Community } from "../../types/community";

export default function MyCommunitiesView() {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    getCommunitiesByCreator(user.uid).then(coms => {
      setCommunities(coms);
      setLoading(false);
    });
  }, [user]);

  if (!user) return <div>Debes iniciar sesión.</div>;
  if (loading) return <div>Cargando...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Tus comunidades</h1>
      {communities.length === 0 ? (
        <div>No has creado ninguna comunidad.</div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {communities.map(com => (
            <div
              key={com.id}
              className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-indigo-200 dark:border-indigo-700 overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-4">
                <h3 className="text-lg font-semibold text-white">{com.name}</h3>
                <span className="inline-block mt-2 px-2 py-1 text-xs font-medium text-white/90 bg-white/10 rounded-full backdrop-blur-sm">
                  {com.category}
                </span>
              </div>
              {/* Body */}
              <div className="flex-1 p-4 flex flex-col justify-between">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-3">
                  {com.description}
                </p>
                <button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg mt-auto"
                  onClick={() => navigate(`/portal/communities/${com.id}/admin`)}
                >
                  Administrar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 