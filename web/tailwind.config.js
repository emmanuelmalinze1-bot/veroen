/** @type {import('tailwindcss').Config} */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Roboto Slab"', 'serif'],
      },
      colors: {
        vireon: {
          navy: '#0A1A3C',
          deep: '#07132B',
          blue: '#2F80ED',
          sky: '#38BDF8',
          mist: '#F4F7FE',
          line: '#E2E8F5',
        },
      },
    },
  },
  plugins: [],
}
