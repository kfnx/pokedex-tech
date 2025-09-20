#!/bin/bash

# Pokédex Kubernetes Cleanup Script
set -e

echo "🧹 Cleaning up Pokédx deployment..."

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed."
    exit 1
fi

echo "🗑️  Removing ingress..."
kubectl delete -f ingress.yaml --ignore-not-found=true

echo "🌐 Removing frontend..."
kubectl delete -f frontend.yaml --ignore-not-found=true

echo "⚙️  Removing backend..."
kubectl delete -f backend.yaml --ignore-not-found=true

echo "🔴 Removing Redis..."
kubectl delete -f redis.yaml --ignore-not-found=true

echo "🗄️  Removing PostgreSQL..."
kubectl delete -f postgres.yaml --ignore-not-found=true

echo "📦 Removing namespace..."
kubectl delete -f namespace.yaml --ignore-not-found=true

echo "✅ Cleanup complete!"
echo ""
echo "💡 Note: PersistentVolume data may still exist depending on your storage class reclaim policy."