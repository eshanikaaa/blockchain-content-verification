// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 1. Define the keyframes for our "flow" animation
      keyframes: {
        flow: {
          'from': { 'stroke-dashoffset': 0 },
          'to': { 'stroke-dashoffset': -100 },
        }
      },
      // 2. Register "flow" as a usable animation class
      animation: {
        flow: 'flow 1.5s linear infinite',
      }
    },
  },
  plugins: [],
}