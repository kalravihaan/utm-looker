/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      colors: {
        topbar: '#0a0a14',
        'brand-overall': '#818cf8',
        'brand-sangria': '#db2777',
        'brand-hop': '#c9973a',
        'brand-aay': '#2563eb',
        'brand-ar': '#c2510e',
      },
    },
  },
  plugins: [],
};
