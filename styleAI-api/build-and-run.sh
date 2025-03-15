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
docker run -d --name styleai-api -p 5001:5001 \
  -e DATABASE_URL="postgresql://test_owner:npg_riaEfFBXn19H@ep-snowy-bar-a7w4sdqq-pooler.ap-southeast-2.aws.neon.tech/test?sslmode=require" \
  styleai-api

# Check if container is running
echo "Checking container status..."
docker ps | grep styleai-api

# Wait for the server to start
echo "Waiting for the server to start..."
sleep 10  # 增加等待时间

# Check if server is responding
echo "Checking if server is responding..."
for i in {1..5}; do
  if curl -s http://localhost:5001/health > /dev/null; then
    echo "Server is up and running!"
    break
  fi
  
  if [ $i -eq 5 ]; then
    echo "Server failed to start properly. Check logs below:"
  else
    echo "Waiting for server to start... (attempt $i/5)"
    sleep 5
  fi
done

# Show logs
echo "Container logs:"
docker logs styleai-api

# Test the API
echo "Testing the API..."
python test-api.py

echo "StyleAI API is now running at http://localhost:5001"
echo "To check health status: curl http://localhost:5001/health"
echo "To stop the container: docker stop styleai-api" 