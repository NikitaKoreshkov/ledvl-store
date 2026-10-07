#!/bin/bash

set -e

echo "Building Led VL project..."

echo "Building frontend..."
cd frontend
npm run build
cd ..

echo "Building backend..."
cd backend
npm run build
cd ..

echo "Build complete!"
echo "To deploy:"
echo "1. Set up your production environment variables"
echo "2. Run database migrations"
echo "3. Start services with PM2 or Docker Compose"

