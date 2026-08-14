/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Earthy greens, darkened for readability in direct sunlight.
        leaf: {
          50: '#f1f8ef',
          100: '#ddeed7',
          200: '#bcdcb0',
          300: '#8ec27e',
          400: '#5da34c',
          500: '#3d8630',
          600: '#2c6a23',
          700: '#23531d',
          800: '#1c4118',
          900: '#132d11',
        },
        soil: {
          100: '#f5f1e8',
          200: '#e6ddc9',
          700: '#6b5b3e',
          900: '#3b3020',
        },
        alert: {
          low: '#b45309',
          high: '#b91c1c',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 0 0 rgba(19, 45, 17, 0.18)',
      },
      minHeight: {
        touch: '3.5rem',
      },
    },
  },
  plugins: [],
};
