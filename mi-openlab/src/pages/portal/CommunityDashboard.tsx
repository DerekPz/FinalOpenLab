import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getCommunitiesByCreator } from "../../services/community";
import type { Community } from "../../types/community";
import { useNavigate } from "react-router-dom";

export default function CommunityDashboard() {
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
        <ul className="space-y-4">
          {communities.map(com => (
            <li
              key={com.id}
              className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-4 flex justify-between items-center"
            >
              <div>
                <div className="font-semibold text-lg">{com.name}</div>
                <div className="text-zinc-500">{com.description}</div>
              </div>
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
                onClick={() => navigate(`/dashboard/community/${com.id}`)}
              >
                Administrar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}