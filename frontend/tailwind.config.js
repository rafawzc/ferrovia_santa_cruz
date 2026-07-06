/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        texto1: 'rgb(var(--texto1) / <alpha-value>)',
        texto2: 'rgb(var(--texto2) / <alpha-value>)',
        componente1: 'rgb(var(--componente1) / <alpha-value>)',
        componente3: 'rgb(var(--componente3) / <alpha-value>)',
        componente4: 'rgb(var(--componente4) / <alpha-value>)',
        'bg-base': 'rgb(var(--bg-base) / <alpha-value>)',
        'bg-page': 'rgb(var(--bg-page) / <alpha-value>)',
        'bg-card': 'rgb(var(--bg-card) / <alpha-value>)',
        'input-bg': 'var(--input-bg)',
        overlay: 'var(--overlay)',
        border: 'rgb(var(--border) / <alpha-value>)',
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
