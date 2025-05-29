import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from '../services/auth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    if (!email) {
      setError('Por favor ingresa tu correo electrónico.');
      setLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(email);
      setSuccess(true);
    } catch (err: any) {
      console.error(err.message);
      switch (err.code) {
        case 'auth/invalid-email':
          setError('Correo inválido.');
          break;
        case 'auth/user-not-found':
          setError('No existe una cuenta con este correo.');
          break;
        default:
          setError('Error al enviar el correo de recuperación.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light dark:bg-darkBackground px-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 shadow-xl rounded-2xl p-8 space-y-6">
        <h2 className="text-3xl font-extrabold text-center bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          Recuperar contraseña
        </h2>

        {error && (
          <div className="bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 text-sm px-4 py-2 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200 text-sm px-4 py-2 rounded">
            Se ha enviado un correo con las instrucciones para recuperar tu contraseña.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Correo electrónico"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 placeholder:text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 text-darkText dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="w-full bg-primary hover:bg-indigo-600 text-white font-medium py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Enviando...' : 'Enviar correo de recuperación'}
          </button>
        </form>

        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
} 