# Docker Instructions for StyleAI API

This document provides step-by-step instructions for building and running the StyleAI API server using Docker.

## Files Created for Docker Support

1. **Dockerfile**: Contains instructions for building the Docker image
2. **build-and-run.sh**: Script to build and run the Docker container
3. **test-api.py**: Script to test the API server
4. **README.docker.md**: Detailed Docker documentation
5. **.dockerignore**: Specifies files to exclude from the Docker image

## Building the Docker Image

To build the Docker image, run:

```bash
docker build -t styleai-api .
```

This command builds a Docker image named "styleai-api" using the Dockerfile in the current directory.

## Running the Docker Container

To run the Docker container, execute:

```bash
docker run -d --name styleai-api -p 5001:5001 styleai-api
```

This command:

- Runs the container in detached mode (`-d`)
- Names the container "styleai-api" (`--name styleai-api`)
- Maps port 5001 on the host to port 5001 in the container (`-p 5001:5001`)
- Uses the "styleai-api" image

## Using the build-and-run.sh Script

For convenience, you can use the provided script:

```bash
./build-and-run.sh
```

This script:

1. Stops and removes any existing "styleai-api" container
2. Builds the Docker image
3. Runs the container
4. Displays the container status and logs
5. Tests the API endpoints

## API Endpoints

The StyleAI API provides the following endpoints:

### Health Check

- **Endpoint**: `GET /health`
- **Description**: Check if the API server is running
- **Response**: `{"status": "ok"}`

### Image Processing

- **Endpoint**: `POST /api/image/process`
- **Description**: Process an image to ensure it's under 5MB and convert to JPEG format
- **Request Body**: `{"image": "data:image/jpeg;base64,..."}`
- **Response**: Processed image data and metadata

### Image Download

- **Endpoint**: `POST /api/image/download`
- **Description**: Prepare an image for download
- **Request Body**: `{"image": "data:image/jpeg;base64,..."}`
- **Response**: Download information

### Personalized Analysis

- **Endpoint**: `POST /api/personalized/analysis`
- **Description**: Get personalized analysis based on job ID
- **Request Body**: `{"jobId": "your-job-id"}`
- **Response**: Analysis data including features, colors, and styles

### Wear Suit Pictures

- **Endpoint**: `POST /api/personalized/wear-suit-pictures`
- **Description**: Get suit picture recommendations
- **Request Body**: `{"jobId": "your-job-id"}`
- **Response**: List of recommended suit pictures with URLs and descriptions

## Testing the API

After the container is running, you can test the API using the provided test script:

```bash
# Test all endpoints
python test-api.py

# Test image processing with a sample image
python test-api.py --image /path/to/image.jpg
```

## Managing the Container

### Checking container status

```bash
docker ps | grep styleai-api
```

### Viewing logs

```bash
docker logs styleai-api
```

### Stopping the container

```bash
docker stop styleai-api
```

### Removing the container

```bash
docker rm styleai-api
```

## Troubleshooting

### Container fails to start

Check the logs for errors:

```bash
docker logs styleai-api
```

### API server is not responding

Check if the container is running:

```bash
docker ps | grep styleai-api
```

Try restarting the container:

```bash
docker restart styleai-api
```

### Port conflict

If port 5001 is already in use, you can change the port mapping:

```bash
docker run -d --name styleai-api -p 8080:5001 styleai-api
```

This makes the API available at http://localhost:8080 instead.
