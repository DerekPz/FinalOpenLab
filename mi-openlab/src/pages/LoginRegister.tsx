import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, signInWithGoogle } from '../services/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';

interface LoginRegisterProps {
  mode: 'login' | 'register';
}

export default function LoginRegister({ mode }: LoginRegisterProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isLogin = mode === 'login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      await handleLogin(e);
    } else {
      await handleRegister(e);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !password) {
      setError('Por favor ingresa correo y contraseña.');
      setLoading(false);
      return;
    }

    try {
      await loginUser(email, password);
      navigate('/portal');
    } catch (err: any) {
      console.error(err.message);
      switch (err.code) {
        case 'auth/invalid-email':
          setError('Correo inválido.');
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setError('Correo o contraseña incorrectos.');
          break;
        default:
          setError('Error al autenticar. Verifica los datos.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    try {
      await signInWithGoogle();
      navigate('/portal');
    } catch (err: any) {
      console.error(err.message);
      setError('No se pudo iniciar sesión con Google.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !password) {
      setError('Por favor ingresa correo y contraseña.');
      setLoading(false);
      return;
    }

    if (!displayName) {
      setError('Por favor ingresa tu nombre.');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Crear perfil de usuario con datos de reputación inicializados
      await setDoc(doc(db, 'userProfiles', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: displayName || user.email?.split('@')[0],
        photoURL: user.photoURL,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Inicializar datos de reputación
        reputation: 0,
        achievements: [],
        reputationHistory: [],
        projectCount: 0,
        followersCount: 0,
        likesReceived: 0,
        commentsReceived: 0,
        techStack: []
      });

      navigate('/portal');
    } catch (error: any) {
      console.error('Error during registration:', error);
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('Ese correo ya está registrado.');
          break;
        case 'auth/weak-password':
          setError('La contraseña debe tener al menos 6 caracteres.');
          break;
        case 'auth/invalid-email':
          setError('Correo inválido.');
          break;
        default:
          setError(error.message || 'Error durante el registro');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light dark:bg-darkBackground px-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 shadow-xl rounded-2xl p-8 space-y-6">
        <h2 className="text-3xl font-extrabold text-center bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          {isLogin ? 'Iniciar sesión' : 'Registrarse'}
        </h2>

        {error && (
          <div className="bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 text-sm px-4 py-2 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Nombre completo"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 placeholder:text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 text-darkText dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={loading}
            />
          )}
          <input
            type="email"
            placeholder="Correo electrónico"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 placeholder:text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 text-darkText dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 placeholder:text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 text-darkText dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="w-full bg-primary hover:bg-indigo-600 text-white font-medium py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Cargando...' : isLogin ? 'Entrar' : 'Crear cuenta'}
          </button>
        </form>

        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          {isLogin ? (
            <>
              ¿No tienes cuenta?{' '}
              <Link
                to="/register"
                className="text-primary font-semibold hover:underline"
              >
                Regístrate
              </Link>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{' '}
              <Link
                to="/login"
                className="text-primary font-semibold hover:underline"
              >
                Inicia sesión
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 text-gray-400 text-xs">
          <div className="flex-grow h-px bg-gray-200 dark:bg-zinc-600" />
          o
          <div className="flex-grow h-px bg-gray-200 dark:bg-zinc-600" />
        </div>

        <button
          onClick={handleGoogle}
          className="w-full border border-gray-300 dark:border-zinc-600 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-zinc-700 transition disabled:opacity-50"
          disabled={loading}
        >
          Continuar con Google
        </button>
      </div>
    </div>
  );
}
