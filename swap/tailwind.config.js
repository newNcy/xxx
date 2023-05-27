/** @type {import('tailwindcss').Config} */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js, jsx, ts, tsx}",
  ],
  theme: {
    extend: {
        colors : {
            accent: '#ED7A46',
            deepAccent: '#B55732',
            main: '#150F19',
        }
    },
  },
  plugins: [],
}


