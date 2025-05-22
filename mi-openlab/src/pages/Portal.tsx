import { useAuth } from '../context/AuthContext';

export default function Portal() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center text-center px-4 text-darkText dark:text-white bg-light dark:bg-darkBackground">
      <div>
        <h1 className="text-3xl font-bold mb-2">Bienvenido al Portal 🎉</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {user?.email}
        </p>
      </div>
    </div>
  );
}
