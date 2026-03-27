import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        'theme-bg': 'var(--bg-primary)',
        'theme-card': 'var(--bg-card)',
        'theme-accent': 'var(--accent-primary)',
        'theme-text': 'var(--text-primary)',
        'theme-border': 'var(--border-color)',
      },
      boxShadow: {
        brutal: 'var(--shadow)',
        'brutal-hover': 'var(--shadow-hover)',
        'brutal-active': 'var(--shadow-active)',
      },
    },
  },
  plugins: [],
};

export default config;
