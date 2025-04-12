// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // 🌙 Enable dark mode with a class
  theme: {
    extend: {
      colors: {
        primary: '#16a34a',     // Custom green
        secondary: '#1e293b',   // Slate for dark UI
      },
      animation: {
        fadeIn: 'fadeIn 0.4s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
      fontSize: {
        'xxs': '0.65rem', // extra small text
      },
      container: {
        center: true,
        padding: '1rem',
      },
    },
  },
  plugins: [],
};
