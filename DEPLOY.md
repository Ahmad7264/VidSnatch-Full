# VidSnatch Deployment Checklist

## 1. Keep the existing Render service

Do not delete the old VidSnatch Render service.

The existing service is still being used for the YouTube cookies, so it needs to remain available.

Keep the current Render service and its existing YouTube cookie setup unchanged.

---

## 2. Push the latest project to GitHub

Push all the updated VidSnatch project files to the GitHub repository.

Make sure the latest versions of the frontend, backend, configuration files, SEO files, and other required project files are included.

Do not remove the files required for the existing YouTube cookie setup.

Before pushing, check that sensitive files such as `.env` files, private cookies, API keys, and other secrets are not committed to GitHub.

---

## 3. Deploy the updated project on Render

Use the GitHub repository as the source for the Render deployment.

The project does not use Docker.

If the Render settings need to be entered manually, use:

- Runtime: Node
- Build Command: `npm install && npm run build && npm run prepare:render`
- Start Command: `npm start`
- Health Check Path: `/healthz`
- Node Version: `24.14.1`

The existing YouTube cookie configuration should continue to work after deployment.

---

## 4. Check the API

After the deployment finishes, open:

`https://vidsnatch-api.onrender.com/healthz`

The response should show:

`"ok": true`

and

`"ytDlpReady": true`

Then test a public YouTube URL to make sure fetching and downloading are working correctly.

---

## 5. Connect the website

The main website is:

`https://vidsnatch.in`

Make sure the frontend is using the correct Render API:

`https://vidsnatch-api.onrender.com`

If the project uses the `VITE_API_URL` environment variable, set:

`VITE_API_URL=https://vidsnatch-api.onrender.com`

---

## 6. Final testing

After everything is deployed, test the website properly:

1. Open `vidsnatch.in`.
2. Test a public YouTube video.
3. Test YouTube quality selection and download.
4. Test MP3 download.
5. Test an Instagram Reel.
6. Test the other supported platforms.
7. Check that downloaded filenames are correct.
8. Test Day and Night modes.
9. Test the mobile navbar and menu.
10. Make sure there are no 404 or 429 errors during downloading.
11. Make sure the existing YouTube cookie setup is still working.

If all of these tests pass, the updated VidSnatch deployment is ready.