export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2C2C2C',
        accent: '#C75B39',
        'accent-gold': '#D4A857',
        cream: '#FAF7F2',
        'text-primary': '#1A1A1A',
        'text-secondary': '#6B6B6B',
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
