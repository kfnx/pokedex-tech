# Pokédex Kubernetes Deployment

This directory contains Kubernetes manifests for deploying the Pokédex application to a Kubernetes cluster.

## Prerequisites

- Kubernetes cluster (local or cloud-based)
- kubectl configured to connect to your cluster
- Docker images built locally or pushed to a registry
- NGINX Ingress Controller installed in your cluster

## Quick Start

1. **Build Docker images** (if not already built):
   ```bash
   docker-compose build
   ```

2. **Deploy to Kubernetes**:
   ```bash
   cd k8s
   ./deploy.sh
   ```

3. **Add local DNS entry** (for local development):
   ```bash
   echo "127.0.0.1 pokedex.local" | sudo tee -a /etc/hosts
   ```

4. **Access the application**:
   - Frontend: http://pokedex.local
   - API Documentation: http://pokedex.local/docs
   - Health Check: http://pokedex.local/health

## Manual Deployment

If you prefer to deploy manually:

```bash
# Create namespace
kubectl apply -f namespace.yaml

# Deploy database layer
kubectl apply -f postgres.yaml
kubectl apply -f redis.yaml

# Deploy application layer
kubectl apply -f backend.yaml
kubectl apply -f frontend.yaml

# Setup ingress
kubectl apply -f ingress.yaml
```

## Configuration Files

- **`namespace.yaml`**: Creates the `pokedex` namespace
- **`postgres.yaml`**: PostgreSQL database with persistent storage
- **`redis.yaml`**: Redis cache for rate limiting
- **`backend.yaml`**: Express.js API server (2 replicas)
- **`frontend.yaml`**: React Native web frontend (2 replicas)
- **`ingress.yaml`**: NGINX ingress for external access
- **`deploy.sh`**: Automated deployment script

## Architecture

```
┌─────────────┐    ┌─────────────┐
│   Frontend  │    │   Backend   │
│  (2 pods)   │    │  (2 pods)   │
└─────────────┘    └─────────────┘
       │                   │
       └───────┬───────────┘
               │
    ┌─────────────────────┐
    │      Ingress        │
    │   (pokedex.local)   │
    └─────────────────────┘
               │
    ┌─────────────┐    ┌─────────────┐
    │ PostgreSQL  │    │    Redis    │
    │  (1 pod)    │    │  (1 pod)    │
    └─────────────┘    └─────────────┘
```

## Resource Requirements

### Minimum Resources
- **Backend**: 250m CPU, 256Mi RAM per pod
- **Frontend**: 100m CPU, 128Mi RAM per pod
- **PostgreSQL**: 500m CPU, 512Mi RAM
- **Redis**: 100m CPU, 64Mi RAM
- **Storage**: 10Gi for PostgreSQL data

### Production Recommendations
- Scale backend to 3-5 replicas based on load
- Use external managed database (RDS, Cloud SQL, etc.)
- Configure horizontal pod autoscaling
- Set up monitoring and logging
- Use TLS/SSL certificates

## Environment Variables

### Backend Configuration
```yaml
DATABASE_URL: "postgresql://postgres:postgres123@postgres:5432/pokedex"
DIRECT_URL: "postgresql://postgres:postgres123@postgres:5432/pokedex"
REDIS_URL: "redis://redis:6379"
NODE_ENV: "production"
PORT: "3000"
```

### Frontend Configuration
```yaml
BACKEND_API_URL: "http://backend:3000"
NODE_ENV: "production"
```

## Database Setup

The PostgreSQL deployment includes:
- Persistent volume for data storage
- Health checks for readiness/liveness
- Secret management for credentials
- Automatic database creation

Default credentials (change for production):
- Database: `pokedex`
- Username: `postgres`
- Password: `postgres123`

## Ingress Configuration

The ingress routes traffic as follows:
- `/api/*` → Backend service
- `/docs/*` → Backend service (Swagger documentation)
- `/health` → Backend service (Health checks)
- `/*` → Frontend service (React app)

## Monitoring

Check deployment status:
```bash
# Pod status
kubectl get pods -n pokedex

# Service status
kubectl get svc -n pokedex

# Ingress status
kubectl get ingress -n pokedex

# Logs
kubectl logs -f deployment/backend -n pokedex
kubectl logs -f deployment/frontend -n pokedex
```

## Scaling

Scale deployments based on load:
```bash
# Scale backend
kubectl scale deployment backend --replicas=3 -n pokedex

# Scale frontend
kubectl scale deployment frontend --replicas=3 -n pokedex
```

## Cleanup

Remove all resources:
```bash
kubectl delete namespace pokedex
```

## Production Considerations

1. **Security**:
   - Use Kubernetes secrets for sensitive data
   - Enable RBAC and network policies
   - Regular security updates

2. **High Availability**:
   - Deploy across multiple availability zones
   - Use managed database services
   - Configure pod disruption budgets

3. **Performance**:
   - Configure resource requests and limits
   - Set up horizontal pod autoscaling
   - Use persistent volumes for data

4. **Monitoring**:
   - Implement health checks and metrics
   - Set up logging aggregation
   - Configure alerting

5. **Backup**:
   - Regular database backups
   - Volume snapshots
   - Disaster recovery plan