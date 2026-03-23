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
        background: "var(--background)",
        foreground: "var(--foreground)",
        muted: "var(--muted)",
        navy: {
          DEFAULT: "#0A0F1E",
          deep: "#050810",
        },
        indigo: {
          brand: "#6366F1",
        },
        amber: {
          brand: "#F59E0B",
        },
        cat: {
          feature: "#6366F1",
          fix: "#10B981",
          breaking: "#EF4444",
          perf: "#F59E0B",
          dx: "#8B5CF6",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
        display: ["var(--font-syne)", "var(--font-geist-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
