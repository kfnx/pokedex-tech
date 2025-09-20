# Pokedex Deployment Guide - Vercel-like Auto-deployment

This guide sets up a Vercel-like auto-deployment system for your Pokedex application on your Ubuntu server.

## Architecture Overview

The deployment system consists of:
- **GitHub Actions**: CI/CD pipeline that builds and pushes Docker images
- **Docker & Docker Compose**: Containerization and orchestration
- **Watchtower**: Automatic container updates (optional)
- **Nginx**: Reverse proxy with load balancing
- **GitHub Container Registry**: Docker image storage

## Prerequisites

- Ubuntu server (20.04 or later)
- Docker and Docker Compose installed
- GitHub repository with secrets configured
- Domain name (optional but recommended)

## Initial Server Setup

### 1. Install Required Software

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install additional tools
sudo apt install -y git nginx certbot python3-certbot-nginx
```

### 2. Clone Repository

```bash
cd ~
git clone https://github.com/YOUR_USERNAME/pokedex-voltron.git
cd pokedex-voltron
```

### 3. Configure Environment Variables

```bash
# Backend environment
cp pokedex-backend/.env.example pokedex-backend/.env
nano pokedex-backend/.env
# Add your DATABASE_URL and DIRECT_URL

# Create production environment file
cat > .env.production << EOF
DOCKER_REGISTRY=ghcr.io
VERSION=latest
FRONTEND_PORT=80
BACKEND_PORT=3000
NGINX_PORT=8080
BACKEND_URL=http://localhost:3000
EOF
```

### 4. Set Up GitHub Secrets

In your GitHub repository, go to Settings > Secrets and add:

- `SERVER_HOST`: Your server's IP address or domain
- `SERVER_USER`: SSH username (e.g., ubuntu)
- `SERVER_PORT`: SSH port (default: 22)
- `SERVER_SSH_KEY`: Your private SSH key for the server

### 5. Initial Deployment

```bash
# Make scripts executable
chmod +x scripts/deploy.sh scripts/rollback.sh

# Run initial deployment
./scripts/deploy.sh
```

## Auto-deployment Setup

The system is configured to automatically deploy when you push to the `main` branch:

1. **Push to main branch** → Triggers GitHub Actions
2. **GitHub Actions** → Builds Docker images and pushes to registry
3. **GitHub Actions** → SSHs to server and runs deployment script
4. **Server** → Pulls new images and restarts containers with zero downtime

## Manual Deployment Commands

```bash
# Deploy latest version
cd ~/pokedex-voltron
./scripts/deploy.sh

# Rollback to previous version
./scripts/rollback.sh

# View logs
docker-compose -f docker-compose.production.yml logs -f

# Restart services
docker-compose -f docker-compose.production.yml restart

# Stop all services
docker-compose -f docker-compose.production.yml down

# Start all services
docker-compose -f docker-compose.production.yml up -d
```

## SSL/HTTPS Setup with Let's Encrypt

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is set up automatically
# Test renewal
sudo certbot renew --dry-run
```

## Monitoring and Health Checks

### Service Health Endpoints
- Backend: `http://your-server:3000/health`
- Frontend: `http://your-server:80`

### Container Status
```bash
docker-compose -f docker-compose.production.yml ps
docker stats
```

### Logs
```bash
# All services
docker-compose -f docker-compose.production.yml logs -f

# Specific service
docker-compose -f docker-compose.production.yml logs -f backend
docker-compose -f docker-compose.production.yml logs -f frontend

# Deployment logs
tail -f /var/log/pokedex-deploy.log
```

## Scaling

### Horizontal Scaling
```bash
# Scale backend to 3 instances
docker-compose -f docker-compose.production.yml up -d --scale backend=3

# Scale frontend to 2 instances
docker-compose -f docker-compose.production.yml up -d --scale frontend=2
```

## Backup and Recovery

### Database Backup
```bash
# Create backup
docker-compose -f docker-compose.production.yml exec postgres pg_dump -U postgres pokedex > backup_$(date +%Y%m%d).sql

# Restore backup
docker-compose -f docker-compose.production.yml exec -T postgres psql -U postgres pokedex < backup_20240101.sql
```

### Full Application Backup
```bash
# Backup volumes and config
tar -czf pokedex-backup-$(date +%Y%m%d).tar.gz \
  pokedex-backend/.env \
  docker-compose.production.yml \
  nginx/
```

## Troubleshooting

### Common Issues

1. **Containers won't start**
   ```bash
   docker-compose -f docker-compose.production.yml logs
   docker system prune -a
   ```

2. **Database connection issues**
   ```bash
   docker-compose -f docker-compose.production.yml exec backend bunx prisma migrate deploy
   ```

3. **Port conflicts**
   ```bash
   sudo lsof -i :80
   sudo lsof -i :3000
   ```

4. **GitHub Actions deployment fails**
   - Check SSH key permissions
   - Verify server connectivity
   - Check GitHub secrets configuration

## Security Best Practices

1. **Use environment variables** for sensitive data
2. **Enable firewall** with UFW:
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```
3. **Regular updates**:
   ```bash
   sudo apt update && sudo apt upgrade
   docker system prune -a --volumes
   ```
4. **Use HTTPS** in production
5. **Implement rate limiting** (already configured in nginx.conf)
6. **Regular backups** to external storage

## Advanced Features

### Blue-Green Deployment
The deployment script includes zero-downtime deployment using a blue-green strategy:
1. New containers are started alongside old ones
2. Health checks ensure new containers are ready
3. Old containers are removed once new ones are healthy

### Automatic Updates with Watchtower
Watchtower polls the registry every 5 minutes for image updates:
```bash
docker run -d \
  --name watchtower \
  -v /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower \
  --cleanup \
  --interval 300
```

### Custom Domain Setup
1. Point your domain's A record to your server IP
2. Update nginx configuration with your domain
3. Set up SSL with Let's Encrypt
4. Update BACKEND_URL in .env.production

## Maintenance

### Weekly Tasks
- Review logs for errors
- Check disk space: `df -h`
- Update dependencies if needed

### Monthly Tasks
- Security updates: `sudo apt update && sudo apt upgrade`
- Database backup
- Review and rotate logs

## Support and Updates

- Check deployment status in GitHub Actions tab
- Monitor container health with provided endpoints
- Use rollback script if issues occur
- Keep deployment scripts updated with repository changes

---

This setup provides a robust, scalable, and automated deployment system similar to Vercel but on your own infrastructure.