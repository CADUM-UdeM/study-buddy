/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './App.{js,jsx,ts,tsx}',
        './app/**/*.{js,jsx,ts,tsx}',       // ← ajoute le dossier app/
        './components/**/*.{js,jsx,ts,tsx}',
    ],
    presets: [require('nativewind/preset')],
    theme: {extend: {
            fontFamily: {
                pixel: ["PixelJersey"]
            },
            colors: {
                light: {
                    primary: '#D6C6FF',
                    secondary: '#A8B5DB',
                    accent: '#9CA4AB',
                },
                dark: {
                    primary: '#221F3D',
                    secondary: '#444462',
                    accent: '#AB8BFF',
                }
            }},
    plugins: [],
    },
}
