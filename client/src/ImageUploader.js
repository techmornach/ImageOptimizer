import React, { useState } from "react";
import axios from "axios";

const ImageUploader = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [optimizedImage, setOptimizedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (event) => {
    setSelectedImage(event.target.files[0]);
    setOptimizedImage(null);
  };

  const handleUpload = async () => {
    if (selectedImage) {
      setIsLoading(true);
      try {
        const formData = new FormData();
        formData.append("image", selectedImage);

        const response = await axios.post(`/api/upload`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        setOptimizedImage(response.data.path);
      } catch (error) {
        console.error("Error uploading image:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div>
      <h2>Image Uploader</h2>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      <button onClick={handleUpload} disabled={isLoading || !selectedImage}>
        Upload
      </button>
      {isLoading && <p>Uploading image...</p>}
      {optimizedImage && (
        <div>
          <h3>Optimized Image</h3>
          <img src={optimizedImage} alt="Optimized" />
          <a href={optimizedImage} download>
            Download
          </a>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
