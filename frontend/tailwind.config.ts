import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        '27': 'repeat(27, minmax(0, 1fr))',
      },
      colors: {
        background: {
          main: '#F5F3F1',
          dark: '#0F1113',
          'dark-alt': '#121217',
        },
        surface: {
          DEFAULT: 'rgba(255, 255, 255, 0.6)',
          solid: '#FFFFFF',
        },
        text: {
          primary: '#0E151B',
          muted: '#6B6F73',
        },
        accent: {
          soft: '#A7C7B7',
          'soft-alt': '#7A9E8E',
          dark: '#222527',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        montserrat: ['var(--font-montserrat)', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config

