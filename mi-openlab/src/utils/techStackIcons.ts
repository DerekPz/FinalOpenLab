// Mapeo de nombres de tecnologías a sus identificadores en Simple Icons
const techIconsMap: { [key: string]: string } = {
  // Lenguajes
  'JavaScript': 'javascript',
  'TypeScript': 'typescript',
  'Python': 'python',
  'Java': 'java',
  'C++': 'cplusplus',
  'C#': 'csharp',
  'PHP': 'php',
  'Ruby': 'ruby',
  'Swift': 'swift',
  'Kotlin': 'kotlin',
  'Go': 'go',
  'Rust': 'rust',

  // Frontend
  'HTML': 'html5',
  'CSS': 'css3',
  'React': 'react',
  'Vue.js': 'vuedotjs',
  'Angular': 'angular',
  'Svelte': 'svelte',
  'Next.js': 'nextdotjs',
  'Nuxt.js': 'nuxtdotjs',
  'Tailwind': 'tailwindcss',
  'Bootstrap': 'bootstrap',
  'Material-UI': 'mui',
  'Sass': 'sass',

  // Backend
  'Node.js': 'nodedotjs',
  'Express': 'express',
  'Django': 'django',
  'Flask': 'flask',
  'Spring': 'spring',
  'Laravel': 'laravel',
  'Ruby on Rails': 'rails',
  'ASP.NET': 'dotnet',
  'FastAPI': 'fastapi',

  // Bases de datos
  'MongoDB': 'mongodb',
  'PostgreSQL': 'postgresql',
  'MySQL': 'mysql',
  'Redis': 'redis',
  'SQLite': 'sqlite',
  'Oracle': 'oracle',
  'Microsoft SQL Server': 'microsoftsqlserver',

  // Cloud y DevOps
  'AWS': 'amazonaws',
  'Azure': 'microsoftazure',
  'Google Cloud': 'googlecloud',
  'Docker': 'docker',
  'Kubernetes': 'kubernetes',
  'Jenkins': 'jenkins',
  'Git': 'git',
  'GitHub': 'github',
  'GitLab': 'gitlab',

  // Testing
  'Jest': 'jest',
  'Cypress': 'cypress',
  'Selenium': 'selenium',
  'Mocha': 'mocha',

  // Mobile
  'React Native': 'react',
  'Flutter': 'flutter',
  'Ionic': 'ionic',
  'Android': 'android',
  'iOS': 'ios',

  // Otros
  'Firebase': 'firebase',
  'GraphQL': 'graphql',
  'WebSocket': 'websocket',
  'Redux': 'redux',
  'Webpack': 'webpack',
  'Vite': 'vite',
};

export function getTechIconUrl(techName: string): string {
  const normalizedName = techName.toLowerCase();
  const iconId = techIconsMap[techName] || 
                techIconsMap[Object.keys(techIconsMap).find(key => 
                  key.toLowerCase() === normalizedName
                ) || ''] || 
                'code'; // Fallback a un icono genérico

  return `https://cdn.simpleicons.org/${iconId}`;
} 