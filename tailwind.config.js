/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      keyframes: {
        moveLeftToRight: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        searchMove: {
          '0%, 100%': { transform: 'translate(0px, 0px)' },
          '25%': { transform: 'translate(15px, -5px)' },
          '50%': { transform: 'translate(5px, 15px)' },
          '75%': { transform: 'translate(-10px, 5px)' }
        }
      },
      animation: {
        'moveLeftToRight': 'moveLeftToRight 8s linear infinite',
        'searchMove': 'searchMove 4s ease-in-out infinite',
      },
      colors: {
        // Primary colors - Forest Green
        primary: {
          50: '#f3f6f3',
          100: '#e5ede5',
          200: '#c2d6c2',
          300: '#9cbc9c',
          400: '#729b72', // Light forest
          500: '#4a774a', // Medium forest
          600: '#355935', // Dark forest
          700: '#274527',
          800: '#1e361e',
          900: '#162b16',
        },
        // Secondary colors - Matte Green
        secondary: {
          50: '#f5f7f5',
          100: '#e6ebe6',
          200: '#ccd6cc',
          300: '#adbdad',
          400: '#839983', // Light sage
          500: '#5f775f', // Medium sage
          600: '#4c604c', // Dark sage
          700: '#3d4d3d',
          800: '#313e31',
          900: '#283228',
        },
        // Earth tones for accents
        earth: {
          clay: '#c67c4e',    // Terracotta
          sand: '#dcc7b0',    // Warm sand
          stone: '#a3998e',   // Warm gray
          moss: '#869d7f',    // Soft moss
          olive: '#737c3f',   // Olive green
        },
        // Neutral colors (cool grays for dark mode)
        neutral: {
          50: '#f8f9fa',
          100: '#f1f3f5',
          200: '#e9ecef',
          300: '#dee2e6',
          400: '#ced4da',
          500: '#adb5bd',
          600: '#868e96',
          700: '#495057',
          800: '#343a40',
          900: '#212529',
        },
        // Background colors
        background: {
          light: '#f8f9fa',    // Cool white
          dark: '#1a1f2c',     // Deep blue-gray
        },
        // Text colors
        text: {
          light: '#212529',    // Deep cool gray
          dark: '#f8f9fa',     // Cool white
        },
        // Utility colors with earth tones
        success: {
          50: '#f3f7f3',
          500: '#5f775f',      // Sage green
          600: '#4c604c',
        },
        warning: {
          50: '#fdf6f1',
          500: '#c67c4e',      // Terracotta
          600: '#b06a3f',
        },
        error: {
          50: '#fdf4f4',
          500: '#9d5555',      // Muted red
          600: '#854646',
        },
      },
      // Custom spacing if needed
      spacing: {
        '18': '4.5rem',
        '112': '28rem',
        '128': '32rem',
      },
      // Softer border radius for a more natural feel
      borderRadius: {
        'soft': '0.625rem',
        'natural': '1.25rem',
      },
      // Soft shadows for depth
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(61, 55, 51, 0.05), 0 10px 20px -2px rgba(61, 55, 51, 0.03)',
        'natural': '0 3px 20px -5px rgba(61, 55, 51, 0.1)',
      },
    },
  },
  plugins: [],
}
