/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FDF9F0',
          100: '#F9F1DC',
          200: '#F1E1B5',
          300: '#E4CD89',
          400: '#D5B760',
          500: '#C5A880', // Royal champagne gold
          600: '#B89758', // Primary gold action
          700: '#9B783E',
          800: '#7E5F32',
          900: '#5F4625',
          950: '#3D2C15',
        },
        ivory: {
          50: '#FDFCF9',
          100: '#FAF8F3',
          200: '#F5F1E8',
          300: '#EFE8DA',
          400: '#E3D8C3',
          500: '#D4C4A8',
        },
        cream: {
          50: '#FCFBF8',
          100: '#F8F5EE',
          200: '#F1ECE0',
          300: '#E6DECC',
          400: '#D7CBAD',
        },
        navy: {
          50: '#F1F5F9',
          100: '#E2E8F0',
          200: '#CBD5E1',
          300: '#94A3B8',
          400: '#64748B',
          500: '#475569',
          600: '#334155',
          700: '#1E293B',
          800: '#0F172A',
          900: '#090D16',
          950: '#05070B',
        },
        emerald: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
        },
        amber: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.02)',
        'card': '0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.02)',
        'luxury': '0 10px 30px -4px rgba(184, 151, 88, 0.12), 0 4px 10px -2px rgba(15, 23, 42, 0.04)',
        'gold-glow': '0 0 20px rgba(197, 168, 128, 0.35)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
      }
    },
  },
  plugins: [],
}
