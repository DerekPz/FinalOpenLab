// src/pages/portal/MyProfileView.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile, updateUserProfile, uploadProfileImage } from '../../services/userProfile';
import type { UserProfile, TechStack } from '../../types/user';
import { Linkedin, Github, Globe, Plus, X, Upload } from 'lucide-react';
import FollowersModal from '../../components/FollowersModal';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase';

// Mapeo de nombres de tecnologías a sus identificadores en Simple Icons
const techLogoMapping: { [key: string]: string } = {
  // Frontend
  'html': 'html5',
  'html5': 'html5',
  'css': 'css3',
  'javascript': 'javascript',
  'typescript': 'typescript',
  'react': 'react',
  'vue': 'vuedotjs',
  'angular': 'angular',
  'tailwind': 'tailwindcss',
  'bootstrap': 'bootstrap',
  'sass': 'sass',
  'next.js': 'nextdotjs',
  'nextjs': 'nextdotjs',
  
  // Backend
  'node': 'nodedotjs',
  'nodejs': 'nodedotjs',
  'python': 'python',
  'django': 'django',
  'php': 'php',
  'java': 'java',
  'spring': 'spring',
  'ruby': 'ruby',
  'rails': 'rubyonrails',
  
  // Bases de datos
  'mongodb': 'mongodb',
  'mysql': 'mysql',
  'postgresql': 'postgresql',
  'firebase': 'firebase',
  
  // Herramientas
  'git': 'git',
  'docker': 'docker',
  'kubernetes': 'kubernetes',
  'aws': 'amazonaws',
  'vscode': 'visualstudiocode',
};

// Función para obtener el identificador correcto del logo
const getLogoIdentifier = (techName: string): string => {
  const normalizedName = techName.toLowerCase().trim();
  return techLogoMapping[normalizedName] || normalizedName;
};

// Función para formatear el tiempo de experiencia
const formatExperience = (years: number, months: number = 0): string => {
  const totalMonths = (years * 12) + months;
  
  if (totalMonths < 12) {
    return `${totalMonths} ${totalMonths === 1 ? 'mes' : 'meses'} de experiencia`;
  }
  
  const remainingYears = Math.floor(totalMonths / 12);
  const remainingMonths = totalMonths % 12;
  
  if (remainingMonths === 0) {
    return `${remainingYears} ${remainingYears === 1 ? 'año' : 'años'} de experiencia`;
  }
  
  return `${remainingYears} ${remainingYears === 1 ? 'año' : 'años'} y ${remainingMonths} ${remainingMonths === 1 ? 'mes' : 'meses'} de experiencia`;
};

