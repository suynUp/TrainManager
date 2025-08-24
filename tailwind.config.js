/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
   mode: 'jit',
  purge: ['./src/**/*.{js,jsx,ts,tsx}'],
  plugins: [],
};
