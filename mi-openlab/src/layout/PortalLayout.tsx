// src/layout/PortalLayout.tsx
import { Link, Outlet, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Inicio', path: '/portal' },
  { label: 'Mis proyectos', path: '/portal/projects' },
  { label: 'Favoritos', path: '/portal/favorites' },
  { label: 'Crear proyecto', path: '/portal/create' },
];

export default function PortalLayout() {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-zinc-900 border-r dark:border-zinc-700 p-6 hidden md:block">
        <h2 className="text-xl font-bold text-darkText dark:text-white mb-6">
          Mi Panel
        </h2>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-3 py-2 rounded-lg font-medium ${
                pathname === item.path
                  ? 'bg-primary text-white'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 bg-light dark:bg-darkBackground">
        <Outlet />
      </main>
    </div>
  );
}
