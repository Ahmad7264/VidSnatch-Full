# VidSnatch — Full Stack Vite Project

This is the rebuilt VidSnatch project. The UI remains the existing neomorphic design; the frontend is Vite 8 and the API/download worker is Express 5.

## Project layout

```text
frontend/     Vite frontend — deploy to Cloudflare Pages
backend/      Express API — deploy to Render
render.yaml   One-service Render deployment (builds frontend and serves it from Express)
```

## Option A — One-click style Render deployment

Push this repository to GitHub and create a new Render Blueprint using `render.yaml`.

Render will:

1. use Node 24.14.1;
2. run `npm install && npm run build`;
3. run `npm start`;
4. expose `/healthz` for health checks;
5. serve the Vite `frontend/dist` from the Express service;
6. download the current official yt-dlp executable when needed;
7. use the Node.js runtime for yt-dlp's YouTube JavaScript challenge support;
8. use Render's native ffmpeg installation for MP4 merging and MP3 conversion.

## Option B — Cloudflare frontend + Render backend

### Render

Deploy the repository as a Render Node Web Service with:

- Build: `npm install && npm run build`
- Start: `npm start`
- Health check: `/healthz`

The included production default is `https://vidsnatch-api.onrender.com`. If you later add a custom API domain, change VITE_API_URL to that domain.

### Cloudflare Pages

Use `frontend` as the root directory.

- Build command: `npm run build`
- Build output directory: `dist`
- Environment variable: `VITE_API_URL=https://vidsnatch-api.onrender.com`

The frontend falls back to same-origin when `VITE_API_URL` is empty, so the same codebase also works as a single Render service.

## Local development

Requirements: Node 24.x recommended and ffmpeg installed and available on PATH.

```bash
npm install
npm run dev
```

For local frontend → local backend, run the backend in another terminal:

```bash
npm start --workspace backend
```

Then set `frontend/.env.local`:

```text
VITE_API_URL=http://localhost:10000
```

## Important

- The old Docker/bgutil setup is not used.
- The backend does not trust the browser-supplied direct media URL for downloads; it revalidates the original URL.
- Temporary download files are deleted after delivery or expiry.
- Only public Instagram and YouTube URLs supported by the site are accepted.
- Users are responsible for downloading content they have permission to download and for following applicable platform terms and copyright law.
