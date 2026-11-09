const express = require("express");
const multer = require("multer");
const sharp = require("sharp");

const app = express();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024
  }
});

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

function escapeXml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

app.post("/gif", upload.single("image"), async (req, res) => {
  try {
    const text = req.body.text;

    if (!text) {
      return res.status(400).json({
        error: "No text was provided."
      });
    }

    let imageBuffer;

    // Option 1: BotGhost sends an uploaded file
    if (req.file) {
      imageBuffer = req.file.buffer;
    }

    // Option 2: BotGhost sends an image URL
    else if (req.body.image) {
      const imageUrl = req.body.image;

      const response = await fetch(imageUrl);

      if (!response.ok) {
        return res.status(400).json({
          error: "Could not download the image."
        });
      }

      imageBuffer = Buffer.from(await response.arrayBuffer());
    }

    // No image
    else {
      return res.status(400).json({
        error: "No image was provided."
      });
    }

    // Read image information
    const metadata = await sharp(imageBuffer, {
      animated: true
    }).metadata();

    const width = metadata.width || 1000;
    const height = metadata.height || 1000;

    const fontSize = Math.max(
      30,
      Math.floor(width / 12)
    );

    const safeText = escapeXml(text);

    // Text overlay
    const overlay = Buffer.from(`
      <svg width="${width}" height="${height}">
        <style>
          .text {
            fill: white;
            stroke: black;
            stroke-width: 6px;
            paint-order: stroke;
            font-family: Arial, sans-serif;
            font-size: ${fontSize}px;
            font-weight: bold;
          }
        </style>

        <text
          x="${width / 2}"
          y="${height - 60}"
          text-anchor="middle"
          class="text"
        >${safeText}</text>
      </svg>
    `);

    // Handle animated GIFs
    if (metadata.format === "gif") {
      const output = await sharp(image
