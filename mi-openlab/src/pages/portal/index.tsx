import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import DashboardView from './DashboardView';
import HistoryView from './HistoryView';
import MyProjectsView from './MyProjectsView';
import MyProfileView from './MyProfileView';

export default function PortalLayout() {
  const [isOpen] = useState(false); // 👈 estado global del sidebar

  return (
    <div className="min-h-screen flex bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white transition-all duration-300">
      {/* Sidebar */}
      <Sidebar />

      {/* Contenido desplazable */}
      <main
        className={`flex-1 p-6 lg:p-10 overflow-y-auto transition-all duration-300 ${
          isOpen ? 'translate-x-64 lg:ml-64' : 'translate-x-0 lg:ml-64'
        }`}
      >
        <Routes>
          <Route path="/" element={<DashboardView />} />
          <Route path="/history" element={<HistoryView />} />
          <Route path="/projects" element={<MyProjectsView />} />
          <Route path="/profile" element={<MyProfileView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
