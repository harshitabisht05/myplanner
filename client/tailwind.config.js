/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        planner: {
          bg: 'var(--color-bg)',
          card: 'var(--color-card)',
          text: 'var(--color-text)',
          muted: 'var(--color-muted)',
          primary: 'var(--color-primary)',
          primaryHover: 'var(--color-primary-hover)',
          secondary: 'var(--color-secondary)',
          accent: 'var(--color-accent)',
          border: 'var(--color-border)',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'cozy': '0 4px 20px -2px rgba(139, 92, 246, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'cozy-lg': '0 10px 30px -3px rgba(139, 92, 246, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
