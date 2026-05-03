/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f5f7fb',
          100: '#e8eef8',
          200: '#ced9ee',
          300: '#a7b9df',
          400: '#7694c9',
          500: '#4e72b0',
          600: '#36588d',
          700: '#28436e',
          800: '#1e324f',
          900: '#132033',
        },
      },
      boxShadow: {
        soft: '0 18px 50px rgba(19, 32, 51, 0.12)',
      },
    },
  },
  plugins: [],
};
