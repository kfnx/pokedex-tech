#!/bin/bash

# Pokédex Kubernetes Deployment Script
set -e

echo "🚀 Deploying Pokédex to Kubernetes..."

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed. Please install kubectl first."
    exit 1
fi

# Check if cluster is accessible
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Cannot connect to Kubernetes cluster. Please check your kubeconfig."
    exit 1
fi

# Build Docker images (if not already built)
echo "🔧 Building Docker images..."
docker-compose build

# Apply Kubernetes manifests
echo "📦 Creating namespace..."
kubectl apply -f namespace.yaml

echo "🗄️  Deploying PostgreSQL..."
kubectl apply -f postgres.yaml

echo "🔴 Deploying Redis..."
kubectl apply -f redis.yaml

echo "⚙️  Deploying Backend..."
kubectl apply -f backend.yaml

echo "🌐 Deploying Frontend..."
kubectl apply -f frontend.yaml

echo "🌍 Setting up Ingress..."
kubectl apply -f ingress.yaml

echo "⏳ Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/postgres -n pokedex
kubectl wait --for=condition=available --timeout=300s deployment/redis -n pokedex
kubectl wait --for=condition=available --timeout=300s deployment/backend -n pokedex
kubectl wait --for=condition=available --timeout=300s deployment/frontend -n pokedex

echo "✅ Deployment complete!"
echo ""
echo "📋 Deployment Status:"
kubectl get pods -n pokedex
echo ""
echo "🔗 Services:"
kubectl get svc -n pokedex
echo ""
echo "🌐 Ingress:"
kubectl get ingress -n pokedex
echo ""
echo "💡 To access the application:"
echo "   1. Add '127.0.0.1 pokedex.local' to your /etc/hosts file"
echo "   2. Visit http://pokedex.local"
echo "   3. API docs available at http://pokedex.local/docs"
echo ""
echo "🔍 To check logs:"
echo "   Backend: kubectl logs -f deployment/backend -n pokedex"
echo "   Frontend: kubectl logs -f deployment/frontend -n pokedex"