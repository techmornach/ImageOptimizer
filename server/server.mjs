import express from "express";
import multer from "multer";
import imagemin from "imagemin";
import imageminMozjpeg from "imagemin-mozjpeg";
import imageminPngquant from "imagemin-pngquant";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";
import os from "os";
import path from "path"

const app = express();

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, '../client/build')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});x

// Convert current module URL to file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure Multer for handling image uploads
const storage = multer.diskStorage({
  destination: join(__dirname, "uploads"),
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Create the necessary directories if they don't exist
const uploadsDir = join(__dirname, "uploads");
const optimizedDir = join(__dirname, "optimized");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

if (!fs.existsSync(optimizedDir)) {
  fs.mkdirSync(optimizedDir);
}

// Optimize image using imagemin library
async function optimizeImage(filePath, originalname) {
  const optimizedPath = join(optimizedDir, `${Date.now()}-${originalname}`);
  await imagemin([filePath], {
    destination: optimizedDir,
    plugins: [
      imageminMozjpeg({ quality: 75 }),
      imageminPngquant({ quality: [0.6, 0.8] }),
    ],
  });

  return optimizedPath;
}

// Define API endpoint for image upload
app.post("/api/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const optimizedPath = await optimizeImage(
      req.file.path,
      req.file.originalname
    );

    // Check if the request is coming from a browser or form submission
    if (req.headers["user-agent"].includes("Mozilla")) {
      // Check if the request is from a form submission
      if (req.headers["content-type"].startsWith("multipart/form-data")) {
        // Send the optimized image as a downloadable attachment
        res.download(optimizedPath, (err) => {
          if (err) {
            console.error("Error downloading file:", err);
            res.status(500).json({ error: "Failed to download file" });
          } else {
            // Delete the temporary file after it has been downloaded
            fs.unlinkSync(optimizedPath);
          }
        });
      } else {
        // Return the path of the optimized image for programmatic access
        res.json({ path: optimizedPath });
      }
    } else {
      // Return the path of the optimized image for programmatic access
      res.json({ path: optimizedPath });
    }
  } catch (error) {
    console.error("Error optimizing image:", error);
    res.status(500).json({ error: "Failed to optimize image" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Something went wrong" });
});

// Start the server
const port = 3000;
app.listen(port, () => {
  const networkInterfaces = os.networkInterfaces();
  const ipAddresses = Object.values(networkInterfaces).flatMap((interfaces) =>
    interfaces
      .filter((iface) => iface.family === "IPv4" && !iface.internal)
      .map((iface) => iface.address)
  );

  console.log("Server is listening on the following IP addresses:");
  ipAddresses.forEach((ip) => console.log(ip));

  console.log(`Server is listening on port ${port}`);
});
