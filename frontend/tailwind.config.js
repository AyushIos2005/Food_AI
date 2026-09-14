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
          DEFAULT: "#17130F",
          soft: "#211A14",
          card: "#2A2119",
        },
        // Clean white/near-white background used on onboarding / auth / list screens
        cream: {
          DEFAULT: "#FDFBF8",
          dim: "#F6F1E9",
        },
        ink: {
          DEFAULT: "#1D1B19",
          soft: "#6F6A63",
          faint: "#9A9187",
        },
      },
      fontFamily: {
        display: ["Poppins", "sans-serif"],
        body: ["Inter", "sans-serif"],
        sans: ["Inter", "sans-serif"],
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
