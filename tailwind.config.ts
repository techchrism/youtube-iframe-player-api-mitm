import type {Config} from 'tailwindcss'
import daisyui from 'daisyui'

const config: Config = {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx,css,md,mdx,html,json,scss}'
    ],
    darkMode: 'media',
    theme: {
        extend: {
            gridTemplateColumns: {
                'main': '450px 1fr'
            }
        }
    },
    plugins: [
        daisyui
    ]
}

export default config
