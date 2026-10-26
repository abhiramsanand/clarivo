import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: { obsidian: "#07090c", charcoal: "#12161b", slate2: "#1c222a", glacier: "#a9cfe6", silver: "#e9eef2", champagne: "#d6b98a" },
    fontFamily: { serif: ['"Iowan Old Style"', '"Palatino Linotype"', "Palatino", "Georgia", "serif"], sans: ["ui-sans-serif", "system-ui", '"Helvetica Neue"', "Arial", "sans-serif"] },
  } }, plugins: [],
} satisfies Config;
