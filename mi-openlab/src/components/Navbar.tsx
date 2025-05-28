import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { Sun, Moon, Trophy } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isDark, toggleDark } = useDarkMode();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleDarkModeToggle = () => {
    console.log('Toggling dark mode. Current state:', isDark);
    toggleDark();
  };

  return (
    <nav className="fixed top-0 left-0 w-full h-16 z-50 px-6 lg:px-12 py-4 flex items-center justify-between bg-white dark:bg-zinc-800 shadow-sm border-b border-zinc-200 dark:border-zinc-700 transition-colors duration-200 sm:pl-16">
      {/* Logo / nombre */}
      <Link
        to="/"
        className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white"
      >
        OpenShelf
      </Link>

      {/* Contenido derecho */}
      <div className="flex items-center gap-4">
        <Link
          to="/ranking"
          className="flex items-center gap-2 text-sm text-zinc-800 dark:text-white hover:text-primary dark:hover:text-primary transition"
        >
          <Trophy className="w-4 h-4" />
          <span className="hidden sm:inline">Ranking</span>
        </Link>

        {user ? (
          <>
            <span className="text-sm text-zinc-600 dark:text-zinc-400 hidden sm:inline">
              {user.displayName || user.email}
            </span>
            <Link
              to="/portal"
              className="text-sm text-primary font-medium hover:underline"
            >
              Mi portal
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-red-500 hover:underline"
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-sm text-zinc-800 dark:text-white hover:underline"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/register"
              className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-indigo-600 transition"
            >
              Registrarse
            </Link>
          </>
        )}

        {/* Toggle dark mode */}
        <button
          onClick={handleDarkModeToggle}
          className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 transition text-zinc-800 dark:text-white"
          aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
        >
          {isDark ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>
      </div>
    </nav>
  );
}
