#!/bin/bash

set -e

echo "Setting up Led VL project..."

if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

echo "Installing dependencies..."
npm install

echo "Setting up frontend..."
cd frontend
npm install
cd ..

echo "Setting up backend..."
cd backend
npm install
cd ..

echo "Setting up PostgreSQL database..."
docker-compose up -d postgres

echo "Setting up MinIO (S3)..."
docker-compose up -d minio

echo "Waiting for services to start..."
sleep 5

echo "Creating .env files..."
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "Created backend/.env - please update with your credentials"
fi

echo "Setup complete!"
echo "Next steps:"
echo "1. Update backend/.env with your database and S3 credentials"
echo "2. Run 'npm run dev' to start development servers"
echo "3. Access frontend at http://localhost:3000"
echo "4. Access backend API at http://localhost:3001"
echo "5. Access API docs at http://localhost:3001/api"

