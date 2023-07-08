import express from "express";
import multer from "multer";
import imagemin from "imagemin";
import imageminMozjpeg from "imagemin-mozjpeg";
import imageminPngquant from "imagemin-pngquant";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";
import os from "os";
import path from "path";

const app = express();

// Convert current module URL to file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, "../client/build")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

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

// Function to escape spaces and special characters in the filename
function escapeFilename(filename) {
  return filename.replace(/[^a-zA-Z0-9_.-]/g, (match) => {
    // Escape special characters using their hexadecimal code
    return "%" + match.charCodeAt(0).toString(16);
  });
}

// Optimize image using imagemin library
async function optimizeImage(filePath, originalname) {
  const escapedOriginalname = escapeFilename(originalname);
  const optimizedFilename = `${Date.now()}-${escapedOriginalname}`;
  const optimizedPath = path.resolve(optimizedDir, optimizedFilename);
  await imagemin([filePath], {
    destination: optimizedDir,
    plugins: [
      imageminMozjpeg({ quality: 75 }),
      imageminPngquant({ quality: [0.6, 0.8] }),
    ],
  });

  return {
    filename: optimizedFilename,
    path: optimizedPath,
  };
}

// Define API endpoint for image upload
app.post("/api/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const optimizedFile = await optimizeImage(
        req.file.path,
        req.file.originalname
    );

    // Check if the request is coming from a browser or form submission
    if (req.headers["user-agent"].includes("Mozilla")) {
      // Check if the request is from a form submission
      if (req.headers["content-type"].startsWith("multipart/form-data")) {
        // Send the optimized image as a downloadable attachment
        res.download(optimizedFile.path, optimizedFile.filename, (err) => {
          if (err) {
            console.error("Error downloading file:", err);
            res.status(500).json({ error: "Failed to download file" });
          } else {
            // Delete the temporary file after it has been downloaded
            fs.unlinkSync(optimizedFile.path);
          }
        });
      } else {
        // Return the path of the optimized image for programmatic access
        res.json({ path: optimizedFile.path });
      }
    } else {
      // Return the path of the optimized image for programmatic access
      res.json({ path: optimizedFile.path });
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
const port = process.env.PORT || 3000;
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
