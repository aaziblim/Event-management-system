import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111111",
        sand: "#f6f1e8",
        moss: "#40534c",
        brass: "#a46f2c",
        mist: "#eef3ef"
      },
      boxShadow: {
        card: "0 25px 80px -35px rgba(17, 17, 17, 0.18)"
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
