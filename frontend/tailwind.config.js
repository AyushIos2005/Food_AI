/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Warm orange accent used across CTAs, active states, badges
        primary: {
          50: "#FFF3EA",
          100: "#FFE2CC",
          300: "#FBAE6B",
          500: "#F2760F",
          600: "#DA6606",
          700: "#B85405",
        },
        // Near-black warm background for splash / hero / dark screens
        night: {
          DEFAULT: "#16110D",
          soft: "#211A14",
          card: "#2A2119",
        },
        // Warm off-white background used on onboarding / auth / list screens
        cream: {
          DEFAULT: "#FDF8F1",
          dim: "#F5EEE3",
        },
        ink: {
          DEFAULT: "#231C15",
          soft: "#5C544A",
          faint: "#9A8F81",
        },
      },
      fontFamily: {
        display: ["Poppins", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        card: "0 6px 20px -8px rgba(35, 28, 21, 0.25)",
      },
      maxWidth: {
        app: "480px",
      },
    },
  },
  plugins: [],
};
