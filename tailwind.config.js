// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        gradientMove: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        wave: {
          from: { transform: 'translateX(-25%)' },
          to: { transform: 'translateX(-75%)' },
        },
      },
      animation: {
        gradientMove: 'gradientMove 15s ease infinite',
        wave: 'wave 20s linear infinite',
      },
    },
  },
  plugins: [],
}
