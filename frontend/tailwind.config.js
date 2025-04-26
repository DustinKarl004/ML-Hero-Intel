/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e8f5ff',
          100: '#d1eaff',
          200: '#a8d5ff',
          300: '#7fbfff',
          400: '#57aaff',
          500: '#2e95ff',
          600: '#0080ff',
          700: '#0066cc',
          800: '#004d99',
          900: '#003366',
        },
        secondary: {
          50: '#fff5e8',
          100: '#ffebd1',
          200: '#ffd7a8',
          300: '#ffc37f',
          400: '#ffaf57',
          500: '#ff9b2e',
          600: '#ff8700',
          700: '#cc6c00',
          800: '#995100',
          900: '#663600',
        },
      },
    },
  },
  plugins: [],
} 