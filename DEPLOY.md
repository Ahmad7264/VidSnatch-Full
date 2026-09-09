# VidSnatch Deployment Checklist

## 1. Remove the old Render service

In Render Dashboard:

1. Open the old VidSnatch service (`vidsnatch-1-4suv` / the old service you were using).
2. Open **Settings**.
3. Scroll to the destructive/delete section.
4. Delete the old service and confirm.

The new Blueprint uses the service name `vidsnatch-api`, so the expected API URL is:

`https://vidsnatch-api.onrender.com`

## 2. Deploy the new full project to Render

Connect the GitHub repository containing this project and use the included `render.yaml` Blueprint.

The project is intentionally Docker-free.

Render settings if entered manually:

- Runtime: Node
- Build: `npm install && npm run build && npm run prepare:render`
- Start: `npm start`
- Health check: `/healthz`
- Node: `24.14.1`

After deployment, open:

`https://vidsnatch-api.onrender.com/healthz`

It should return JSON with `ok: true` and `ytDlpReady: true`.

## 3. Put `vidsnatch.in` on Cloudflare Pages

For a Git-based Cloudflare Pages project:

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL=https://vidsnatch-api.onrender.com`

For direct upload, upload the contents of `frontend/dist/`.

## 4. Domain

Attach `vidsnatch.in` to Cloudflare Pages. The SEO files already point to:

- canonical: `https://vidsnatch.in/`
- sitemap: `https://vidsnatch.in/sitemap.xml`
- robots: `https://vidsnatch.in/robots.txt`

## 5. Important test order

1. Test Render `/healthz`.
2. Open the Render URL and test a public YouTube URL.
3. Test a public Instagram Reel URL.
4. Only then connect `vidsnatch.in` to the Cloudflare Pages project.
