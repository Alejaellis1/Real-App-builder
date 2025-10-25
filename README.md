# Solo Pro — Vite + React + Tailwind (local build)

This project now uses Tailwind compiled locally (PostCSS + Autoprefixer) instead of the CDN. Follow these steps to run and deploy.

## Install
1. Install packages:
   npm install

## Development
2. Start dev server:
   npm run dev
3. Open the URL printed by Vite (usually http://localhost:5173).

## Build & Preview
4. Build for production:
   npm run build
5. Preview production build locally:
   npm run preview

## Vercel deployment
- Vercel detects Vite projects automatically. Default build command: `npm run build` and output directory `dist`.
- Ensure your environment has Node matching your engines or a compatible version (Node 18+ is fine for Vite).

## Removing the Tailwind CDN
- Remove any <link> or <script> to the Tailwind CDN (for example <script src="https://cdn.tailwindcss.com"></script>) from your HTML or templates.
- This project compiles Tailwind into src/main.css via PostCSS. The CDN snippet is not needed.

## Notes about visual parity
- Tailwind utility classes are identical between CDN and local builds. To ensure perfect visual parity:
  - Keep the same class names in your components.
  - If you used the CDN snippet to set a custom Tailwind config (e.g., via the CDN script), replicate that config in tailwind.config.js.
  - If the CDN snippet injected fonts (e.g., a Google Fonts <link>), add the same font link to index.html or import in main.css.
