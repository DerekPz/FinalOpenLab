import { useState } from 'react';
import { migrateHistoricalReputation } from '../../services/reputation';

export default function ReputationMigration() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleMigration = async () => {
    try {
      setIsLoading(true);
      setStatus('Iniciando migración...');
      setError(null);
      
      await migrateHistoricalReputation();
      
      setStatus('¡Migración completada con éxito!');
    } catch (error) {
      console.error('Error during migration:', error);
      setError('Error durante la migración. Por favor, revisa la consola para más detalles.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm">
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Migración del Sistema de Reputación
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">
              Esta herramienta calculará la reputación para todos los usuarios basada en sus acciones históricas
            </p>
          </div>

          <div className="p-6 space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 p-4 rounded-lg">
              <p>⚠️ <strong>Advertencia:</strong> Esta operación:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Recalculará la reputación para todos los usuarios</li>
                <li>Puede tomar varios minutos en completarse</li>
                <li>No debe interrumpirse una vez iniciada</li>
              </ul>
            </div>

            <button
              onClick={handleMigration}
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-xl font-medium text-white transition
                ${isLoading 
                  ? 'bg-zinc-400 cursor-not-allowed' 
                  : 'bg-primary hover:bg-indigo-600'
                }`}
            >
              {isLoading ? 'Migrando...' : 'Iniciar Migración'}
            </button>

            {status && (
              <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 p-4 rounded-lg">
                {status}
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-lg">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 