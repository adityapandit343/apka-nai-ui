/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0e0c0a',
        cream: '#faf7f2',
        gold: '#c9a84c',
        'gold-light': '#e8d5a3',
        'gold-dark': '#8a6f2e',
        smoke: '#f0ece4',
        muted: '#9c9488',
        blade: '#2a2520',
      },
      fontFamily: {
        playfair: ['Playfair Display', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
      animation: { 'fade-up': 'fadeUp 0.5s ease' },
      keyframes: { fadeUp: { from: { opacity: 0, transform: 'translateY(20px)' } } }
    },
  },
  plugins: [],
}