/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0D0D0D',
        'bg-card': '#111111',
        'bg-elevated': '#161616',
        accent: '#7C3AED',
        'accent-light': '#9D6EFF',
        sand: '#C9B99A',
        'sand-bright': '#E8D5B5',
        'sand-muted': '#6B5E4E',
        'status-up': '#4ADE80',
        'status-down': '#F87171',
        'status-unknown': '#FBBF24',
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
      transitionTimingFunction: {
        custom: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        700: '700ms',
      },
      borderColor: {
        DEFAULT: 'rgba(255,255,255,0.06)',
      },
    },
  },
  plugins: [],
}
