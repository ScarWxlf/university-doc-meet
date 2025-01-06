import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/layouts/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      keyframes: {
        fallAndWobble: {
          '20%': { transform: 'rotate(190deg) translateX(-20px)' },
          '35%': { transform: 'rotate(110deg) translateX(-20px)' },
          '50%': { transform: 'rotate(170deg) translateX(-20px)' },
          '75%': { transform: 'rotate(130deg) translateX(-20px)' },
          '100%': { transform: 'rotate(50deg) translateX(0px)' },
        },
      },
      animation: {
        fallAndWobble: 'fallAndWobble 3s ease-in-out forwards',
      },
    },
  },
  plugins: [],
} satisfies Config;
