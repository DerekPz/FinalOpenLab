// src/layout/PortalLayout.tsx
import { Outlet } from 'react-router-dom';
import Sidebar from '../pages/portal/components/Sidebar';
import { useState, useEffect } from 'react';

export default function PortalLayout() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  // Escuchar el evento personalizado del sidebar
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
    <div className="grid h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900" 
         style={{ 
           gridTemplateColumns: sidebarExpanded ? '256px 1fr' : '80px 1fr',
           transition: 'grid-template-columns 300ms'
         }}>
      <Sidebar />
      <main className="overflow-auto">
        <div className="h-full max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-zinc-700/50 shadow-xl shadow-black/20 p-4 sm:p-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
