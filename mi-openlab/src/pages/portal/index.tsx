import { useState } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './DashboardView';
import HistoryView from './HistoryView';
import MyProjectsView from './MyProjectsView';
import MyProfileView from './MyProfileView';

export default function PortalLayout() {
  const [view, setView] = useState('dashboard');
  const [isOpen] = useState(false); // 👈 estado global del sidebar

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <DashboardView />;
      case 'history':
        return <HistoryView />;
      case 'projects':
        return <MyProjectsView />;
      case 'profile':
        return <MyProfileView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen flex bg-light dark:bg-darkBackground text-darkText dark:text-white transition-all duration-300">
      {/* Sidebar con props */}
      <Sidebar current={view} setCurrent={setView}  />

      {/* Contenido desplazable */}
      <main
        className={`flex-1 p-6 lg:p-10 overflow-y-auto transition-all duration-300 ${
          isOpen ? 'translate-x-64 lg:ml-64' : 'translate-x-0 lg:ml-64'
        }`}
      >
        {renderView()}
      </main>
    </div>
  );
}
