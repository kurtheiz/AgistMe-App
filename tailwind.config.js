/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary colors - Horse Bay (warm browns)
        primary: {
          50: '#faf6f3',
          100: '#f2ebe4',
          200: '#e6d5c7',
          300: '#d9bea9',
          400: '#c49c7f', // Light bay
          500: '#b07b57', // Medium bay
          600: '#95613f', // Dark bay
          700: '#7a4d32',
          800: '#633e29',
          900: '#513224',
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
        // Neutral colors (warm grays)
        neutral: {
          50: '#faf9f7',
          100: '#f5f3f0',
          200: '#e8e4df',
          300: '#d5cec7',
          400: '#b3aaa1',
          500: '#958b81',
          600: '#7d7268',
          700: '#665c54',
          800: '#504943',
          900: '#3d3733',
        },
        // Background colors
        background: {
          light: '#faf9f7',    // Warm white
          dark: '#2c2521',     // Deep warm brown
        },
        // Text colors
        text: {
          light: '#3d3733',    // Deep warm gray
          dark: '#f5f3f0',     // Soft white
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
