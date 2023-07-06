# Image Optimizer API Documentation

The Image Optimizer API allows users to upload images and optimize them using the imagemin library. It provides an endpoint for image upload and optimization, and supports both browser-based and programmatic access.

## Base URL

The base URL for the API is `http://localhost:3000`.

## API Endpoints

### Upload and Optimize Image

**Endpoint:** `/api/upload`
**Method:** POST

This endpoint accepts an image file upload and optimizes the image using the imagemin library. The optimized image is saved to the server and can be downloaded or accessed programmatically.

#### Request Body

The request should include a `multipart/form-data` body with the following field:

- `image`: The image file to be uploaded and optimized.

#### Response

The response will be in JSON format.

If the request is coming from a browser or form submission, the response will be a downloadable attachment.

If the request is a programmatic access, the response will include the path to the optimized image.

**Example Response:**

```json
{
  "path": "/optimized/1625497200000-image.jpg"
}
```

#### Error Responses

- `400 Bad Request`: If no image file is provided in the request.
- `500 Internal Server Error`: If an error occurs during image optimization or downloading.

## Examples

### Browser-based Usage

```html
<form
  action="http://localhost:3000/api/upload"
  method="post"
  enctype="multipart/form-data"
>
  <input type="file" name="image" />
  <input type="submit" value="Upload" />
</form>
```

After submitting the form, the optimized image will be downloaded automatically.

### Programmatic Usage

```javascript
const fetch = require("node-fetch");

const uploadImage = async (imagePath) => {
  const formData = new FormData();
  formData.append("image", fs.createReadStream(imagePath));

  const response = await fetch("http://localhost:3000/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  console.log("Optimized Image Path:", data.path);
};
```

In a programmatic scenario, you can use the `fetch` library or any HTTP client library to send a POST request to the `/api/upload` endpoint with the image file as `multipart/form-data`. The response will contain the path to the optimized image.

## Dependencies

The Image Optimizer API relies on the following dependencies:

- express: Fast, unopinionated, minimalist web framework for Node.js
- multer: Node.js middleware for handling `multipart/form-data` file uploads
- imagemin: Image optimization library
- imagemin-mozjpeg: MozJPEG plugin for imagemin
- imagemin-pngquant: PNGQuant plugin for imagemin

## Getting Started

To run the Image Optimizer API locally, follow these steps:

1. Install Node.js and npm on your machine.
2. Clone the repository and navigate to the project directory.
3. Install the dependencies by running `npm install`.
4. Start the server by running `npm start`.
5. The API will be accessible at `http://localhost:3000`.

## Error Handling

The API handles errors in case of invalid requests or internal server errors. If an error occurs, the API will respond with an appropriate status code and an error message in JSON format.

## Conclusion

The Image Optimizer API provides a simple and convenient way to upload and optimize images. Whether you're using it in a browser or programmatically, you can easily integrate image optimization capabilities into your applications. For further assistance, refer to the
