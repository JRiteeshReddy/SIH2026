/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#2E7D32',
          light: '#388E3C',
          dark: '#1B5E20',
          deep: '#0F3813'
        },
        leaf: {
          DEFAULT: '#66BB6A',
          light: '#81C784',
          dark: '#4CAF50',
          pale: '#C8E6C9'
        },
        golden: {
          DEFAULT: '#FFD54F',
          light: '#FFE082',
          dark: '#FFB300'
        },
        natureBg: {
          light: '#F4F7F4',
          soft: '#E8F5E9',
          card: '#FFFFFF'
        }
      },
      borderRadius: {
        'card': '22px',
        'card-lg': '26px',
        'pill': '9999px'
      },
      boxShadow: {
        'nature': '0 8px 30px rgba(46, 125, 50, 0.08)',
        'nature-lg': '0 14px 40px rgba(46, 125, 50, 0.14)',
        'nature-glow': '0 0 25px rgba(102, 187, 106, 0.4)',
        'gold-glow': '0 0 25px rgba(255, 213, 79, 0.45)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        journal: ['"Newsreader"', '"Playfair Display"', 'Georgia', 'serif']
      },
      keyframes: {
        floatLeaf: {
          '0%': { transform: 'translateY(100vh) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '0.8' },
          '90%': { opacity: '0.8' },
          '100%': { transform: 'translateY(-20vh) rotate(360deg)', opacity: '0' }
        },
        pulseGlow: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.9' },
          '50%': { transform: 'scale(1.05)', opacity: '1' }
        },
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s infinite ease-in-out',
        'radar-sweep': 'radarSweep 4s linear infinite'
      }
    },
  },
  plugins: [],
}
