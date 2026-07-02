/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        lb: {
          bg: '#1a0e2e',
          surface: '#241640',
          card: '#2c1c4d',
          border: '#4a2d6e',
          accent: '#ff2d78',
          accent2: '#40c4ff',
          'accent-dim': '#cc1f5e',
          muted: '#8d6bb0',
          text: '#ffe0f0',
          'text-dim': '#f0d0e8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: [['Righteous', 'cursive']],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        bounceIn: { from: { opacity: '0', transform: 'scale(0.8)' }, to: { opacity: '1', transform: 'scale(1)' } },
      },
    },
  },
  plugins: [],
}
