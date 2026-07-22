import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

// EOG brand tokens (design plan 04 §3.9) — Cape Kiwanda palette, light theme.
// A client fork re-skins by editing these values + globals.css.
const config: Config = {
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'eog-teal': '#2E7A74',
        'eog-navy': '#2C3B4A',
        'eog-sky': '#7DB4C7',
        'eog-sage': '#6B8F70',
        'eog-cream': '#EDE4C2',
        'eog-gold': '#C4A46A',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      typography: () => ({
        eog: {
          css: {
            '--tw-prose-body': '#2C3B4A',
            '--tw-prose-headings': '#2C3B4A',
            '--tw-prose-links': '#2E7A74',
            '--tw-prose-bold': '#2C3B4A',
            '--tw-prose-quotes': '#2E7A74',
            '--tw-prose-code': '#2E7A74',
            '--tw-prose-hr': '#e2ddc7',
            '--tw-prose-quote-borders': '#7DB4C7',
          },
        },
      }),
    },
  },
  plugins: [typography],
}

export default config
