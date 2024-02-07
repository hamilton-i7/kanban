import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      sm: '375px',
      md: '768px',
      lg: '976px',
      xl: '1440px',
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: '#000112',
      white: '#FFFFFF',
      gray: {
        100: '#F4F7FD',
        200: '#E4EBFA',
        300: '#828FA3',
        400: '#3E3F4E',
        500: '#2B2C37',
        600: '#20212C',
      },
      purple: {
        DEFAULT: '#635FC7',
        light: '#A8A4FF',
      },
      red: {
        DEFAULT: '#EA5555',
        light: '#FF9898',
      },
    },
    fontFamily: {
      sans: ['Plus Jakarta Sans', 'sans-serif'],
    },
    fontSize: {
      xs: '0.75rem',
      s: '0.8125rem',
      md: '0.9375rem',
      lg: '1.125rem',
      xl: '1.5rem',
    },
  },
  plugins: [],
}
export default config
