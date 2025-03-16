#!/bin/bash

# Colors for better readability
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Print banner
echo -e "${GREEN}=================================${NC}"
echo -e "${GREEN}  Starting StyleAI Containers    ${NC}"
echo -e "${GREEN}=================================${NC}"

# Function to check if Docker is running
check_docker() {
  if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running or not installed.${NC}"
    exit 1
  fi
}

# Function to start containers with a specific docker compose file
start_containers() {
  local compose_file=$1
  local service_name=$2
  local compose_filename=$3
  
  echo -e "${YELLOW}Starting $service_name containers...${NC}"
  
  if [ ! -d "$compose_file" ]; then
    echo -e "${RED}✗ Directory not found: $compose_file${NC}"
    return 1
  fi
  
  cd "$compose_file"
  
  if [ -f "$compose_filename" ]; then
    docker compose -f "$compose_filename" up -d --build
    
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}✓ $service_name containers started successfully${NC}"
    else
      echo -e "${RED}✗ Failed to start $service_name containers${NC}"
      cd - > /dev/null
      return 1
    fi
  else
    echo -e "${RED}✗ Docker Compose file not found: $compose_file/$compose_filename${NC}"
    cd - > /dev/null
    return 1
  fi
  
  cd - > /dev/null
  return 0
}

# Function to stop all containers
stop_containers() {
  echo -e "${YELLOW}Stopping all containers...${NC}"
  
  # Stop StyleAI containers
  if [ -d "$STYLEAI_COMPOSE" ]; then
    cd "$STYLEAI_COMPOSE"
    if [ -f "$STYLEAI_COMPOSE_FILENAME" ]; then
      docker compose -f "$STYLEAI_COMPOSE_FILENAME" down
    else
      echo -e "${RED}✗ Docker Compose file not found: $STYLEAI_COMPOSE/$STYLEAI_COMPOSE_FILENAME${NC}"
    fi
    cd - > /dev/null
  else
    echo -e "${RED}✗ Directory not found: $STYLEAI_COMPOSE${NC}"
  fi
  
  # Stop StyleAI-API containers
  if [ -d "$STYLEAI_API_COMPOSE" ]; then
    cd "$STYLEAI_API_COMPOSE"
    if [ -f "$STYLEAI_API_COMPOSE_FILENAME" ]; then
      docker compose -f "$STYLEAI_API_COMPOSE_FILENAME" down
    else
      echo -e "${RED}✗ Docker Compose file not found: $STYLEAI_API_COMPOSE/$STYLEAI_API_COMPOSE_FILENAME${NC}"
    fi
    cd - > /dev/null
  else
    echo -e "${RED}✗ Directory not found: $STYLEAI_API_COMPOSE${NC}"
  fi
  
  echo -e "${GREEN}All containers stopped${NC}"
}

# Function to stop a specific container
stop_specific_container() {
  local service=$1
  
  if [ "$service" == "styleai" ]; then
    echo -e "${YELLOW}Stopping StyleAI (Next.js app) containers...${NC}"
    if [ -d "$STYLEAI_COMPOSE" ]; then
      cd "$STYLEAI_COMPOSE"
      if [ -f "$STYLEAI_COMPOSE_FILENAME" ]; then
        docker compose -f "$STYLEAI_COMPOSE_FILENAME" down
        echo -e "${GREEN}✓ StyleAI (Next.js) containers stopped${NC}"
      else
        echo -e "${RED}✗ Docker Compose file not found: $STYLEAI_COMPOSE/$STYLEAI_COMPOSE_FILENAME${NC}"
        cd - > /dev/null
        return 1
      fi
      cd - > /dev/null
    else
      echo -e "${RED}✗ Directory not found: $STYLEAI_COMPOSE${NC}"
      return 1
    fi
  elif [ "$service" == "api" ]; then
    echo -e "${YELLOW}Stopping StyleAI-API (Flask server) containers...${NC}"
    if [ -d "$STYLEAI_API_COMPOSE" ]; then
      cd "$STYLEAI_API_COMPOSE"
      if [ -f "$STYLEAI_API_COMPOSE_FILENAME" ]; then
        docker compose -f "$STYLEAI_API_COMPOSE_FILENAME" down
        echo -e "${GREEN}✓ StyleAI-API (Flask) containers stopped${NC}"
      else
        echo -e "${RED}✗ Docker Compose file not found: $STYLEAI_API_COMPOSE/$STYLEAI_API_COMPOSE_FILENAME${NC}"
        cd - > /dev/null
        return 1
      fi
      cd - > /dev/null
    else
      echo -e "${RED}✗ Directory not found: $STYLEAI_API_COMPOSE${NC}"
      return 1
    fi
  else
    echo -e "${RED}Invalid service name. Use 'styleai' or 'api'.${NC}"
    return 1
  fi
  
  return 0
}

