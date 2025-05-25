/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
    primary: '#2563eb',
    light: '#F9FAFB',
    darkText: '#1f2937', // gris-800 de Tailwind
    darkBackground: '#111827', // gris-900 // 👈 nuevo nombre para evitar conflicto
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar')({ nocompatible: true }),
  ],
}
