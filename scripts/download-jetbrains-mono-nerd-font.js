#!/usr/bin/env node
/**
 * Downloads JetBrains Mono Nerd Font (Regular) into assets/fonts.
 * Run from project root: node scripts/download-jetbrains-mono-nerd-font.js
 */

const https = require("https");
const fs = require("fs");
const path = require("path");

const FONT_URL =
  "https://cdn.jsdelivr.net/gh/ryanoasis/nerd-fonts@master/patched-fonts/JetBrainsMono/Regular/complete/JetBrains%20Mono%20Regular%20Nerd%20Font%20Complete.ttf";
const OUT_DIR = path.join(__dirname, "..", "assets", "fonts");
const OUT_FILE = path.join(OUT_DIR, "JetBrainsMonoNerdFont-Regular.ttf");

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

console.log("Downloading JetBrains Mono Nerd Font...");
const file = fs.createWriteStream(OUT_FILE);

https
  .get(FONT_URL, (response) => {
    if (response.statusCode === 302 || response.statusCode === 301) {
      const redirect = response.headers.location;
      if (redirect) {
        https.get(redirect, (res) => res.pipe(file));
        return;
      }
    }
    if (response.statusCode !== 200) {
      console.error("Failed to download:", response.statusCode);
      file.close();
      fs.unlinkSync(OUT_FILE);
      process.exit(1);
    }
    response.pipe(file);
  })
  .on("error", (err) => {
    console.error("Download error:", err.message);
    file.close();
    if (fs.existsSync(OUT_FILE)) fs.unlinkSync(OUT_FILE);
    process.exit(1);
  });

file.on("finish", () => {
  file.close();
  console.log("Saved to", OUT_FILE);
});
