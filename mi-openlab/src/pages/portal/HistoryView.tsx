// src/pages/portal/HistoryView.tsx

const mockHistory = [
  {
    description: 'Creaste el proyecto "EcoBlog"',
    timestamp: '2025-05-20 15:40',
  },
  {
    description: 'Editaste el proyecto "Smart Trash"',
    timestamp: '2025-05-18 09:25',
  },
  {
    description: 'Comentaste en "OpenRecipes"',
    timestamp: '2025-05-16 19:00',
  },
];

export default function HistoryView() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-darkText dark:text-white">
        🕓 Historial de actividad
      </h2>

      <ul className="space-y-4 border-l-2 border-primary pl-4">
        {mockHistory.map((item, idx) => (
          <li key={idx} className="relative">
            <div className="absolute -left-2 top-1 w-4 h-4 bg-primary rounded-full border-2 border-white dark:border-zinc-900" />
            <div className="ml-2">
              <p className="text-sm text-zinc-800 dark:text-zinc-300 font-medium">
                {item.description}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {item.timestamp}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
