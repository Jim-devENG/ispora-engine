/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './iSpora-frontend/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '0.75rem', // Reduced from 1rem
        sm: '1rem',         // Reduced from 1.5rem
        lg: '1.25rem',      // Reduced from 2rem
        xl: '1.5rem',       // Reduced from 2rem
        '2xl': '1.5rem',    // Reduced from 2rem
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1400px',
      },
    },
    fontSize: {
      'xs': ['0.75rem', { lineHeight: '1.4' }],      // 12px
      'sm': ['0.875rem', { lineHeight: '1.4' }],     // 14px
      'base': ['0.875rem', { lineHeight: '1.5' }],  // 14px - reduced from 15px
      'lg': ['1rem', { lineHeight: '1.5' }],        // 16px
      'xl': ['1.125rem', { lineHeight: '1.4' }],     // 18px
      '2xl': ['1.25rem', { lineHeight: '1.3' }],     // 20px
      '3xl': ['1.375rem', { lineHeight: '1.2' }],    // 22px
      '4xl': ['1.5rem', { lineHeight: '1.1' }],      // 24px
      '5xl': ['1.75rem', { lineHeight: '1.1' }],     // 28px
      '6xl': ['2rem', { lineHeight: '1' }],          // 32px
    },
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
