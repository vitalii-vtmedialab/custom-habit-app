import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Warm earthy palette — sage, honey, terracotta on a soft cream base
        bg: "#F4F1E9", // warm cream grouped background
        card: "#FFFFFF",
        sep: "#E8E1D3",
        label: "#29251E", // warm near-black
        secondary: "#978A75",
        tertiary: "#C8BDA9",
        blue: "#5E9A6F", // repurposed as primary accent (sage green)
        green: "#6FA363",
        red: "#C75B43", // earthy terracotta-red (destructive)
        orange: "#D98E5A", // terracotta
        teal: "#5BA8A0",
        indigo: "#8A7BB5", // muted plum
        pink: "#C96F8A",
        ringMove: "#E8A93C", // calories ring (honey)
        ringStep: "#7FAE74", // steps ring (sage)
        // explicit earthy accents for new code
        sage: "#7FAE74",
        honey: "#E8A93C",
        terracotta: "#D98E5A",
        clay: "#C17A47",
        forest: "#5E9A6F",
        cream: "#F4F1E9",
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
