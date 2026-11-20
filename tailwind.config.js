/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        // Short laptop viewports (e.g. 1366x768 with browser chrome)
        short: { raw: '(max-height: 720px)' },
      },
      colors: {
        'bg-app': 'var(--bg-app)',
        'bg-surface': 'var(--bg-surface)',
        'bg-alt': 'var(--bg-alt)',
        'ink': 'var(--ink)',
        'ink-muted': 'var(--ink-muted)',
        'ink-dim': 'var(--ink-dim)',
        'paper-ink': 'var(--paper-ink)',
        'line': 'var(--line)',
        'line-strong': 'var(--line-strong)',
        'accent-gold': 'var(--accent-gold)',
        'accent-teal': 'var(--accent-teal)',
        'accent-blue': 'var(--accent-blue)',
        'accent-red': 'var(--accent-red)',
        'accent-violet': 'var(--accent-violet)',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '16px',
        'xl': '24px',
      },
    },
  },
  plugins: [],
}
