const express = require("express");
const multer = require("multer");
const sharp = require("sharp");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.post("/gif", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No image was uploaded."
      });
    }

    if (!req.body.text) {
      return res.status(400).json({
        error: "No text was provided."
      });
    }

    const text = req.body.text;

    const output = await sharp(req.file.buffer)
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
