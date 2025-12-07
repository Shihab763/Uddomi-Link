/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1B5E3C',
        secondary: '#F5A623',
        accent: '#C75B39',
        light: '#FFF8F0',
        dark: '#2D3436',
      }
    },
  },
  plugins: [],
}