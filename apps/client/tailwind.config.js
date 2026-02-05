/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0c0c0e",
        surface: "#151518",
        text: "#eeeeee",
      },
    },
  },
  plugins: [],
}
