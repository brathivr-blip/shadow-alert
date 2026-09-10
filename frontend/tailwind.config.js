/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        midnight: {
          950: '#070B14',
          900: '#0B1220',
          800: '#131B2E',
          700: '#1B2740',
          600: '#28375A',
          500: '#3A4B75',
        },
        glow: {
          DEFAULT: '#F5A623',
          soft: '#FBC565',
          dim: '#7A5A22',
        },
        alert: {
          DEFAULT: '#E5484D',
          soft: '#F79A9D',
        },
        signal: {
          DEFAULT: '#34D399',
          soft: '#9BEFCF',
        },
        ink: {
          100: '#EDF1F9',
          300: '#C4CEE0',
          500: '#8592AD',
          700: '#5A657F',
        },
      },
      fontFamily: {
        display: ['"Sora"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      backgroundImage: {
        'lamp-glow': 'radial-gradient(circle at 50% 0%, rgba(245,166,35,0.18), transparent 60%)',
        'grid-fade': 'linear-gradient(180deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
      },
      boxShadow: {
        glow: '0 0 40px rgba(245,166,35,0.25)',
        card: '0 8px 30px rgba(2,6,15,0.45)',
      },
      keyframes: {
        flicker: {
          '0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%': { opacity: 1 },
          '20%, 22%, 24%, 55%': { opacity: 0.35 },
        },
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(245,166,35,0.5)' },
          '100%': { boxShadow: '0 0 0 14px rgba(245,166,35,0)' },
        },
      },
      animation: {
        flicker: 'flicker 4s linear infinite',
        pulseRing: 'pulseRing 1.6s ease-out infinite',
      },
    },
  },
  plugins: [],
};
