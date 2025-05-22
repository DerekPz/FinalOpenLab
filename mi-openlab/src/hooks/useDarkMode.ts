import { useEffect, useState } from 'react';

export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);

useEffect(() => {
  const saved = localStorage.getItem('theme');

  if (saved === 'dark') {
    setIsDark(true);
  } else if (saved === 'light') {
    setIsDark(false);
  } else {
    // Si no hay nada guardado, usa preferencia del sistema
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(prefersDark);
    localStorage.setItem('theme', prefersDark ? 'dark' : 'light');
  }
}, []);


  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return { isDark, toggleDark: () => setIsDark((prev) => !prev) };
}
