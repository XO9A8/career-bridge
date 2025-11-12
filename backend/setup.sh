#!/bin/bash

# CareerBridge Backend Setup Script
# This script helps set up the development environment

set -e

echo "🚀 CareerBridge Backend Setup"
echo "=============================="
echo ""

# Check if Rust is installed
if ! command -v cargo &> /dev/null; then
    echo "❌ Rust is not installed!"
    echo "Please install Rust from: https://rustup.rs/"
    exit 1
fi
echo "✅ Rust is installed"

# Check if PostgreSQL is running
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL CLI not found. Make sure PostgreSQL is installed and running."
    echo "   You can use Docker instead: docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:15"
else
    echo "✅ PostgreSQL CLI found"
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created. Please update it with your database credentials."
else
    echo "✅ .env file already exists"
fi

# Install SQLx CLI if not present
if ! command -v sqlx &> /dev/null; then
    echo "📦 Installing SQLx CLI..."
    cargo install sqlx-cli --no-default-features --features postgres
    echo "✅ SQLx CLI installed"
else
    echo "✅ SQLx CLI already installed"
fi

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Create database if it doesn't exist
echo "🗄️  Setting up database..."
sqlx database create 2>/dev/null || echo "Database already exists or connection failed"

# Run migrations
echo "🔄 Running database migrations..."
sqlx migrate run

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the development server, run:"
echo "  cargo run"
echo ""
echo "Or with hot reload:"
echo "  cargo install cargo-watch"
echo "  cargo watch -x run"
echo ""
