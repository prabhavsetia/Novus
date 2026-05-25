/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#faf8f6',
        'ivory-2': '#f5f0ec',
        'ivory-3': '#f0ebe6',
        maroon: {
          DEFAULT: '#8b1e30',
          dark: '#6e1526',
          deep: '#7a1a2e',
        },
        ink: '#2a2020',
        mute: '#a09088',
        mute2: '#c0b8b0',
        line: '#e0d8d2',
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
