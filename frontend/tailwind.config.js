/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
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
          950: "#0e1744",
        },
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(52, 82, 240, 0.35)",
        card: "0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.03)",
        "card-dark": "0 10px 30px -5px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)",
      },
    },
  },
  plugins: [],
};
