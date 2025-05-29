import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DefaultLayout from '../layout/DefaultLayout';
import LoginRegister from '../pages/LoginRegister';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import Portal from '../pages/portal/index';
import UserProfileView from '../pages/UserProfileView';
import Ranking from '../pages/Ranking';
import ReputationMigration from '../pages/admin/ReputationMigration';
import DashboardView from '../pages/portal/DashboardView';
import HistoryView from '../pages/portal/HistoryView';
import MyProjectsView from '../pages/portal/MyProjectsView';
import MyProfileView from '../pages/portal/MyProfileView';
import FavoritesView from '../pages/portal/FavoritesView';
import Home from '../pages/Home';
import Communities from '../pages/Communities';
import CreateCommunity from '../pages/CreateCommunity';
import CommunityView from '../pages/CommunityView';
import ProtectedRoute from '../components/ProtectedRoute';
import Explore from '../pages/Explore';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DefaultLayout><Home /></DefaultLayout>} />
        <Route path="/login" element={<LoginRegister mode="login" />} />
        <Route path="/register" element={<LoginRegister mode="register" />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/ranking" element={<DefaultLayout><Ranking /></DefaultLayout>} />
        <Route path="/explore" element={<DefaultLayout><Explore /></DefaultLayout>} />
        
        {/* Rutas del portal */}
        <Route path="/portal/*" element={
          <ProtectedRoute>
            <Portal />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardView />} />
          <Route path="history" element={<HistoryView />} />
          <Route path="projects" element={<MyProjectsView />} />
          <Route path="favorites" element={<FavoritesView />} />
          <Route path="profile" element={<MyProfileView />} />
        </Route>

        <Route path="/user/:userId" element={
          <DefaultLayout>
            <UserProfileView />
          </DefaultLayout>
        } />
        <Route path="/admin/reputation-migration" element={<ReputationMigration />} />
        
        {/* Rutas de comunidades */}
        <Route path="/communities" element={<DefaultLayout><Communities /></DefaultLayout>} />
        <Route path="/communities/new" element={
          <ProtectedRoute>
            <DefaultLayout>
              <CreateCommunity />
            </DefaultLayout>
          </ProtectedRoute>
        } />
        <Route path="/communities/:communityId" element={
          <DefaultLayout>
            <CommunityView />
          </DefaultLayout>
        } />
      </Routes>
    </BrowserRouter>
  );
}
