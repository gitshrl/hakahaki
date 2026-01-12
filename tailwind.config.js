/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: '#0B0F14',
          panel: '#0F1318',
          border: '#1E2530',
          header: '#151A22',
          row: '#0D1117',
          'row-hover': '#161B22',
          'row-selected': '#1C2128',
        },
        bloomberg: {
          orange: '#FF6B00',
          green: '#00D26A',
          red: '#FF3B3B',
          yellow: '#FFB800',
          blue: '#0066FF',
          muted: '#6B7280',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
      },
    },
  },
  plugins: [],
}
