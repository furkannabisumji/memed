import type { Config } from "tailwindcss"

const config: Config = {
    content: [
        "./app/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                clash: ['"Clash Grotesk"', 'sans-serif'], // Add your custom font
            },
        }
    },
}

export default config
