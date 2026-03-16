import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Temasek Trust Brand Colors
        trust: {
          blue: "#003366",
          accent: "#0066CC",
          light: "#E6F0FA",
        },
        // UI Colors
        background: "#FFFFFF",
        card: "#FAFBFC",
        border: "#E1E4E8",
        // Text Colors
        primary: "#1F2328",
        secondary: "#57606A",
        // Status Colors
        warning: "#CF222E",
        success: "#1A7F37",
        // Disease Category Colors
        disease: {
          infectious: "#4472C4",
          maternal: "#C00000",
          ncd: "#70AD47",
          injuries: "#FFC000",
          mental: "#7030A0",
          substance: "#9B59B6",
          others: "#546E7A",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
