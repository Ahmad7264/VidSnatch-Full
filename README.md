# VidSnatch V5 — Full Stack Vite + Express

VidSnatch is a Vite frontend plus Express/yt-dlp backend. V5 keeps the existing downloader/backend and YouTube cookie flow, while fixing the shared site shell, responsive navigation, language switching, theme toggle, downloader input styling, and shared FAQ/footer.

## Structure

```text
frontend/                 Vite frontend
  src/style.css           single global stylesheet
  src/main.js             home/universal downloader
  public/site-ui.js       shared navbar + theme + FAQ + footer
  public/translations.js  shared translations
  public/downloader.js    shared downloader engine
backend/                  Express API + yt-dlp + bgutil provider
scripts/dev.mjs           starts frontend and backend together
render.yaml               Render deployment
```

## Local development

Requirements: Node 24.x (the project pins 24.14.1) and ffmpeg on PATH.

```bash
npm install
npm run dev
```

`npm run dev` starts both the Vite frontend and the Express backend. Open:

```text
http://localhost:5173
```

The Vite dev server proxies `/api/*` to `http://127.0.0.1:10000`, so you do not need a separate frontend `.env.local` just to run locally.

## YouTube cookies

The existing YouTube cookie mechanism is retained. Do not commit cookie data to Git. Configure it as the `YOUTUBE_COOKIES` environment variable on the backend when required. `.env` files are ignored by Git.

The backend also retains the bundled bgutil proof-of-origin token provider used by the YouTube extractor.

## Production — Render

The included `render.yaml` builds the frontend and runs the Express service.

```text
Build:  npm install && npm run build
Start:  npm start
Health: /healthz
```

The build prepares yt-dlp and the bgutil provider. If the bgutil runtime dependencies are missing on a fresh checkout, the startup script installs them before starting the provider.

## Production — Cloudflare Pages + Render API

Frontend:

```text
Root directory: frontend
Build command: npm run build
Output: dist
```

Set the Cloudflare Pages environment variable:

```text
VITE_API_URL=https://YOUR-RENDER-BACKEND-DOMAIN
```

Keep backend `CORS_ORIGIN` limited to your real frontend origins.

## Git

The project includes a root `.gitignore` covering dependencies, environment files/secrets, generated Vite output, logs, temporary files, and editor/OS files.

```bash
git init
git add .
git commit -m "VidSnatch V5"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY
git push -u origin main
```

## Notes

- One generated navbar is used across every page.
- Arabic and Urdu use RTL for page content, while the shared navigation stays visually LTR so its order never flips.
- The language menu remains anchored to the language button on desktop and mobile.
- The theme switch is a compact toggle directly below the navbar.
- Downloader URL fields have no decorative URL icon, white glow, or large background panel.
- FAQ and footer are generated from the same shared component on every page.
- Existing downloader/yt-dlp behavior is kept intact; the frontend now uses same-origin API requests locally through Vite's proxy.
