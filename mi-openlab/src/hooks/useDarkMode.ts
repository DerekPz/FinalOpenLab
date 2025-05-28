import { useEffect, useState } from 'react';

const COLOR_SCHEME = '(prefers-color-scheme: dark)';

export function useDarkMode() {
  // Inicializar el estado con el valor guardado o la preferencia del sistema
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return window.matchMedia(COLOR_SCHEME).matches;
  });

  // Efecto para sincronizar con localStorage y aplicar la clase
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const root = document.documentElement;
    const darkClass = 'dark';

    if (isDark) {
      root.classList.add(darkClass);
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove(darkClass);
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Efecto para escuchar cambios en la preferencia del sistema
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(COLOR_SCHEME);
    const handleChange = (e: MediaQueryListEvent) => {
      const hasStoredPreference = localStorage.getItem('theme') !== null;
      if (!hasStoredPreference) {
        setIsDark(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleDark = () => {
    setIsDark(prev => {
      const newValue = !prev;
      localStorage.setItem('theme', newValue ? 'dark' : 'light');
      return newValue;
    });
  };

  return { isDark, toggleDark, setIsDark };
}