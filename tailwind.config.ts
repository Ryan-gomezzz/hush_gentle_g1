import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                sage: {
                    50: "#f4f7f4",
                    100: "#e3ebe3",
                    200: "#c5d6c5",
                    300: "#9ab69b",
                    400: "#729474",
                    500: "#5b6c5d", // Primary brand color
                    600: "#455347",
                    700: "#38433a",
                    800: "#2f3630",
                    900: "#272d28",
                },
                beige: {
                    50: "#fbf9f6",
                    100: "#f5f0e9",
                    200: "#ebe0d3",
                    300: "#dfcbbe", // Warm Beige
                    400: "#d0b0a0",
                    500: "#c29688",
                    600: "#a6786c",
                },
                rose: {
                    100: "#fcefed",
                    200: "#f7dcd9",
                    300: "#e8b4b8", // Accent
                    400: "#d68c93",
                },
                offwhite: "#F9F7F2",
            },
            fontFamily: {
                serif: ["var(--font-playfair)", "serif"], // Playfair Display
                sans: ["var(--font-inter)", "sans-serif"], // Inter
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
            },
        },
    },
    plugins: [],
};
export default config;
