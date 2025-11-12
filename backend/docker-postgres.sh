#!/bin/bash
# PostgreSQL Docker Setup Script for CareerBridge

echo "🐳 Setting up PostgreSQL with Docker..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running!"
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Stop and remove existing container if it exists
echo "🧹 Cleaning up any existing containers..."
docker stop career-bridge-postgres 2>/dev/null || true
docker rm career-bridge-postgres 2>/dev/null || true

echo "📦 Creating PostgreSQL container..."
docker run -d \
  --name career-bridge-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=career_bridge \
  -p 5432:5432 \
  postgres:15

echo ""
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Check if container is running
if docker ps | grep -q career-bridge-postgres; then
    echo ""
    echo "✅ PostgreSQL is running!"
    echo ""
    echo "📝 Connection Details:"
    echo "   Host: localhost"
    echo "   Port: 5432"
    echo "   Database: career_bridge"
    echo "   Username: postgres"
    echo "   Password: postgres"
    echo ""
    echo "🔗 Connection String:"
    echo "   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/career_bridge"
    echo ""
    echo "🛠️  Useful Commands:"
    echo "   Stop database:    docker stop career-bridge-postgres"
    echo "   Start database:   docker start career-bridge-postgres"
    echo "   View logs:        docker logs career-bridge-postgres"
    echo "   Remove database:  docker rm -f career-bridge-postgres"
    echo ""
else
    echo "❌ Failed to start PostgreSQL container"
    echo "Check Docker logs with: docker logs career-bridge-postgres"
    exit 1
fi
