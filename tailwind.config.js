/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          deep: '#0B1426',
        },
        brand: {
          green: '#5EC08A',
        },
        champagne: {
          DEFAULT: '#C9A84C',
        },
        ivory: {
          DEFAULT: '#FAF8F5',
        },
        slate: {
          dark: '#1A1F2E',
        },
        ghost: {
          white: '#F0F2F5',
        },
        charcoal: {
          DEFAULT: '#0F0F14',
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        '2xl': '2rem',
        '3xl': '3rem',
        '4xl': '4rem',
      },
    }
  },
  plugins: [],
}
