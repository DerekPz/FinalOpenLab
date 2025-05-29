import type { FC } from 'react';
import type { Achievement } from '../../types/user';

interface UserAchievementsProps {
  achievements: Achievement[];
  reputation: number;
  rank?: number;
}

const UserAchievements: FC<UserAchievementsProps> = ({
  achievements,
  reputation,
  rank
}) => {
  return (
    <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-zinc-700/50">
      <h2 className="text-xl font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text mb-6">
        Logros y Reputación
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reputación */}
        <div className="bg-zinc-900/50 backdrop-blur-sm rounded-lg p-4 border border-zinc-700/30">
          <div className="flex items-center justify-between">
            <span className="text-zinc-300">Reputación</span>
            <span className="text-2xl font-bold text-indigo-400">{reputation}</span>
          </div>
          {rank && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-zinc-400">Rango:</span>
              <span className="text-sm font-medium text-indigo-300">{rank}</span>
            </div>
          )}
        </div>

        {/* Logros */}
        <div className="bg-zinc-900/50 backdrop-blur-sm rounded-lg p-4 border border-zinc-700/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-zinc-300">Logros</span>
            <span className="text-2xl font-bold text-indigo-400">{achievements.length}</span>
          </div>
          <div className="space-y-2">
            {achievements.map((achievement, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-xl">{achievement.icon}</span>
                <span className="text-sm text-zinc-300">{achievement.name}</span>
              </div>
            ))}
            {achievements.length === 0 && (
              <p className="text-sm text-zinc-500 italic">
                Aún no hay logros desbloqueados
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAchievements; 