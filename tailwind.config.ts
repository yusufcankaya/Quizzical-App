import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        blue: {
          100: "#F5F7FB",
          300: "#DBDEF0",
          400: "#D6DBF5",
          700: "#4D5B9E",
          900: "#293264",
        },
        red: {
          300: "#F8BCBC",
        },
        green: {
          500: "#94D7A2",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        title: ["Karla", "sans-serif"],
      }
    },
  },
  plugins: [],
} satisfies Config;