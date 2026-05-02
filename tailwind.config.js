/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#002B69',
          coral: '#EE4D5E',
        },
      },
    },
  },
  plugins: [],
};
