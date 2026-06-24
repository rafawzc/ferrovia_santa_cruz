/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        texto1: '#44312b',
        texto2: '#eae6de',
        componente1: '#6d412a',
        componente3: '#c2b19c',
        componente4: '#daccbe',
        'bg-base': '#c4a27d',
        'bg-page': '#d5c4a8',
        'bg-card': '#c2b19c',
        error: '#dc2626',
        success: '#16a34a',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
