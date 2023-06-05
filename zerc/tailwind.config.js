/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
        colors:  {
            main: '#262626',
            main2: '#404040',
            footer: '#1e293b',
            primary: '#00ee00',
            primaryDark: '#00aa00',
            primary2: '#be123c',
            primary2Dark: '#8a102c',
        }
    },
  },
  plugins: [],
}

