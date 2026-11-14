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
        devDark: {
          bg: '#0B0F17',
          surface: '#111827',
          card: '#151D2E',
          cardHover: '#1A2438',
          border: 'rgba(255, 255, 255, 0.08)',
          borderLight: 'rgba(255, 255, 255, 0.15)',
          muted: '#94A3B8',
          text: '#F8FAFC',
        },
        devAccent: {
          violet: '#8B5CF6',
          indigo: '#6366F1',
          cyan: '#06B6D4',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 25px -5px rgba(99, 102, 241, 0.25)',
        cyanGlow: '0 0 25px -5px rgba(6, 182, 212, 0.25)',
        card: '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
