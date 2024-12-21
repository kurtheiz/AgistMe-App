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
          '0%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(15px, -5px)' },
          '50%': { transform: 'translate(5px, 15px)' },
          '75%': { transform: 'translate(-10px, 5px)' }
        },
        'gradient-x': {
          '0%, 100%': { 'background-position': '200% 0' },
          '50%': { 'background-position': '0 0' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' }
        },
        'terminal-type': {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        'terminal-blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' }
        },
        'scanning-cursor': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        }
      },
      animation: {
        'moveLeftToRight': 'moveLeftToRight 8s linear infinite',
        'searchMove': 'searchMove 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'gradient-x': 'gradient-x 3s ease infinite',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'shimmer': 'shimmer 2s infinite',
        'terminal-type': 'terminal-type 0.2s ease-out forwards',
        'terminal-blink': 'terminal-blink 1s step-end infinite',
        'scanning-cursor': 'scanning-cursor 2s ease-in-out infinite'
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
        // Complementary Blue
        blue: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#b9dffb',
          300: '#7cc2f7',
          400: '#36a3f1',
          500: '#0b87dd',
          600: '#006cbe',
          700: '#015796',
          800: '#064b7d',
          900: '#0a3e68',
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
        // Visibility status colors
        visibility: {
          visible: {
            light: '#22c55e', // Green-500
            dark: '#4ade80',  // Green-400
            hover: {
              light: '#16a34a', // Green-600
              dark: '#22c55e',  // Green-500
            }
          },
          hidden: {
            light: '#ef4444', // Red-500
            dark: '#f87171',  // Red-400
            hover: {
              light: '#dc2626', // Red-600
              dark: '#ef4444',  // Red-500
            }
          }
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
          400: '#868e96',  
          500: '#495057',  
          600: '#343a40',  
          700: '#212529',  
          800: '#16191d',  
          900: '#0d0f12',  
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
        'modal-spacing': '1.5rem',
        'section-gap': '1.5rem',
        'icon-size': {
          'sm': '1.25rem',
          'md': '1.5rem',
          'lg': '2rem'
        }
      },
      // Softer border radius for a more natural feel
      borderRadius: {
        'soft': '0.625rem',
        'natural': '1.25rem',
        'modal': '0.5rem',
        'button': '0.375rem'
      },
      // Soft shadows for depth
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(61, 55, 51, 0.05), 0 10px 20px -2px rgba(61, 55, 51, 0.03)',
        'natural': '0 3px 20px -5px rgba(61, 55, 51, 0.1)',
      },
      fontSize: {
        'title': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],
        'subtitle': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '500' }],
        'body': ['1rem', { lineHeight: '1.5rem' }]
      },
      transitionDuration: {
        'hover': '150ms'
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar')({ nocompatible: true }),
  ],
}
