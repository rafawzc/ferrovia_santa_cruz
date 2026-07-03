/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        texto1: 'var(--texto1)',
        texto2: 'var(--texto2)',
        componente1: 'var(--componente1)',
        componente3: 'var(--componente3)',
        componente4: 'var(--componente4)',
        'bg-base': 'var(--bg-base)',
        'bg-page': 'var(--bg-page)',
        'bg-card': 'var(--bg-card)',
        'input-bg': 'var(--input-bg)',
        overlay: 'var(--overlay)',
        border: 'var(--border)',
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
