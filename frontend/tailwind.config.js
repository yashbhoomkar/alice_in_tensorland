/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"], // Ensure this is correctly set
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"], // Correct key
      },
    },
  },
  plugins: [],
};
