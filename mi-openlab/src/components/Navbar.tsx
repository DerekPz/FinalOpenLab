import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { Sun, Moon, Trophy, Menu, X, User, LogOut, Users } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';
import { useState } from 'react';

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isDark, toggleDark } = useDarkMode();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const handleDarkModeToggle = () => {
    console.log('Toggling dark mode. Current state:', isDark);
    toggleDark();
  };

  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  // Función para obtener el nombre de usuario formateado
  const getDisplayName = () => {
    if (user?.displayName) return user.displayName;
    if (user?.email) {
      const [username] = user.email.split('@');
      return username;
    }
    return 'Usuario';
  };

  return (
    <nav className="fixed top-0 left-0 w-full h-16 z-50 bg-white dark:bg-zinc-800 shadow-sm border-b border-zinc-200 dark:border-zinc-700 transition-colors duration-200">
      <div className="px-4 lg:px-12 h-full flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo / nombre */}
        <Link
          to="/"
          className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white"
          onClick={closeMenus}
        >
          OpenShelf
        </Link>

        {/* Botón de menú móvil */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white md:hidden"
          aria-label="Menú principal"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Menú de escritorio */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/ranking"
            className="flex items-center gap-2 text-sm text-zinc-800 dark:text-white hover:text-primary dark:hover:text-primary transition"
          >
            <Trophy className="w-4 h-4" />
            <span>Ranking</span>
          </Link>

          <Link
            to="/communities"
            className="flex items-center gap-2 text-sm text-zinc-800 dark:text-white hover:text-primary dark:hover:text-primary transition"
          >
            <Users className="w-4 h-4" />
            <span>Comunidades</span>
          </Link>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition"
              >
                <User className="w-4 h-4" />
                <span>{getDisplayName()}</span>
              </button>

              {/* Menú desplegable de usuario en escritorio */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 py-1">
                  <Link
                    to="/portal"
                    className="block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                    onClick={closeMenus}
                  >
                    Mi portal
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                  >
                    <span className="flex items-center gap-2">
                      <LogOut className="w-4 h-4" />
                      Cerrar sesión
                    </span>
                  </button>
                </div>
              )}
            </div>
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

        {/* Menú móvil */}
        {isMenuOpen && (
          <div className="absolute top-16 left-0 w-full bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 md:hidden">
            <div className="px-4 py-3 space-y-3">
              <Link
                to="/ranking"
                className="flex items-center gap-2 text-sm text-zinc-800 dark:text-white hover:text-primary dark:hover:text-primary transition"
                onClick={closeMenus}
              >
                <Trophy className="w-4 h-4" />
                <span>Ranking</span>
              </Link>

              <Link
                to="/communities"
                className="flex items-center gap-2 text-sm text-zinc-800 dark:text-white hover:text-primary dark:hover:text-primary transition"
                onClick={closeMenus}
              >
                <Users className="w-4 h-4" />
                <span>Comunidades</span>
              </Link>

              {user ? (
                <>
                  <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <User className="w-4 h-4" />
                    <span>{getDisplayName()}</span>
                  </div>
                  <Link
                    to="/portal"
                    className="block text-sm text-primary font-medium hover:underline"
                    onClick={closeMenus}
                  >
                    Mi portal
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-sm text-red-500 hover:underline"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    className="block text-sm text-zinc-800 dark:text-white hover:underline"
                    onClick={closeMenus}
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    to="/register"
                    className="block bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-indigo-600 transition text-center"
                    onClick={closeMenus}
                  >
                    Registrarse
                  </Link>
                </div>
              )}

              {/* Toggle dark mode en móvil */}
              <button
                onClick={handleDarkModeToggle}
                className="flex items-center gap-2 text-sm text-zinc-800 dark:text-white"
              >
                {isDark ? (
                  <>
                    <Sun className="w-5 h-5" />
                    <span>Cambiar a modo claro</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-5 h-5" />
                    <span>Cambiar a modo oscuro</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
