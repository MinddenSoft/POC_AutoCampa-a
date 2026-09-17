/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#060A14',
          900: '#0C1322',
          800: '#131C31',
          700: '#1B2742',
        },
        brand: {
          400: '#5B9BFF',
          500: '#2E7CF6',
          600: '#1E6AE8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(46,124,246,0.35)',
        panel: '0 8px 30px rgba(0,0,0,0.35)',
      },
      borderColor: {
        DEFAULT: 'rgba(255,255,255,0.08)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
