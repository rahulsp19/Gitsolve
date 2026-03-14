import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#248aeb',
        'background-dark': '#111921',
        'background-light': '#f6f7f8',
        brand: {
          50: '#eff6ff',
          500: '#248aeb',
          600: '#1e6fc2',
          900: '#0b0f14',
        },
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        full: '0.75rem',
      },
    },
  },
  plugins: [],
} satisfies Config
