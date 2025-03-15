#!/bin/sh
set -e

# Log startup information
echo "Starting Style-AI application..."
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"

# Check if required environment variables are set
if [ -z "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" ]; then
  echo "Warning: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set. Authentication may not work properly."
fi

if [ -z "$CLERK_SECRET_KEY" ]; then
  echo "Warning: CLERK_SECRET_KEY is not set. Authentication may not work properly."
fi

# Start the application
echo "Starting Next.js application..."
exec npm start 