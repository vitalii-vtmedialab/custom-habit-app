import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Apple HIG light palette
        bg: "#F2F2F7", // systemGroupedBackground
        card: "#FFFFFF",
        sep: "#E5E5EA",
        label: "#000000",
        secondary: "#8E8E93",
        tertiary: "#C7C7CC",
        blue: "#007AFF",
        green: "#34C759",
        red: "#FF3B30",
        orange: "#FF9500",
        teal: "#30B0C7",
        indigo: "#5856D6",
        pink: "#FF2D55",
        ringMove: "#FF375F", // calories ring
        ringStep: "#32D74B", // steps ring (slightly brighter for white bg contrast)
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "sans-serif",
        ],
      },
      borderRadius: {
        ios: "14px",
        card: "18px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)",
        sheet: "0 -8px 30px rgba(0,0,0,0.12)",
      },
    },
  },
  plugins: [],
};
export default config;
