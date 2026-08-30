import { defineConfig } from "vite";
import path from "node:path";

const root = path.resolve(process.cwd());

export default defineConfig({
  server: {
    host: "0.0.0.0",
    proxy: { "/api": { target: "http://127.0.0.1:10000", changeOrigin: true } }
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        home: path.resolve(root, "index.html"),
        youtube: path.resolve(root, "youtube-video-downloader/index.html"),
        instagram: path.resolve(root, "instagram-reel-downloader/index.html"),
        facebook: path.resolve(root, "facebook-video-downloader/index.html"),
        tiktok: path.resolve(root, "tiktok-video-downloader/index.html"),
        twitter: path.resolve(root, "twitter-video-downloader/index.html"),
        reddit: path.resolve(root, "reddit-video-downloader/index.html"),
        threads: path.resolve(root, "threads-video-downloader/index.html"),
        pinterest: path.resolve(root, "pinterest-video-downloader/index.html"),
        snapchat: path.resolve(root, "snapchat-video-downloader/index.html"),
      },
    },
  },
});
