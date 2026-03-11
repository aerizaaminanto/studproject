/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "hsl(var(--ink))",
        mute: "hsl(var(--mute))",
        sand: "hsl(var(--sand))",
        fog: "hsl(var(--fog))",
        mint: "hsl(var(--mint))",
        sky: "hsl(var(--sky))",
        sun: "hsl(var(--sun))"
      },
      fontFamily: {
        display: ['"Space Grotesk"', "system-ui", "sans-serif"],
        serif: ['"Instrument Serif"', "serif"]
      },
      boxShadow: {
        soft: "0 20px 60px -30px rgba(15, 23, 42, 0.35)",
        ring: "0 0 0 1px rgba(15, 23, 42, 0.08), 0 20px 40px -32px rgba(15, 23, 42, 0.3)"
      }
    }
  },
  plugins: []
}