export default function MyProfileView() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [newTech, setNewTech] = useState<Partial<TechStack>>({
    name: '',
    level: 'Básico',
    yearsOfExperience: 0,
    monthsOfExperience: 0
  });

  useEffect(() => {
    async function loadProfile() {
      console.log('Loading profile, user:', user); // Debug log
      
      if (!user?.uid) {
        console.log('No user UID found'); // Debug log
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        console.log('Fetching profile for UID:', user.uid); // Debug log
        const userProfile = await getUserProfile(user.uid);
        
        console.log('Profile data:', userProfile); // Debug log
        
        if (!userProfile) {
          console.log('No profile found for user'); // Debug log
          setError('No se encontró el perfil. Por favor, contacta a soporte.');
          return;
        }

        // Sincronizar contadores de seguidores/seguidos
        const followingRef = collection(db, `userProfiles/${user.uid}/following`);
        const followingSnapshot = await getDocs(followingRef);
        const followingCount = followingSnapshot.size;

        const followersRef = collection(db, `userProfiles/${user.uid}/followers`);
        const followersSnapshot = await getDocs(followersRef);
        const followersCount = followersSnapshot.size;

        // Actualizar contadores si son diferentes
        if (followingCount !== userProfile.followingCount || followersCount !== userProfile.followersCount) {
          console.log('Updating follow counts:', { followingCount, followersCount });
          await updateDoc(doc(db, 'userProfiles', user.uid), {
            followingCount,
            followersCount
          });
          userProfile.followingCount = followingCount;
          userProfile.followersCount = followersCount;
        }
        
        setProfile(userProfile);
      } catch (error) {
        console.error('Detailed error loading profile:', error); // Enhanced error logging
        setError('Error al cargar el perfil. Por favor, intenta más tarde.');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadProfile();
  }, [user]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user?.uid) {
      try {
        const photoURL = await uploadProfileImage(user.uid, file);
        setProfile(prev => prev ? { ...prev, photoURL } : null);
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
  };

  const handleProfileUpdate = async (data: Partial<UserProfile>) => {
    if (user?.uid && profile) {
      try {
        await updateUserProfile(user.uid, data);
        setProfile(prev => prev ? { ...prev, ...data } : null);
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    }
  };

  const handleAddTech = () => {
    if (newTech.name && newTech.level && newTech.yearsOfExperience !== undefined && newTech.monthsOfExperience !== undefined) {
      const tech = newTech as TechStack;
      handleProfileUpdate({
        techStack: [...(profile?.techStack || []), tech]
      });
      setNewTech({ name: '', level: 'Básico', yearsOfExperience: 0, monthsOfExperience: 0 });
    }
  };

  const handleRemoveTech = (techName: string) => {
    handleProfileUpdate({
      techStack: profile?.techStack.filter(tech => tech.name !== techName) || []
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="text-center p-6">
        <p className="text-red-500">Error al cargar el perfil. Por favor, recarga la página.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Cabecera del perfil */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-700/50">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            <img
              src={profile.photoURL || user.photoURL || '/default-avatar.png'}
              alt={profile.displayName}
              className="w-32 h-32 rounded-full object-cover"
            />
            <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              <Upload className="w-6 h-6 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.displayName}
                      onChange={e => handleProfileUpdate({ displayName: e.target.value })}
                      className="bg-transparent border-b border-zinc-300 dark:border-zinc-600 focus:outline-none focus:border-primary"
                    />
                  ) : (
                    profile.displayName
                  )}
                </h1>

                {/* Estadísticas de seguidores */}
                <div className="flex items-center gap-6 mt-4">
                  <button 
                    onClick={() => setShowFollowersModal(true)}
                    className="text-center hover:bg-zinc-100 dark:hover:bg-zinc-700/50 px-3 py-1 rounded-lg transition"
                  >
                    <div className="text-lg font-bold text-zinc-900 dark:text-white">
                      {profile?.followersCount || 0}
                    </div>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                      Seguidores
                    </div>
                  </button>

                  <button 
                    onClick={() => setShowFollowingModal(true)}
                    className="text-center hover:bg-zinc-100 dark:hover:bg-zinc-700/50 px-3 py-1 rounded-lg transition"
                  >
                    <div className="text-lg font-bold text-zinc-900 dark:text-white">
                      {profile?.followingCount || 0}
                    </div>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                      Siguiendo
                    </div>
                  </button>
                </div>

                {isEditing ? (
                  <textarea
                    value={profile.bio}
                    onChange={e => handleProfileUpdate({ bio: e.target.value })}
                    placeholder="Escribe una breve biografía..."
                    className="mt-2 w-full bg-transparent border rounded-lg p-2 focus:outline-none focus:border-primary dark:border-zinc-600"
                    rows={3}
                  />
                ) : (
                  <p className="mt-2 text-zinc-600 dark:text-zinc-400">{profile.bio || 'Sin biografía'}</p>
                )}
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-primary hover:text-indigo-700 font-medium"
              >
                {isEditing ? 'Guardar' : 'Editar'}
              </button>
            </div>
          </div>
        </div>

        {/* Enlaces profesionales */}
        <div className="mt-6 flex flex-wrap justify-center sm:justify-start gap-4">
          {profile.linkedInUrl && (
            <a
              href={profile.linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:text-indigo-700"
            >
              <Linkedin className="w-5 h-5" />
              LinkedIn
            </a>
          )}
          {profile.githubUrl && (
            <a
              href={profile.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:text-indigo-700"
            >
              <Github className="w-5 h-5" />
              GitHub
            </a>
          )}
          {profile.websiteUrl && (
            <a
              href={profile.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:text-indigo-700"
            >
              <Globe className="w-5 h-5" />
              Sitio web
            </a>
          )}
        </div>
      </div>

      {/* Stack tecnológico */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-700/50">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4 ">Stack Tecnológico</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
          {profile.techStack?.map(tech => (
            <div
              key={tech.name}
              className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-white dark:bg-zinc-800 rounded-lg">
                  <img
                    src={`https://cdn.simpleicons.org/${getLogoIdentifier(tech.name)}`}
                    alt={`${tech.name} logo`}
                    className="w-6 h-6"
                    onError={(e) => {
                      const target = e.currentTarget;
                      const techName = tech.name.toLowerCase();
                      if (target.src.includes(tech.name)) {
                        target.src = `https://cdn.simpleicons.org/${techName}`;
                      } else {
                        target.src = 'https://cdn.simpleicons.org/code/808080';
                      }
                    }}
                  />
                </div>
                <div>
                  <h3 className="font-medium text-zinc-900 dark:text-white">{tech.name}</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {tech.level} · {formatExperience(tech.yearsOfExperience, tech.monthsOfExperience)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRemoveTech(tech.name)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Formulario para agregar tecnología */}
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Nombre de la tecnología"
              value={newTech.name}
              onChange={e => setNewTech(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-transparent border rounded-lg px-3 py-2 focus:outline-none focus:border-primary dark:border-zinc-600"
            />
          </div>
          <div>
            <select
              value={newTech.level}
              onChange={e => setNewTech(prev => ({ ...prev, level: e.target.value as TechStack['level'] }))}
              className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm"
            >
              <option value="Básico">Básico</option>
              <option value="Intermedio">Intermedio</option>
              <option value="Avanzado">Avanzado</option>
            </select>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <input
                type="number"
                min="0"
                max="50"
                placeholder="Años"
                value={newTech.yearsOfExperience}
                onChange={e => setNewTech(prev => ({ ...prev, yearsOfExperience: parseInt(e.target.value) || 0 }))}
                className="w-20 bg-transparent border rounded-lg px-3 py-2 focus:outline-none focus:border-primary dark:border-zinc-600"
              />
              <span className="absolute right-3 top-2 text-sm text-zinc-500">años</span>
            </div>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="11"
                placeholder="Meses"
                value={newTech.monthsOfExperience}
                onChange={e => setNewTech(prev => ({ ...prev, monthsOfExperience: parseInt(e.target.value) || 0 }))}
                className="w-20 bg-transparent border rounded-lg px-3 py-2 focus:outline-none focus:border-primary dark:border-zinc-600"
              />
              <span className="absolute right-3 top-2 text-sm text-zinc-500">meses</span>
            </div>
          </div>
          <button
            onClick={handleAddTech}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5" />
            Agregar
          </button>
        </div>
      </div>

      {/* Enlaces profesionales (edición) */}
      {isEditing && (
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-sm border-zinc-200 dark:border-zinc-700/50">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4 ">Enlaces Profesionales</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                LinkedIn URL
              </label>
              <input
                type="url"
                value={profile.linkedInUrl || ''}
                onChange={e => handleProfileUpdate({ linkedInUrl: e.target.value })}
                placeholder="https://linkedin.com/in/tu-perfil"
                className="w-full bg-transparent border rounded-lg px-3 py-2 focus:outline-none focus:border-primary dark:border-zinc-600"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                GitHub URL
              </label>
              <input
                type="url"
                value={profile.githubUrl || ''}
                onChange={e => handleProfileUpdate({ githubUrl: e.target.value })}
                placeholder="https://github.com/tu-usuario"
                className="w-full bg-transparent border rounded-lg px-3 py-2 focus:outline-none focus:border-primary dark:border-zinc-600"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Sitio Web Personal
              </label>
              <input
                type="url"
                value={profile.websiteUrl || ''}
                onChange={e => handleProfileUpdate({ websiteUrl: e.target.value })}
                placeholder="https://tu-sitio-web.com"
                className="w-full bg-transparent border rounded-lg px-3 py-2 focus:outline-none focus:border-primary dark:border-zinc-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* Modales de seguidores/seguidos */}
      {user && (
        <>
          <FollowersModal
            isOpen={showFollowersModal}
            onClose={() => setShowFollowersModal(false)}
            userId={user.uid}
            mode="followers"
          />
          <FollowersModal
            isOpen={showFollowingModal}
            onClose={() => setShowFollowingModal(false)}
            userId={user.uid}
            mode="following"
          />
        </>
      )}
    </div>
  );
}
