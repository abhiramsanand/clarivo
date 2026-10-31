import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: { ivory: "#F4F1EA", limestone: "#E3DED3", mist: "#B8C4C5", eucalyptus: "#344B52", ink: "#252D2E", warm: "#FCFBF8", muted: "#747A78", line: "#D4D2CA" },
    fontFamily: { serif: ['"Iowan Old Style"', '"Palatino Linotype"', "Palatino", "Georgia", "serif"], sans: ["ui-sans-serif", "system-ui", '"Helvetica Neue"', "Arial", "sans-serif"] },
  } }, plugins: [],
} satisfies Config;
