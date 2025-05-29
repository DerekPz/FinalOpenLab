import { useState, useContext, createContext, useEffect } from 'react';
import { Menu, X, LayoutDashboard, Clock3, Folder, User, ArrowLeftCircle, Sun, Moon, Star, LogOut } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDarkMode } from '../../../hooks/useDarkMode';
import { signOut } from 'firebase/auth';
import { auth } from '../../../services/firebase';

const SidebarContext = createContext({ expanded: true });

export default function Sidebar() {
  const [expanded, setExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleDark } = useDarkMode();

  const options = [
    { icon: <LayoutDashboard size={20} />, label: 'Estadísticas', path: '/portal' },
    { icon: <Clock3 size={20} />, label: 'Historial', path: '/portal/history' },
    { icon: <Folder size={20} />, label: 'Mis proyectos', path: '/portal/projects' },
    { icon: <Star size={20} />, label: 'Favoritos', path: '/portal/favorites' },
    { icon: <User size={20} />, label: 'Tu Perfil', path: '/portal/profile' },
  ];

  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      setExpanded(!isMobileView);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Emitir evento cuando cambia el estado del sidebar
  useEffect(() => {
    const event = new CustomEvent('sidebarChange', { detail: { expanded } });
    window.dispatchEvent(event);
  }, [expanded]);

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setExpanded(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <>
      {/* Botón hamburguesa para móvil */}
      <button
        onClick={() => setExpanded(true)}
        className={`
          md:hidden fixed top-4 left-4 z-50 
          bg-white dark:bg-zinc-800 
          text-zinc-900 dark:text-white
          p-2 rounded-lg shadow-lg
          border border-zinc-200 dark:border-zinc-700
          ${expanded ? 'hidden' : 'block'}
        `}
      >
        <Menu size={20} />
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen
          bg-white dark:bg-zinc-900 
          border-r border-zinc-200 dark:border-zinc-800/50 
          text-zinc-900 dark:text-white
          transition-all duration-300 ease-in-out
          ${expanded 
            ? 'w-64 translate-x-0 z-50' 
            : isMobile 
              ? '-translate-x-full w-64 z-50' 
              : 'w-20 translate-x-0 z-40'
          }
          flex flex-col
        `}
      >
        {/* Header con logo y toggle */}
        <div className="p-4 flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800/50">
          <h1 className={`text-xl font-bold transition-all bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text ${expanded ? 'block' : 'hidden'}`}>
            OpenShelf
          </h1>
          <button 
            onClick={() => setExpanded(!expanded)} 
            className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            {expanded ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Contenido del sidebar */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <SidebarContext.Provider value={{ expanded }}>
            <ul className="flex-1 space-y-1 p-2">
              {options.map((opt) => (
                <SidebarItem
                  key={opt.path}
                  icon={opt.icon}
                  text={opt.label}
                  active={location.pathname === opt.path}
                  onClick={() => handleNavigation(opt.path)}
                />
              ))}
            </ul>
          </SidebarContext.Provider>

          {/* Footer con información del usuario */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800/50">
            <div className="flex flex-col items-center space-y-3">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDark}
                className={`
                  flex items-center justify-center gap-2 w-full p-3 
                  rounded-lg transition-all
                  ${expanded 
                    ? 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/50 dark:hover:bg-zinc-800' 
                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                  }
                `}
                aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
              >
                {isDark ? (
                  <>
                    <Sun size={20} className="text-amber-500" />
                    {expanded && <span className="text-zinc-700 dark:text-zinc-300">Modo Claro</span>}
                  </>
                ) : (
                  <>
                    <Moon size={20} className="text-indigo-600 dark:text-indigo-400" />
                    {expanded && <span className="text-zinc-700 dark:text-zinc-300">Modo Oscuro</span>}
                  </>
                )}
              </button>

              {/* User info */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                {expanded && (
                  <div className="text-center">
                    <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                      {user?.displayName || 'Usuario'}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate w-40">
                      {user?.email || 'correo@ejemplo.com'}
                    </p>
                  </div>
                )}
              </div>

              {/* Go to Explore button */}
              <button
                onClick={() => navigate('/explore')}
                className={`
                  flex items-center justify-center gap-2 
                  bg-gradient-to-r from-indigo-500 to-indigo-600 
                  hover:from-indigo-600 hover:to-indigo-700 
                  text-white rounded-lg text-sm font-medium 
                  transition-all shadow-lg hover:shadow-indigo-500/25
                  ${expanded ? 'w-full px-4 py-2' : 'w-10 h-10 p-0'}
                `}
              >
                <ArrowLeftCircle size={20} className={expanded ? '' : 'mx-auto'} />
                {expanded && <span>Go to Explore</span>}
              </button>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className={`
                  flex items-center justify-center gap-2 w-full p-3
                  text-red-600 dark:text-red-400
                  rounded-lg transition-all
                  hover:bg-red-50 dark:hover:bg-red-900/30
                `}
              >
                <LogOut size={20} />
                {expanded && <span>Cerrar sesión</span>}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay para móvil */}
      {expanded && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setExpanded(false)}
        />
      )}
    </>
  );
}

interface SidebarItemProps {
  icon: React.ReactNode;
  text: string;
  active?: boolean;
  onClick?: () => void;
}

function SidebarItem({ icon, text, active, onClick }: SidebarItemProps) {
  const { expanded } = useContext(SidebarContext);

  return (
    <li
      onClick={onClick}
      className={`
        flex items-center justify-center md:justify-start gap-3 cursor-pointer p-3 rounded-lg transition-all
        ${active 
          ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25' 
          : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
        }
      `}
    >
      {icon}
      <span className={`whitespace-nowrap overflow-hidden transition-all ${expanded ? 'block' : 'hidden'}`}>{text}</span>
    </li>
  );
}
