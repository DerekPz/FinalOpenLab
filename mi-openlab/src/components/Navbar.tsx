import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { Sun, Moon } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode'; // tu hook personalizado

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isDark, toggleDark } = useDarkMode();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 w-full h-16 z-50 px-6 lg:px-12 py-4 flex items-center justify-between bg-white dark:bg-zinc-900 shadow-sm border-b border-gray-200 dark:border-zinc-800 transition-colors duration-200 sm:pl-16">
      {/* Logo / nombre */}
      <Link
        to="/"
        className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white"
      >
        OpenShelf
      </Link>

      {/* Contenido derecho */}
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm text-zinc-600 dark:text-zinc-300 hidden sm:inline">
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
          onClick={toggleDark}
          className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </nav>
  );
}
