/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#dde8ff',
          500: '#3b5bdb',
          600: '#364fc7',
          700: '#2f44ad',
        }
      }
    }
  },
  plugins: [],
}
