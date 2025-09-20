#!/bin/bash

# Rollback script for Pokedex application
# This script handles rolling back to a previous deployment

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
LOG_FILE="/var/log/pokedex-rollback.log"

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

# Main rollback process
log "Starting rollback process..."

# Navigate to project directory
cd "$PROJECT_DIR" || error "Failed to navigate to project directory"

# Get the previous git commit
PREVIOUS_COMMIT=$(git rev-parse HEAD~1)
log "Rolling back to commit: $PREVIOUS_COMMIT"

# Checkout previous commit
git checkout "$PREVIOUS_COMMIT" || error "Failed to checkout previous commit"

# Restore backed up configuration files
if [ -d "$BACKUP_DIR" ]; then
    log "Restoring configuration files from backup..."
    cp -r "$BACKUP_DIR"/.env* "$PROJECT_DIR"/ 2>/dev/null || warning "No .env files to restore"
else
    warning "No backup directory found"
fi

# Stop current containers
log "Stopping current containers..."
docker-compose -f "$COMPOSE_FILE" down

# Rebuild and start containers with previous version
log "Starting containers with previous version..."
docker-compose -f "$COMPOSE_FILE" up -d --build

# Wait for services to be healthy
sleep 10

# Check health status
log "Checking service health..."
docker-compose -f "$COMPOSE_FILE" ps

# Log rollback completion
log "Rollback completed successfully!"

exit 0