# Function to restart a specific container
restart_specific_container() {
  local service=$1
  
  if [ "$service" == "styleai" ]; then
    stop_specific_container "$service"
    start_containers "$STYLEAI_COMPOSE" "StyleAI (Next.js)" "$STYLEAI_COMPOSE_FILENAME"
    return $?
  elif [ "$service" == "api" ]; then
    stop_specific_container "$service"
    start_containers "$STYLEAI_API_COMPOSE" "StyleAI-API (Flask)" "$STYLEAI_API_COMPOSE_FILENAME"
    return $?
  else
    echo -e "${RED}Invalid service name. Use 'styleai' or 'api'.${NC}"
    return 1
  fi
}

# Function to show container status
show_status() {
  echo -e "${YELLOW}Container Status:${NC}"
  docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

# Function to show logs
show_logs() {
  local service=$1
  
  if [ "$service" == "styleai" ]; then
    echo -e "${YELLOW}Showing logs for StyleAI (Next.js app):${NC}"
    if [ -d "$STYLEAI_COMPOSE" ]; then
      cd "$STYLEAI_COMPOSE"
      if [ -f "$STYLEAI_COMPOSE_FILENAME" ]; then
        docker compose -f "$STYLEAI_COMPOSE_FILENAME" logs -f
      else
        echo -e "${RED}✗ Docker Compose file not found: $STYLEAI_COMPOSE/$STYLEAI_COMPOSE_FILENAME${NC}"
      fi
      cd - > /dev/null
    else
      echo -e "${RED}✗ Directory not found: $STYLEAI_COMPOSE${NC}"
    fi
  elif [ "$service" == "api" ]; then
    echo -e "${YELLOW}Showing logs for StyleAI-API (Flask server):${NC}"
    if [ -d "$STYLEAI_API_COMPOSE" ]; then
      cd "$STYLEAI_API_COMPOSE"
      if [ -f "$STYLEAI_API_COMPOSE_FILENAME" ]; then
        docker compose -f "$STYLEAI_API_COMPOSE_FILENAME" logs -f
      else
        echo -e "${RED}✗ Docker Compose file not found: $STYLEAI_API_COMPOSE/$STYLEAI_API_COMPOSE_FILENAME${NC}"
      fi
      cd - > /dev/null
    else
      echo -e "${RED}✗ Directory not found: $STYLEAI_API_COMPOSE${NC}"
    fi
  else
    echo -e "${RED}Invalid service name. Use 'styleai' or 'api'.${NC}"
  fi
}

# Function to show help
show_help() {
  echo -e "${GREEN}StyleAI Container Management Script${NC}"
  echo -e "\nUsage:"
  echo -e "  $0                    ${GREEN}Start all containers${NC}"
  echo -e "  $0 stop               ${GREEN}Stop all containers${NC}"
  echo -e "  $0 restart            ${GREEN}Restart all containers${NC}"
  echo -e "  $0 restart styleai    ${GREEN}Restart only the Next.js app${NC}"
  echo -e "  $0 restart api        ${GREEN}Restart only the Flask API server${NC}"
  echo -e "  $0 status             ${GREEN}Show container status${NC}"
  echo -e "  $0 logs styleai       ${GREEN}Show logs for the Next.js app${NC}"
  echo -e "  $0 logs api           ${GREEN}Show logs for the Flask API server${NC}"
  echo -e "  $0 help               ${GREEN}Show this help message${NC}"
}

# Set paths to docker compose files
# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
STYLEAI_COMPOSE="$SCRIPT_DIR/styleAI"
STYLEAI_COMPOSE_FILENAME="compose.yml"
STYLEAI_API_COMPOSE="$SCRIPT_DIR/styleAI-api"
STYLEAI_API_COMPOSE_FILENAME="docker-compose.yml"

# Check if directories exist
if [ ! -d "$STYLEAI_COMPOSE" ]; then
  echo -e "${RED}Error: StyleAI directory not found at $STYLEAI_COMPOSE${NC}"
  echo -e "${YELLOW}Current script directory: $SCRIPT_DIR${NC}"
  echo -e "${YELLOW}Please make sure the script is in the same directory as the styleAI and styleAI-api folders${NC}"
  exit 1
fi

if [ ! -d "$STYLEAI_API_COMPOSE" ]; then
  echo -e "${RED}Error: StyleAI-API directory not found at $STYLEAI_API_COMPOSE${NC}"
  echo -e "${YELLOW}Current script directory: $SCRIPT_DIR${NC}"
  echo -e "${YELLOW}Please make sure the script is in the same directory as the styleAI and styleAI-api folders${NC}"
  exit 1
fi

# Check if Docker is running
check_docker

# Process command line arguments
if [ "$1" == "stop" ]; then
  stop_containers
  exit 0
elif [ "$1" == "status" ]; then
  show_status
  exit 0
elif [ "$1" == "logs" ]; then
  if [ -z "$2" ]; then
    echo -e "${RED}Please specify which service logs to show: 'styleai' or 'api'${NC}"
    echo -e "Example: $0 logs styleai"
    exit 1
  fi
  show_logs "$2"
  exit 0
elif [ "$1" == "restart" ]; then
  if [ -z "$2" ]; then
    # Restart all containers
    stop_containers
    # Continue to start all containers
  else
    # Restart specific container
    restart_specific_container "$2"
    RESTART_STATUS=$?
    
    # Show status summary for the restarted container
    echo -e "${GREEN}=================================${NC}"
    echo -e "${GREEN}       Restart Summary          ${NC}"
    echo -e "${GREEN}=================================${NC}"
    
    if [ "$2" == "styleai" ]; then
      if [ $RESTART_STATUS -eq 0 ]; then
        echo -e "${GREEN}✓ StyleAI (Next.js):${NC} Restarted successfully"
      else
        echo -e "${RED}✗ StyleAI (Next.js):${NC} Failed to restart"
      fi
    elif [ "$2" == "api" ]; then
      if [ $RESTART_STATUS -eq 0 ]; then
        echo -e "${GREEN}✓ StyleAI-API (Flask):${NC} Restarted successfully"
      else
        echo -e "${RED}✗ StyleAI-API (Flask):${NC} Failed to restart"
      fi
    fi
    
    # Show running containers
    echo -e "\n${YELLOW}Running containers:${NC}"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    exit $RESTART_STATUS
  fi
elif [ "$1" == "help" ]; then
  show_help
  exit 0
fi

# Start both services if no specific restart was requested
start_containers "$STYLEAI_API_COMPOSE" "StyleAI-API (Flask)" "$STYLEAI_API_COMPOSE_FILENAME"
API_STATUS=$?

start_containers "$STYLEAI_COMPOSE" "StyleAI (Next.js)" "$STYLEAI_COMPOSE_FILENAME"
STYLEAI_STATUS=$?

# Show status summary
echo -e "${GREEN}=================================${NC}"
echo -e "${GREEN}       Deployment Summary        ${NC}"
echo -e "${GREEN}=================================${NC}"

if [ $API_STATUS -eq 0 ]; then
  echo -e "${GREEN}✓ StyleAI-API (Flask):${NC} Running"
else
  echo -e "${RED}✗ StyleAI-API (Flask):${NC} Failed to start"
fi

if [ $STYLEAI_STATUS -eq 0 ]; then
  echo -e "${GREEN}✓ StyleAI (Next.js):${NC} Running"
else
  echo -e "${RED}✗ StyleAI (Next.js):${NC} Failed to start"
fi

# Show running containers
echo -e "\n${YELLOW}Running containers:${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo -e "\n${GREEN}Services should be available at:${NC}"
echo -e "StyleAI (Next.js): http://localhost:80/styleai"
echo -e "StyleAI-API (Flask): http://localhost:5001"

echo -e "\n${YELLOW}Available commands:${NC}"
echo -e "  $0                    ${GREEN}Start all containers${NC}"
echo -e "  $0 stop               ${GREEN}Stop all containers${NC}"
echo -e "  $0 restart            ${GREEN}Restart all containers${NC}"
echo -e "  $0 restart styleai    ${GREEN}Restart only the Next.js app${NC}"
echo -e "  $0 restart api        ${GREEN}Restart only the Flask API server${NC}"
echo -e "  $0 status             ${GREEN}Show container status${NC}"
echo -e "  $0 logs styleai       ${GREEN}Show logs for the Next.js app${NC}"
echo -e "  $0 logs api           ${GREEN}Show logs for the Flask API server${NC}"
echo -e "  $0 help               ${GREEN}Show this help message${NC}"