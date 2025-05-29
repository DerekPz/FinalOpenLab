import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '../services/firebase';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [oobCode, setOobCode] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Verificar si venimos de una redirección después de cambiar la contraseña
    const urlParams = new URLSearchParams(location.search);
    const mode = urlParams.get('mode');
    
    if (mode === 'action') {
      // Si venimos de completar el cambio de contraseña, redirigir al login
      navigate('/login');
      return;
    }

    // Resto del código existente para manejar el código de restablecimiento
    const code = urlParams.get('oobCode');
    
    if (!code) {
      setError('Enlace inválido o expirado. Por favor solicita un nuevo enlace de recuperación.');
      setLoading(false);
      return;
    }

    setOobCode(code);
    
    verifyPasswordResetCode(auth, code)
      .then((email) => {
        setEmail(email);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error verificando código:', error);
        setError('El enlace ha expirado o es inválido. Por favor solicita un nuevo enlace de recuperación.');
        setLoading(false);
      });
  }, [location, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oobCode) return;

    setError('');
    
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccess(true);
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      console.error('Error resetting password:', error);
      switch (error.code) {
        case 'auth/expired-action-code':
          setError('El enlace ha expirado. Por favor solicita uno nuevo.');
          break;
        case 'auth/weak-password':
          setError('La contraseña es demasiado débil. Debe tener al menos 6 caracteres.');
          break;
        case 'auth/invalid-action-code':
          setError('El enlace es inválido o ya fue usado. Por favor solicita uno nuevo.');
          break;
        default:
          setError('Error al cambiar la contraseña. Por favor intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRequestNewLink = () => {
    navigate('/forgot-password');
  };

  if (loading && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light dark:bg-darkBackground px-4">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 shadow-xl rounded-2xl p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
          <p className="text-center mt-4 text-gray-600 dark:text-gray-400">
            Verificando enlace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-light dark:bg-darkBackground px-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 shadow-xl rounded-2xl p-8 space-y-6">
        <h2 className="text-3xl font-extrabold text-center bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          {error ? 'Error' : success ? '¡Listo!' : 'Cambiar contraseña'}
        </h2>

        {email && !error && !success && (
          <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Cambiando contraseña para <span className="font-medium">{email}</span>
          </div>
        )}

        {error ? (
          <div className="space-y-6">
            <div className="bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 text-sm px-4 py-3 rounded">
              {error}
            </div>
            <button
              onClick={handleRequestNewLink}
              className="w-full bg-primary hover:bg-indigo-600 text-white font-medium py-2 rounded-lg transition-all duration-200"
            >
              Solicitar nuevo enlace
            </button>
          </div>
        ) : success ? (
          <div className="space-y-6">
            <div className="bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200 text-sm px-4 py-3 rounded">
              <p className="font-medium">¡Tu contraseña ha sido cambiada exitosamente!</p>
              <p className="mt-1">Ya puedes iniciar sesión con tu nueva contraseña.</p>
            </div>
            <div className="flex flex-col space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Serás redirigido al inicio de sesión en unos segundos...
              </p>
              <Link
                to="/login"
                className="text-center bg-primary hover:bg-indigo-600 text-white font-medium py-2 rounded-lg transition-all duration-200"
              >
                Ir al inicio de sesión
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <input
                type="password"
                placeholder="Nueva contraseña"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 placeholder:text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 text-darkText dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
              <input
                type="password"
                placeholder="Confirmar nueva contraseña"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 placeholder:text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 text-darkText dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary hover:bg-indigo-600 text-white font-medium py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Cambiando contraseña...' : 'Cambiar contraseña'}
            </button>
          </form>
        )}

        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
} 