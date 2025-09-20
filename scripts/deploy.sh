#!/bin/bash

# Deployment script for Pokedex application
# This script handles the deployment process with zero downtime

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="$HOME/pokedex-voltron"
COMPOSE_FILE="docker-compose.production.yml"
BACKUP_DIR="$HOME/backups/pokedex"
LOG_FILE="/var/log/pokedex-deploy.log"

# Functions
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

# Main deployment process
log "Starting deployment process..."

# Navigate to project directory
cd "$PROJECT_DIR" || error "Failed to navigate to project directory"

# Pull latest changes from git
log "Pulling latest changes from git..."
git fetch --all
git reset --hard origin/main

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Backup current deployment configuration
log "Creating backup of current configuration..."
cp -r "$PROJECT_DIR"/.env* "$BACKUP_DIR"/ 2>/dev/null || warning "No .env files to backup"

# Pull latest Docker images
log "Pulling latest Docker images..."
docker-compose -f "$COMPOSE_FILE" pull || error "Failed to pull Docker images"

# Health check function
health_check() {
    local service=$1
    local url=$2
    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$url" > /dev/null; then
            log "$service is healthy"
            return 0
        fi
        log "Waiting for $service to be healthy (attempt $attempt/$max_attempts)..."
        sleep 2
        ((attempt++))
    done

    error "$service failed health check after $max_attempts attempts"
}

# Deploy with zero downtime using blue-green deployment
log "Starting blue-green deployment..."

# Start new containers
docker-compose -f "$COMPOSE_FILE" up -d --no-deps --scale frontend=2 --scale backend=2

# Wait for new containers to be healthy
health_check "Backend" "http://localhost:3000/health"
health_check "Frontend" "http://localhost:80"

# Remove old containers
log "Removing old containers..."
docker-compose -f "$COMPOSE_FILE" up -d --no-deps --remove-orphans

# Clean up old images
log "Cleaning up old Docker images..."
docker image prune -f

# Run database migrations if needed
log "Running database migrations..."
docker-compose -f "$COMPOSE_FILE" exec -T backend bunx prisma migrate deploy || warning "Migrations may have already been applied"

# Log deployment success
log "Deployment completed successfully!"

# Show container status
log "Current container status:"
docker-compose -f "$COMPOSE_FILE" ps

# Send notification (optional - requires configuration)
# curl -X POST -H "Content-Type: application/json" \
#      -d '{"text":"Pokedex deployment completed successfully!"}' \
#      "$SLACK_WEBHOOK_URL" 2>/dev/null || true

exit 0