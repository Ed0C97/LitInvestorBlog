// tailwind.config.js

import tailwindAnimate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'media',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // NOMI DELLE CLASSI SENZA "color-"

        'blue': 'hsl(var(--color-blue) / <alpha-value>)',
        'antracite': 'hsl(var(--color-antracite) / <alpha-value>)',
        'green': 'hsl(var(--color-green) / <alpha-value>)',
        'yellow': 'hsl(var(--color-yellow) / <alpha-value>)',
        'red': 'hsl(var(--color-red) / <alpha-value>)',
        'white': 'hsl(var(--color-white) / <alpha-value>)',
        'light-gray': 'hsl(var(--color-light-gray) / <alpha-value>)',
        'input-gray': 'hsl(var(--color-border-input-gray) / <alpha-value>)',
        'gray': 'hsl(var(--color-gray) / <alpha-value>)',
        'dark-gray': 'hsl(var(--color-dark-gray) / <alpha-value>)',

        'blue-glass': 'hsl(var(--color-blue) / 0.1)',
        'green-glass': 'hsl(var(--color-green) / 0.1)',
        'yellow-glass': 'hsl(var(--color-yellow) / 0.1)',
        'red-glass': 'hsl(var(--color-red) / 0.1)',
        'white-glass': 'hsl(var(--color-white) / 0.1)',
        'white-glass-border': 'hsl(var(--color-white) / 0.3)',

        'avatar-1': 'hsl(var(--color-avatar-1) / <alpha-value>)',
        'avatar-2': 'hsl(var(--color-avatar-2) / <alpha-value>)',
        'avatar-3': 'hsl(var(--color-avatar-3) / <alpha-value>)',
        'avatar-4': 'hsl(var(--color-avatar-4) / <alpha-value>)',
        'avatar-5': 'hsl(var(--color-avatar-5) / <alpha-value>)',
        'avatar-6': 'hsl(var(--color-avatar-6) / <alpha-value>)',
        'avatar-7': 'hsl(var(--color-avatar-7) / <alpha-value>)',
        'avatar-8': 'hsl(var(--color-avatar-8) / <alpha-value>)',
        'avatar-9': 'hsl(var(--color-avatar-9) / <alpha-value>)',
        'avatar-10': 'hsl(var(--color-avatar-10) / <alpha-value>)',
        'avatar-11': 'hsl(var(--color-avatar-11) / <alpha-value>)',
        'avatar-12': 'hsl(var(--color-avatar-12) / <alpha-value>)',

      },

      boxShadow: {
        'glass': '0 0 80px hsl(var(--color-black) / 0.25)',
        'default': '0 1px 20px hsl(var(--color-gray) / 0.05)', // <-- NUOVA OMbra di default
      },

      backgroundImage: {
        'login-texture-dark_1': "url('/src/assets/login_texture_dark_1.webp')",
        'login-texture-dark_2': "url('/src/assets/login_texture_dark_2.webp')",
        'login-texture-light': "url('/src/assets/login_texture_light.webp')",
        'login-texture-dynamic': "url('/src/assets/animated-gradient.svg')",
      },

      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.23, 1, 0.32, 1)',
      },

      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        'fadeIn': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fadeIn': 'fadeIn 0.3s ease-out',
      },
    },
  },
  plugins: [tailwindAnimate],
};