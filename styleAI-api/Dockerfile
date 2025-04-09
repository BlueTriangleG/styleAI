FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    FLASK_APP=app.py \
    FLASK_ENV=production

# Install system dependencies and Python packages in one step
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    curl \
    libpq-dev \
    python3-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && pip install --no-cache-dir flask==2.3.3 flask-cors==4.0.0 pillow==10.0.0 \
    gunicorn==21.2.0 python-dotenv==1.0.0 psycopg2-binary==2.9.9 \
    Werkzeug==2.3.7 scikit-learn==1.3.0 torch==2.0.0 numpy==1.24.4 \
    requests==2.31.0 matplotlib==3.8.0 transformers==4.31.0

# Create directories
RUN mkdir -p /app/temp /app/app/utils/algorithms /app/app/routes \
    && chmod 777 /app/temp

# Copy application code
COPY app.py .
COPY app/__init__.py app/
COPY app/mock_data.py app/

# Copy tool modules
COPY app/utils/*.py app/utils/
COPY app/utils/algorithms/*.py app/utils/algorithms/

# Copy ALL_images directory and ALL_final_merged.json file
COPY app/utils/algorithms/ALL_images/ app/utils/algorithms/ALL_images/
COPY app/utils/algorithms/ALL_final_merged.json app/utils/algorithms/ALL_final_merged.json

# Copy route modules
COPY app/routes/*.py app/routes/

# Expose port
EXPOSE 5001

# Run with Gunicorn with worker concurrency - memory optimized configuration
CMD ["gunicorn", "--workers=1", "--threads=4", "--worker-class=gthread", "--bind=0.0.0.0:5001", "--timeout=240", "--max-requests=1000", "--max-requests-jitter=50", "app:create_app()"] 