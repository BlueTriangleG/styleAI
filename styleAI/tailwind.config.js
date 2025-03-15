/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                'playfair': ['var(--font-playfair)', 'serif'],
                'inter': ['var(--font-inter)', 'sans-serif'],
                'mono': ['var(--font-geist-mono)', 'monospace'],
            },
            backdropBlur: {
                xs: '2px',
            },
            animation: {
                'spin-slow': 'spin 3s linear infinite',
            },
        },
    },
    plugins: [],
} 