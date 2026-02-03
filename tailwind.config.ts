import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: '#0B0F14',
        panel: 'rgba(17, 24, 39, 0.75)',
        glow: '#5b8cff'
      },
      boxShadow: {
        glow: '0 0 30px rgba(91, 140, 255, 0.35)',
        card: '0 12px 40px rgba(11, 15, 20, 0.6)'
      }
    }
  },
  plugins: []
};

export default config;
