const express = require("express");
const sharp = require("sharp");

const app = express();

app.use(express.json());

app.post("/gif", async (req, res) => {
  try {
    const { image, text } = req.body;

    if (!image) {
      return res.status(400).json({
        error: "No image URL was provided."
      });
    }

    if (!text) {
      return res.status(400).json({
        error: "No text was provided."
      });
    }

    const response = await fetch(image);

    if (!response.ok) {
      return res.status(400).json({
        error: "Could not download the image."
      });
    }

    const imageBuffer = Buffer.from(await response.arrayBuffer());

    const output = await sharp(imageBuffer)
      .composite([
        {
          input: Buffer.from(`
            <svg width="1000" height="200">
              <style>
                .text {
                  fill: white;
                  font-size: 70px;
                  font-weight: bold;
                  font-family: Arial;
                  text-anchor: middle;
                }
              </style>
              <text x="500" y="120" class="text">${text}</text>
            </svg>
          `),
          gravity: "south"
        }
      ])
      .png()
      .toBuffer();

    res.set("Content-Type", "image/png");
    res.send(output);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to add text to the image."
    });
  }
});

app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "GIF API is working!"
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
