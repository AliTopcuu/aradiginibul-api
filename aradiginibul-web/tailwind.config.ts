import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#0f172a",    // Koyu Lacivert
          primary: "#2563eb", // Güven veren mavi
          surface: "#f8fafc", // Dinlendirici arka plan
          accent: "#f59e0b",  // Toptan indirim vurgusu
        },
      },
    },
  },
  plugins: [],
};
export default config;