# VidSnatch

VidSnatch is a web-based video downloader that allows users to fetch and download videos and media from supported social and video platforms.

The project uses a Vite-based frontend and an Express backend powered by yt-dlp. The frontend provides the user interface, while the backend handles media information, format selection, download jobs, and file delivery.

The website is designed to be fast, responsive, simple to use, and easy to maintain.

---

## Features

- Video downloading from supported platforms
- Video information and thumbnail fetching
- Multiple video quality options when available
- MP3/audio download support
- Download progress and status tracking
- Automatic download filenames using the VidSnatch name and video title
- Responsive design for desktop, tablet, and mobile
- Mobile hamburger navigation
- Day and Night themes
- Multi-language support
- RTL support for Arabic and Urdu
- Shared navigation across the website
- Shared FAQ and footer
- SEO-friendly downloader pages
- Open Graph and Twitter metadata
- Breadcrumb structured data
- Sitemap and robots configuration
- Express API with yt-dlp
- YouTube cookie support
- bgutil proof-of-origin provider support

---

## How It Works

VidSnatch has two main parts: the frontend and the backend.

### Frontend

The frontend is responsible for everything the user sees and interacts with.

It handles:

- URL input
- Platform selection
- Video information display
- Thumbnail display
- Quality selection
- Download controls
- Download progress
- Theme switching
- Language switching
- Mobile navigation
- FAQ and footer

The frontend is built with Vite and uses a shared UI system so that the same navigation, theme, language menu, FAQ, and footer can be used across different pages.

### Backend

The backend provides the API used by the frontend.

It is built with Express and uses yt-dlp to extract media information and process downloads.

The backend handles:

- URL processing
- Media information
- Available formats
- Quality selection
- Download jobs
- Download status
- Completed files
- yt-dlp execution
- YouTube authentication/cookies
- bgutil proof-of-origin support

---

## Project Structure

```text
VidSnatch/
│
├── frontend/
│   ├── src/
│   │   ├── main.js
│   │   └── style.css
│   │
│   └── public/
│       ├── downloader.js
│       ├── site-ui.js
│       └── translations.js
│
├── backend/
│   └── Express API, yt-dlp and bgutil provider
│
├── scripts/
│   └── dev.mjs
│
├── render.yaml
├── package.json
└── .gitignore
```
---

## How to Use VidSnatch

Anyone who wants to use VidSnatch can run their own copy of the project.

You can either run it locally for development and testing, or deploy it on your own server.

### 1. Get the project

Clone the GitHub repository:

```bash
git clone YOUR_GITHUB_REPOSITORY
cd VidSnatch

npm install
npm run dev
http://localhost:5173