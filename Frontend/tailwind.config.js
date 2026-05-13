/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-light': '#F3F7F5',
        'brand-green': '#4CAF50',
        'brand-green-dark': '#2E7D32',
        'brand-green-light': '#E8F5E9',
        'danger': '#F44336',
        'danger-light': '#FFEBEE',
        'warning': '#FF9800',
        'warning-light': '#FFF3E0',
        'info': '#2196F3',
        'info-light': '#E3F2FD',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
