/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f5ff",
          100: "#dbe6ff",
          200: "#b3c9ff",
          300: "#82a4ff",
          400: "#5478ff",
          500: "#3452f0",
          600: "#243bcf",
          700: "#1d2fa6",
          800: "#1a2985",
          900: "#18276b",
        },
      },
    },
  },
  plugins: [],
};
