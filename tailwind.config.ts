import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        bg:     "#0A0A1A",
        s1:     "#111122",
        s2:     "#1A1A2E",
        s3:     "#20203a",
        accent: "#4F6FE8",
        good:   "#3FB984",
        warn:   "#E8A24F",
        bad:    "#E86F6F",
      },
      keyframes: {
        fadeUp:  { from: { transform: "translateY(10px)", opacity: "0.01" }, to: { transform: "none", opacity: "1" } },
        fadeIn:  { from: { opacity: "0" }, to: { opacity: "1" } },
        scaleIn: { from: { opacity: "0", transform: "scale(0.97) translateY(6px)" }, to: { opacity: "1", transform: "none" } },
      },
      animation: {
        "fade-up":  "fadeUp 0.4s ease both",
        "fade-in":  "fadeIn 0.2s ease both",
        "scale-in": "scaleIn 0.25s cubic-bezier(.2,.8,.3,1) both",
      },
    },
  },
  plugins: [],
};
export default config;
