# StyleAI Container Management

A comprehensive management script for running the StyleAI Next.js application and Flask API server using Docker Compose.

## Overview

The `styleai-app.sh` script provides a convenient way to manage both the StyleAI Next.js application and StyleAI-API Flask server from a single command. It handles starting, stopping, restarting, and monitoring Docker containers for both services.

## Prerequisites

- Docker Engine (20.10.0+)
- Docker Compose v2 (2.0.0+)
- Bash shell

## Directory Structure

The script expects the following directory structure:

```
project-root/
├── styleai-app.sh          # This management script
├── styleAI/                # Next.js application
│   └── compose.yml         # Docker Compose file for Next.js app
└── styleAI-api/            # Flask API server
    └── docker-compose.yml  # Docker Compose file for Flask API
```

## Installation

1. Make the script executable:
   ```bash
   chmod +x styleai-app.sh
   ```

## Usage

### Starting Containers

To start both the Next.js application and Flask API server:

```bash
./styleai-app.sh
```

This command will:
- Build and start the containers if they don't exist
- Show a deployment summary
- Display the status of running containers
- Provide URLs for accessing the services

### Stopping Containers

To stop all running containers:

```bash
./styleai-app.sh stop
```

### Restarting Containers

To restart all containers (stop and then start):

```bash
./styleai-app.sh restart
```

To restart only the Next.js application:

```bash
./styleai-app.sh restart styleai
```

To restart only the Flask API server:

```bash
./styleai-app.sh restart api
```

### Checking Container Status

To view the status of all containers:

```bash
./styleai-app.sh status
```

### Viewing Container Logs

To view logs for the Next.js application:

```bash
./styleai-app.sh logs styleai
```

To view logs for the Flask API server:

```bash
./styleai-app.sh logs api
```

### Getting Help

To display all available commands:

```bash
./styleai-app.sh help
```

## Service URLs

After starting the containers, the services will be available at:

- **StyleAI (Next.js)**: http://localhost:80/styleai
- **StyleAI-API (Flask)**: http://localhost:5001

## Features

- **Color-coded output** for better readability
- **Error handling** for Docker and file operations
- **Status reporting** for all containers
- **Log viewing** for debugging
- **Container management** (start, stop, restart)
- **Selective container restart** for targeted updates
- **Automatic directory navigation** to run Docker Compose commands

## Troubleshooting

If you encounter issues:

1. **Docker not running**: Ensure Docker Engine is running on your system
2. **Permission denied**: Make sure the script has execute permissions (`chmod +x styleai-app.sh`)
3. **File not found errors**: Verify the directory structure matches what the script expects
4. **Port conflicts**: Check if ports 80, 3000, or 5001 are already in use by other applications

## Example Output

```
=================================
  Starting StyleAI Containers    
=================================
Starting StyleAI-API (Flask) containers...
✓ StyleAI-API (Flask) containers started successfully
Starting StyleAI (Next.js) containers...
✓ StyleAI (Next.js) containers started successfully
=================================
       Deployment Summary        
=================================
✓ StyleAI-API (Flask): Running
✓ StyleAI (Next.js): Running

Running containers:
NAMES               STATUS              PORTS
styleai-nginx       Up 2 minutes        0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
styleai             Up 2 minutes        0.0.0.0:3000->3000/tcp
styleai-api         Up 2 minutes        0.0.0.0:5001->5001/tcp

Services should be available at:
StyleAI (Next.js): http://localhost:80/styleai
StyleAI-API (Flask): http://localhost:5001

Available commands:
  ./styleai-app.sh                    Start all containers
  ./styleai-app.sh stop               Stop all containers
  ./styleai-app.sh restart            Restart all containers
  ./styleai-app.sh restart styleai    Restart only the Next.js app
  ./styleai-app.sh restart api        Restart only the Flask API server
  ./styleai-app.sh status             Show container status
  ./styleai-app.sh logs styleai       Show logs for the Next.js app
  ./styleai-app.sh logs api           Show logs for the Flask API server
  ./styleai-app.sh help               Show this help message
```

## Components

### StyleAI (Next.js Application)

A web application built with Next.js that provides:
- AI-powered styling recommendations
- User authentication
- Dashboard for managing style preferences
- Responsive design for all devices

### StyleAI-API (Flask Server)

A Flask-based API server that provides:
- Image processing capabilities
- Image format conversion
- Image compression
- Image download preparation
- CORS support for cross-origin requests 