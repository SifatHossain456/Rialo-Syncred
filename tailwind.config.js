/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          cyan:   "#818cf8",   // indigo-400 (Monad-style primary)
          purple: "#c084fc",   // purple-400
          green:  "#34d399",   // emerald-400
          pink:   "#f472b6",   // pink-400
        },
        dark: {
          900: "#070714",   // deepest background
          800: "#0d0d24",   // card background
          700: "#131335",   // elevated card
          600: "#1a1a42",   // border highlight
          500: "#22224e",   // hover state
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        glow:         "glow 2s ease-in-out infinite alternate",
        "slide-up":   "slideUp 0.5s ease-out",
        "fade-in":    "fadeIn 0.6s ease-out",
      },
      keyframes: {
        glow: {
          "0%":   { boxShadow: "0 0 5px #818cf8, 0 0 10px #818cf8" },
          "100%": { boxShadow: "0 0 20px #818cf8, 0 0 40px #818cf8, 0 0 60px #818cf8" },
        },
        slideUp: {
          "0%":   { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: 0 },
          "100%": { opacity: 1 },
        },
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
