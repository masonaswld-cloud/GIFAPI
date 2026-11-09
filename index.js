const express = require("express");
const sharp = require("sharp");

const app = express();

app.use(express.json({ limit: "100mb" }));

app.post("/gif", async (req, res) => {
  try {
    const imageUrl = req.body.image;
    const text = req.body.text;

    if (!imageUrl) {
      return res.status(400).json({
        error: "No image URL was provided."
      });
    }

    if (!text) {
      return res.status(400).json({
        error: "No text was provided."
      });
    }

    // Download the Discord attachment
    const response = await fetch(imageUrl);

    if (!response.ok) {
      return res.status(400).json({
        error: "Could not download the image."
      });
    }

    const imageBuffer = Buffer.from(await response.arrayBuffer());

    // Get image dimensions
    const metadata = await sharp(imageBuffer).metadata();

    const width = metadata.width || 1000;
    const height = metadata.height || 1000;

    // Escape text so special characters don't break the SVG
    const safeText = String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

    // Create the text overlay
    const overlay = Buffer.from(`
      <svg width="${width}" height="${height}">
        <style>
          .text {
            fill: white;
            font-family: Arial, sans-serif;
            font-size: ${Math.max(30, Math.floor(width / 12))}px;
            font-weight: bold;
