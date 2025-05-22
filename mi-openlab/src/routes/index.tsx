import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DefaultLayout from '../layout/DefaultLayout';
import Explore from '../pages/Explore';
import { useAuth } from '../context/AuthContext';
import LoginRegister from '../pages/LoginRegister';
import Portal from '../pages/Portal';

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
        <Route path="/portal" element={
          <PrivateRoute>
            <Portal />
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
