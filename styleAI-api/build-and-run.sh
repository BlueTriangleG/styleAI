#!/bin/bash

# Build and run the StyleAI API Docker container

# Stop and remove existing container if it exists
echo "Stopping and removing existing container if it exists..."
docker stop styleai-api 2>/dev/null || true
docker rm styleai-api 2>/dev/null || true

# Build the Docker image
echo "Building Docker image..."
docker build -t styleai-api .

# Run the container
echo "Starting container..."
docker run -d --name styleai-api -p 5001:5001 styleai-api

# Check if container is running
echo "Checking container status..."
docker ps | grep styleai-api

# Wait for the server to start
echo "Waiting for the server to start..."
sleep 3

# Show logs
echo "Container logs:"
docker logs styleai-api

# Test the API
echo "Testing the API..."
python test-api.py

echo "StyleAI API is now running at http://localhost:5001"
echo "To check health status: curl http://localhost:5001/health"
echo "To stop the container: docker stop styleai-api" 