import AppRoutes from './routes';
import { useDarkMode } from './hooks/useDarkMode';

export default function App() {
  // Inicializar el modo oscuro
  useDarkMode();

  return (
    <div className="min-h-screen bg-white dark:bg-darkBackground text-darkText dark:text-white">
      <AppRoutes />
    </div>
  );
}
