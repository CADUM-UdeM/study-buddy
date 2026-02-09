/** @type {import('tailwindcss').Config} */
// Palette aligned with app/theme/colors.ts
const themeColors = {
    "dark-amethyst": "#10002b",
    "dark-amethyst-2": "#240046",
    "indigo-ink": "#3c096c",
    "indigo-velvet": "#5a189a",
    "royal-violet": "#7b2cbf",
    "lavender-purple": "#9d4edd",
    "mauve-magic": "#c77dff",
    "mauve": "#e0aaff",
    // Semantic (use these in className)
    theme: {
        background: "#10002b",
        surface: "#240046",
        "surface-elevated": "#3c096c",
        card: "#5a189a",
        primary: "#7b2cbf",
        accent: "#9d4edd",
        "accent-light": "#c77dff",
        "text-on-dark": "#e0aaff",
        success: "#4BAE4F",
        error: "#f30000",
        warning: "#ff9800",
    },
};

module.exports = {
    content: [
        './App.{js,jsx,ts,tsx}',
        './app/**/*.{js,jsx,ts,tsx}',
        './components/**/*.{js,jsx,ts,tsx}',
    ],
    presets: [require('nativewind/preset')],
    theme: {
        extend: {
            colors: themeColors,
        },
    },
    plugins: [],
};
