/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    {
      pattern: /^bg-(primary|secondary|tertiary|cta)(-container)?$/,
    },
    {
      pattern: /^text-on-(primary|secondary|tertiary|cta)(-container)?$/,
    },
    {
      pattern: /^border-(primary|secondary|tertiary)-container$/,
    },
    {
      pattern: /^outline-(primary|secondary|tertiary|cta)$/,
      variants: ['focus-visible'],
    },
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7B2D5B',
        'on-primary': '#FFFFFF',
        'primary-container': '#FFECF2',
        'on-primary-container': '#3C0028',
        cta: '#F2A20C',
        'on-cta': '#2B2230',
        'cta-container': '#FFF3D6',
        'on-cta-container': '#2B2230',
        secondary: '#D9663F',
        'on-secondary': '#271E2B',
        'secondary-container': '#FFEDE8',
        'on-secondary-container': '#5D1800',
        tertiary: '#5E9C76',
        'on-tertiary': '#002110',
        'tertiary-container': '#E6F4EB',
        'on-tertiary-container': '#002110',
        surface: '#FFF8F0',
        'on-surface': '#2B2230',
        'on-surface-variant': '#524349',
        'surface-container-lowest': '#FFFFFF',
        'surface-container-low': '#FDF2E6',
        'surface-container': '#F7EAE0',
        'surface-container-high': '#EFE0D3',
        outline: '#84727A',
        'outline-variant': '#E8E1DA',
        success: '#2C6A48',
        'on-success': '#FFFFFF',
        error: '#BA1A1A',
        'on-error': '#FFFFFF',
      },
      borderRadius: {
        sm: '8px',
        DEFAULT: '12px',
        md: '16px',
        lg: '16px',
        xl: '24px',
        full: '9999px',
      },
      spacing: {
        'gutter-xs': '4px',
        'gutter-sm': '8px',
        'gutter-md': '16px',
        'gutter-lg': '24px',
        'gutter-xl': '32px',
        section: '64px',
        'page-margin': '24px',
      },
      fontFamily: {
        display: ['Poppins', 'sans-serif'],
        headline: ['Poppins', 'sans-serif'],
        title: ['Nunito', 'sans-serif'],
        body: ['Nunito', 'sans-serif'],
        label: ['Nunito', 'sans-serif'],
      },
      fontSize: {
        'display-lg': [
          '44px',
          { lineHeight: '54px', letterSpacing: '-0.5px', fontWeight: '700' },
        ],
        'display-lg-mobile': [
          '32px',
          { lineHeight: '40px', letterSpacing: '-0.25px', fontWeight: '700' },
        ],
        'headline-lg': [
          '36px',
          { lineHeight: '44px', letterSpacing: '-0.25px', fontWeight: '700' },
        ],
        'headline-lg-mobile': [
          '28px',
          { lineHeight: '36px', letterSpacing: '-0.2px', fontWeight: '700' },
        ],
        'headline-md': [
          '28px',
          { lineHeight: '36px', letterSpacing: '0px', fontWeight: '600' },
        ],
        'headline-sm': [
          '22px',
          { lineHeight: '30px', letterSpacing: '0px', fontWeight: '600' },
        ],
        'title-lg': [
          '20px',
          { lineHeight: '28px', letterSpacing: '0px', fontWeight: '600' },
        ],
        'title-md': [
          '18px',
          { lineHeight: '26px', letterSpacing: '0px', fontWeight: '700' },
        ],
        'body-lg': [
          '18px',
          { lineHeight: '28px', letterSpacing: '0px', fontWeight: '400' },
        ],
        'body-md': [
          '16px',
          { lineHeight: '24px', letterSpacing: '0px', fontWeight: '400' },
        ],
        'label-lg': [
          '16px',
          { lineHeight: '24px', letterSpacing: '0.1px', fontWeight: '700' },
        ],
        'label-md': [
          '14px',
          { lineHeight: '20px', letterSpacing: '0.1px', fontWeight: '700' },
        ],
      },
      transitionDuration: {
        'state-change': '150ms',
        'surface-enter': '250ms',
      },
      transitionDelay: {
        'state-change': '0ms',
        'surface-enter': '0ms',
      },
      transitionTimingFunction: {
        'state-change': 'ease-out',
        'surface-enter': 'cubic-bezier(0.2, 0, 0, 1)',
      },
    },
  },
  plugins: [],
}
