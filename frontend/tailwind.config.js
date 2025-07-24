/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'primary-dark': '#122435',
        'primary-red': '#CC361E', 
        'secondary-gray': '#B3B3B3',
        'light-bg': '#EFEFEF',
        'primary-blue': '#224766',
      }
    },
  },
  plugins: [],
};