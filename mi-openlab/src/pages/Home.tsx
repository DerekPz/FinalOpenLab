import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Code, Users, Trophy } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen w-full bg-zinc-50/80 dark:bg-zinc-900">
      <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:py-10 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="pt-16 sm:pt-20 pb-8 sm:pb-12 text-center">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 mb-6">
            OpenShelf
          </h1>
          <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-8">
            Una plataforma para desarrolladores donde puedes compartir tus proyectos, 
            aprender de otros y crecer en comunidad.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/explore"
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              Explorar proyectos
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
            {!user && (
              <Link
                to="/login"
                className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-3 py-12">
          <div className="p-6 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center mb-4">
              <Code className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
              Comparte tus proyectos
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Muestra tus proyectos al mundo y recibe feedback de otros desarrolladores.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
              Únete a comunidades
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Conecta con otros desarrolladores y participa en discusiones técnicas.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
              Gana reputación
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Construye tu perfil profesional y destaca en la comunidad.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-12">
          <Link
            to={user ? "/portal" : "/register"}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition-colors"
          >
            {user ? 'Ir a mi portal' : 'Únete a la comunidad'}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
} 