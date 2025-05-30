import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import DashboardView from './DashboardView';
import HistoryView from './HistoryView';
import MyProjectsView from './MyProjectsView';
import MyProfileView from './MyProfileView';
import FavoritesView from './FavoritesView';
import MyCommunitiesView from './MyCommunitiesView';
import AdminCommunityView from './AdminCommunityView';

export default function PortalLayout() {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setSidebarExpanded(window.innerWidth >= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Escuchar cambios en el sidebar
  useEffect(() => {
    const handleSidebarChange = (e: CustomEvent) => {
      setSidebarExpanded(e.detail.expanded);
    };

    window.addEventListener('sidebarChange' as any, handleSidebarChange);
    return () => {
      window.removeEventListener('sidebarChange' as any, handleSidebarChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white transition-all duration-300">
      {/* Sidebar - Ahora con posición fija */}
      <Sidebar />

      {/* Contenido principal - Responsive padding */}
      <main
        className={`
          min-h-screen w-full transition-all duration-300
          ${isMobile 
            ? 'pl-0' // Sin padding en móvil
            : sidebarExpanded 
              ? 'pl-64' // Padding completo cuando el sidebar está expandido
              : 'pl-20' // Padding reducido cuando el sidebar está colapsado
          }
        `}
      >
        <div className="p-4 md:p-6 lg:p-10">
          <Routes>
            <Route path="/" element={<DashboardView />} />
            <Route path="/history" element={<HistoryView />} />
            <Route path="/projects" element={<MyProjectsView />} />
            <Route path="/favorites" element={<FavoritesView />} />
            <Route path="/profile" element={<MyProfileView />} />
            <Route path="communities" element={<MyCommunitiesView />} />
            <Route path="communities/:communityId/admin" element={<AdminCommunityView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
