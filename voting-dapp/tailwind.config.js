/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4f46e5',
          dark: '#4338ca',
          light: '#6366f1',
        },
        secondary: {
          DEFAULT: '#8b5cf6',
          dark: '#7c3aed',
          light: '#a78bfa',
        },
        dark: {
          DEFAULT: '#111827',
          lighter: '#1f2937',
          lightest: '#374151',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
