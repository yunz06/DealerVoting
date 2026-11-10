import type { Config } from "tailwindcss";
export default { content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"], theme: { extend: { colors: { coal: "#08090b", panel: "#15171a", silver: "#d5d7db", bronze: "#aa8c6a" }, fontFamily: { sans: ["Arial", "sans-serif"] } } }, plugins: [] } satisfies Config;
