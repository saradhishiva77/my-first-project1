/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#070b14',
          surface: '#0c1322',
          elevated: '#111b2e',
          card: 'rgba(17, 27, 46, 0.6)',
        },
        border: {
          subtle: 'rgba(148, 163, 184, 0.12)',
          strong: 'rgba(148, 163, 184, 0.22)',
        },
        risk: {
          safe: '#10b981',
          low: '#22c55e',
          medium: '#eab308',
          high: '#f97316',
          critical: '#ef4444',
        },
        accent: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern':
          "url(\"data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none'/%3E%3Cpath d='M40 0H0v40' stroke='rgba(148,163,184,0.05)' stroke-width='1'/%3E%3C/svg%3E\")",
        'radial-glow':
          'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(6,182,212,0.15), transparent)',
        'hero-gradient':
          'linear-gradient(135deg, #070b14 0%, #0c1322 40%, #111b2e 100%)',
      },
      boxShadow: {
        glow: '0 0 40px rgba(6, 182, 212, 0.15)',
        'glow-lg': '0 0 60px rgba(6, 182, 212, 0.25)',
        card: '0 4px 24px rgba(0, 0, 0, 0.3)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.05)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '0.8' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'spin-slow': {
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'pulse-ring': 'pulse-ring 1.8s cubic-bezier(0.215,0.61,0.355,1) infinite',
        shimmer: 'shimmer 1.6s infinite',
        'spin-slow': 'spin-slow 8s linear infinite',
      },
    },
  },
  plugins: [],
};
