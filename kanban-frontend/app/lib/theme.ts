'use client'

import { createTheme } from '@mui/material/styles'
import { Plus_Jakarta_Sans } from 'next/font/google'

declare module '@mui/material/styles' {
  interface TypographyVariants {
    'heading-xl': React.CSSProperties
    'heading-l': React.CSSProperties
    'heading-m': React.CSSProperties
    'heading-s': React.CSSProperties
    'body-l': React.CSSProperties
    'body-m': React.CSSProperties
  }

  interface TypographyVariantsOptions {
    'heading-xl'?: React.CSSProperties
    'heading-l'?: React.CSSProperties
    'heading-m'?: React.CSSProperties
    'heading-s'?: React.CSSProperties
    'body-l'?: React.CSSProperties
    'body-m'?: React.CSSProperties
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    'heading-xl': true
    'heading-l': true
    'heading-m': true
    'heading-s': true
    'body-l': true
    'body-m': true
  }
}

const plus_jakarta_sans = Plus_Jakarta_Sans({
  weight: ['500', '700'],
  style: 'normal',
  subsets: ['latin'],
})

const theme = createTheme({
  palette: {
    common: {
      black: '#000112',
      white: '#fff',
    },
    primary: {
      main: '#635FC7',
      light: '#A8A4FF',
    },
    error: {
      main: '#EA5555',
      light: '#FF9898',
    },
    grey: {
      300: '#E9EFFA',
      500: '#828FA3',
    },
    background: {
      default: '#F4F7FD',
      paper: '#F4F7FD',
    },
    divider: '#E4EBFA',
  },
  typography: {
    fontFamily: plus_jakarta_sans.style.fontFamily,
    'heading-xl': {
      fontSize: '1.5rem',
      fontWeight: 700,
      lineHeight: 1.25,
    },
    'heading-l': {
      fontSize: '1.125rem',
      fontWeight: 700,
      lineHeight: 1.2777,
    },
    'heading-m': {
      fontSize: '0.9375rem',
      fontWeight: 700,
      lineHeight: 1.2666,
    },
    'heading-s': {
      fontSize: '0.75rem',
      fontWeight: 700,
      lineHeight: 1.25,
      letterSpacing: '0.2em',
    },
    'body-l': {
      fontSize: '0.8125rem',
      fontWeight: 500,
      lineHeight: 1.7692,
    },
    'body-m': {
      fontSize: '0.75rem',
      fontWeight: 700,
      lineHeight: 1.25,
    },
  },
  spacing: (factor: number) => `${0.25 * factor}rem`,
})

export default theme
