import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './experiences/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Base / UI
        void: '#07060D',
        navy: '#0B1020',
        panel: '#0F172A',
        'text-primary': '#E6E6F0',
        'text-muted': '#9AA4BF',

        // Neon Accents
        'neon-cyan': '#1FF2FF',
        'neon-magenta': '#FF3BF5',
        'neon-gold': '#FFD166',
        'neon-green': '#2DFF88',
        'neon-red': '#FF3B3B',

        // Material Tints
        glass: '#BCEBFF',
        'oil-slick': '#2B1B3D',
        heat: '#FF7A18',
      },
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
        display: ['Orbitron', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.24s ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
