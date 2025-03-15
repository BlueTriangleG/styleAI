# StyleAI API Docker Guide

This guide explains how to build and run the StyleAI API server using Docker.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)

## Quick Start

The easiest way to build and run the StyleAI API server is to use the provided script:

```bash
./build-and-run.sh
```

This script will:

1. Stop and remove any existing container
2. Build the Docker image
3. Start the container in detached mode
4. Show the container status and logs

The API server will be available at http://localhost:5001.

## Manual Build and Run

If you prefer to build and run the container manually, follow these steps:

### Build the Docker image

```bash
docker build -t styleai-api .
```

### Run the container

```bash
docker run -d --name styleai-api -p 5001:5001 styleai-api
```

### Check container status

```bash
docker ps | grep styleai-api
```

### View logs

```bash
docker logs styleai-api
```

### Test the API

```bash
python test-api.py
```

### Stop the container

```bash
docker stop styleai-api
```

### Remove the container

```bash
docker rm styleai-api
```

## API Endpoints

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

## Configuration

You can modify the Docker configuration in the following files:

- `Dockerfile`: Container build instructions

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

If port 5001 is already in use, you can change the port mapping when running the container:

```bash
docker run -d --name styleai-api -p 8080:5001 styleai-api
```

This maps container port 5001 to host port 8080, so the API will be available at http://localhost:8080.
