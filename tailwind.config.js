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
        // Premium Light Mode Palette
        primary: {
          DEFAULT: "#F7F9FC", // Soft White-Blue Background
          card: "#FFFFFF",    // Pure White for cards
          border: "#E6EEF5",  // Subtle Border
        },
        accent: {
          emerald: "#10b981", // Primary Discovery Green
          cyan: "#22d3ee",
          teal: "#0d9488",
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      zIndex: {
        '0': '0',
        '10': '10',
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50',
        '100': '100',
        '1050': '1050',
      },
      boxShadow: {
        'soft': '0 10px 40px rgba(0, 0, 0, 0.06)',
        'premium': '0 20px 60px -12px rgba(0, 0, 0, 0.1)',
        'float': '0 15px 35px -5px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
