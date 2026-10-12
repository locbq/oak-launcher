/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        oak: {
          950: '#0a0d14',
          900: '#111726',
          800: '#1a233a',
          700: '#263454',
          600: '#384d7a',
          500: '#4f6ea8',
          accent: '#e63946',
          gold: '#f4a261',
          emerald: '#2a9d8f'
        }
      }
    },
  },
  plugins: [],
}
