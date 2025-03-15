# StyleAI API Server

A Flask-based API server for StyleAI that provides image processing capabilities.

## Features

- Image format conversion (PNG, GIF, WebP, etc. to JPEG)
- Image compression to ensure files are under 5MB
- Image download preparation
- CORS support for cross-origin requests

## Running with Docker (Recommended)

The easiest way to run the StyleAI API server is using Docker:

```bash
# Build and run with Docker
./build-and-run.sh
```

For detailed Docker instructions, see [Docker Guide](README.docker.md).

## Manual Installation

### Requirements

- Python 3.8+
- Flask
- Pillow (PIL)
- Flask-CORS

### Installation

1. Clone the repository
2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
3. Activate the virtual environment:
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Server

### Development Mode

```bash
python app.py
```

The server will start on http://localhost:5001

### Production Mode

```bash
gunicorn -w 4 -b 0.0.0.0:5001 app:app
```

## Testing the API

You can use the included test script to verify the API is working correctly:

```bash
# Test health endpoint
./test-api.py

# Test image processing with a sample image
./test-api.py --image /path/to/image.jpg
```

## API Endpoints

### Health Check

```
GET /health
```

Returns a simple status check to verify the API is running.

### Process Image

```
POST /api/image/process
```

Processes an image to ensure it's under 5MB and converts it to JPEG format.

**Request Body:**

```json
{
  "image": "data:image/png;base64,..."
}
```

**Response:**

```json
{
  "success": true,
  "processedImage": "data:image/jpeg;base64,...",
  "message": "Image processed successfully. Size reduced from 8.50MB to 4.20MB"
}
```

### Prepare Image Download

```
POST /api/image/download
```

Prepares an image for download by saving it to a temporary file.

**Request Body:**

```json
{
  "image": "data:image/jpeg;base64,...",
  "filename": "my_image.jpg" // Optional
}
```

**Response:**

```json
{
  "success": true,
  "filePath": "/tmp/my_image.jpg",
  "message": "Image ready for download"
}
```

## Integration with StyleAI Frontend

To use this API with the StyleAI frontend, update the image processing functions to call these API endpoints instead of processing images client-side.

Example:

```javascript
async function processImage(imageData) {
  const response = await fetch('http://localhost:5001/api/image/process', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ image: imageData }),
  });

  const result = await response.json();

  if (result.success) {
    return result.processedImage;
  } else {
    throw new Error(result.error || 'Image processing failed');
  }
}
```
