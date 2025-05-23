import { useState, useContext, createContext } from 'react';
import { Menu, X, LayoutDashboard, Clock3, Folder, User,  ArrowLeftCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';


const SidebarContext = createContext({ expanded: true });

interface Props {
  current: string;
  setCurrent: (view: string) => void;
}

export default function Sidebar({ current, setCurrent }: Props) {
  const [expanded, setExpanded] = useState(true);
  const { user } = useAuth();

  const options = [
    { icon: <LayoutDashboard size={20} />, label: 'Estadísticas', view: 'dashboard' },
    { icon: <Clock3 size={20} />, label: 'Historial', view: 'history' },
    { icon: <Folder size={20} />, label: 'Mis proyectos', view: 'projects' },
    { icon: <User size={20} />, label: 'Tu CV', view: 'profile' },
  ];

  return (
    <aside className={`h-screen ${expanded ? 'w-64' : 'w-20'} transition-all duration-300 bg-zinc-900 text-white flex flex-col`}>
      <nav className="flex flex-col h-full">
        {/* Header con logo y toggle */}
        <div className="p-4 flex justify-between items-center border-b border-zinc-800">
          <h1 className={`text-xl font-bold transition-all ${expanded ? 'block' : 'hidden'}`}>OpenShelf</h1>
          <button onClick={() => setExpanded(!expanded)} className="text-white">
            {expanded ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <SidebarContext.Provider value={{ expanded }}>
          <ul className="flex-1 space-y-1 mt-4">
            {options.map((opt) => (
              <SidebarItem
                key={opt.view}
                icon={opt.icon}
                text={opt.label}
                active={current === opt.view}
                onClick={() => setCurrent(opt.view)}
              />
            ))}
          </ul>
        </SidebarContext.Provider>

        {/* Footer con información del usuario */}
<div className="border-t border-zinc-800 p-3">
  <div className="flex flex-col items-center space-y-3">
    {/* Avatar + usuario */}
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white">
        {user?.email?.charAt(0).toUpperCase() || 'U'}
      </div>
      {expanded && (
        <div className="leading-tight">
          <p className="font-semibold text-sm">{user?.displayName || 'Usuario'}</p>
          <p className="text-xs text-zinc-400 truncate w-40">
            {user?.email || 'correo@ejemplo.com'}
          </p>
        </div>
      )}
    </div>

    {/* Botón */}
    <button
      onClick={() => (window.location.href = '/')}
      className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium w-full transition"
    >
      <ArrowLeftCircle size={18} />
      <span className={`${!expanded ? 'hidden' : ''}`}>Go to Explore</span>
    </button>
  </div>
</div>

      </nav>
    </aside>
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
      className={`flex items-center gap-3 cursor-pointer p-3 rounded-md transition-colors group ${
        active ? 'bg-indigo-600 text-white' : 'hover:bg-zinc-800 text-zinc-200'
      }`}
    >
      {icon}
      <span className={`whitespace-nowrap overflow-hidden transition-all ${expanded ? 'block' : 'hidden'}`}>{text}</span>
    </li>
  );
}
