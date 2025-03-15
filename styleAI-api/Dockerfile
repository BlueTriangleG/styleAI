FROM python:3.10-slim AS base

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    FLASK_APP=app.py \
    FLASK_ENV=production

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    curl \
    libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create a stage for dependency installation
FROM base AS dependencies

# Copy dependency files
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Final stage
FROM dependencies AS final

# Create temp directory for image storage
RUN mkdir -p /app/temp && chmod 777 /app/temp

# Create necessary directory structure
RUN mkdir -p /app/app/utils/algorithms /app/app/routes

# Copy application code
COPY app.py .
COPY app/__init__.py app/
COPY app/mock_data.py app/

# Copy tool modules
COPY app/utils/*.py app/utils/
COPY app/utils/algorithms/*.py app/utils/algorithms/

# Copy route modules
COPY app/routes/*.py app/routes/

# Expose port
EXPOSE 5001

# Run the application
CMD ["python", "app.py"] 