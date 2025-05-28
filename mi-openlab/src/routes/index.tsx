import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DefaultLayout from '../layout/DefaultLayout';
import Explore from '../pages/Explore';
import { useAuth } from '../context/AuthContext';
import LoginRegister from '../pages/LoginRegister';
import Portal from '../pages/portal/index';
import UserProfileView from '../pages/UserProfileView';
import Ranking from '../pages/Ranking';
import ReputationMigration from '../pages/admin/ReputationMigration';
import DashboardView from '../pages/portal/DashboardView';
import HistoryView from '../pages/portal/HistoryView';
import MyProjectsView from '../pages/portal/MyProjectsView';
import MyProfileView from '../pages/portal/MyProfileView';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-center p-10">Cargando...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DefaultLayout><Explore /></DefaultLayout>} />
        <Route path="/login" element={<LoginRegister mode="login" />} />
        <Route path="/register" element={<LoginRegister mode="register" />} />
        <Route path="/ranking" element={<DefaultLayout><Ranking /></DefaultLayout>} />
        
        {/* Rutas del portal */}
        <Route path="/portal/*" element={
          <PrivateRoute>
            <Portal />
          </PrivateRoute>
        }>
          <Route index element={<DashboardView />} />
          <Route path="history" element={<HistoryView />} />
          <Route path="projects" element={<MyProjectsView />} />
          <Route path="profile" element={<MyProfileView />} />
        </Route>

        <Route path="/user/:userId" element={
          <DefaultLayout>
            <UserProfileView />
          </DefaultLayout>
        } />
        <Route path="/admin/reputation-migration" element={<ReputationMigration />} />
      </Routes>
    </BrowserRouter>
  );
}
