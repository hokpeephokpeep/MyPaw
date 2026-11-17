/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paw: {
          50: '#fffaf5',
          100: '#ffeedd',
          200: '#ffd8b3',
          300: '#ffbc80',
          400: '#ff9847',
          500: '#ff7a1a',
          600: '#ea5d0b',
          700: '#c24209',
          800: '#9b340e',
          900: '#7d2e0f',
        }
      },
      fontFamily: {
        mitr: ['Mitr', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        sans: ['"Google Sans"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
