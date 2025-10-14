/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        "ms-gray": "#f3f3f4",
        "ms-accent": "#6b21a8",
      },
    },
  },
  plugins: [],
};
