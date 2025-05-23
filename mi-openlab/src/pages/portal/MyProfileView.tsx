// src/pages/portal/MyProfileView.tsx
import { useAuth } from '../../context/AuthContext';

const followers = [
  'sofia.dev',
  'coder_mateo',
  'andres123',
];

const following = [
  'lucas.codes',
  'natalia_ui',
];

export default function MyProfileView() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-bold text-darkText dark:text-white">
        🧑 Perfil personal
      </h2>

      <div className="bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl p-5">
        <p className="text-zinc-700 dark:text-zinc-200">
          <span className="font-medium">Nombre:</span> {user?.displayName || 'Anónimo'}
        </p>
        <p className="text-zinc-700 dark:text-zinc-200">
          <span className="font-medium">Correo:</span> {user?.email || 'Desconocido'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl p-4">
          <h3 className="font-semibold mb-2 text-primary">📥 Seguidores</h3>
          <ul className="list-disc list-inside text-sm text-zinc-700 dark:text-zinc-300">
            {followers.map((f, idx) => (
              <li key={idx}>{f}</li>
            ))}
          </ul>
        </div>

        <div className="bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl p-4">
          <h3 className="font-semibold mb-2 text-primary">📤 Siguiendo</h3>
          <ul className="list-disc list-inside text-sm text-zinc-700 dark:text-zinc-300">
            {following.map((f, idx) => (
              <li key={idx}>{f}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
