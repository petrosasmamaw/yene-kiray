/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FFFDF5',
          100: '#FEF9C3',
          200: '#FEF08A',
          300: '#FDE047',
          400: '#FACC15',
          500: '#EAB308', // Radiant Gold
          DEFAULT: '#F59E0B', // Rich Amber Gold matching Logo
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
          950: '#451A03'
        },
        obsidian: {
          DEFAULT: '#050505',
          card: '#0D0D0D',
          hover: '#141414',
          border: '#222222',
          subtle: '#2E2E2E'
        }
      },
      boxShadow: {
        'gold-sm': '0 2px 10px rgba(245, 158, 11, 0.15)',
        'gold-md': '0 4px 20px rgba(245, 158, 11, 0.25)',
        'gold-lg': '0 10px 35px -5px rgba(245, 158, 11, 0.35)',
        'obsidian-lg': '0 10px 40px -10px rgba(0, 0, 0, 0.8)'
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
