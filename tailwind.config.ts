import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sand: {
          50: "#FAFAF9",
          100: "#F5F5F3",
          200: "#EAEAE6",
          300: "#DCDCD6",
          400: "#B8B8B0",
        },
        charcoal: {
          950: "#0C0D0E",
          900: "#141619",
          800: "#22252A",
          700: "#323740",
          600: "#4B5260",
          400: "#707A8A",
        },
        amber: {
          accent: "#D97706",
          glow: "#F59E0B",
          dark: "#B45309",
          light: "#FDE68A",
        },
        earth: {
          900: "#2A2017",
          800: "#3D2F22",
          700: "#5A4736",
          100: "#F7F3EE",
        },
      },
      fontFamily: {
        outfit: ["var(--font-outfit)", "sans-serif"],
        sans: ["var(--font-plus-jakarta)", "system-ui", "-apple-system", "sans-serif"],
        syne: ["var(--font-outfit)", "sans-serif"],
        satoshi: ["var(--font-plus-jakarta)", "system-ui", "-apple-system", "sans-serif"],
      },
      letterSpacing: {
        tightest: "-0.04em",
        tighter: "-0.02em",
        widest: "0.25em",
        tactical: "0.35em",
      },
    },
  },
  plugins: [],
};

export default config;
