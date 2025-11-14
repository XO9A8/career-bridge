#!/bin/bash

# Bash script to set up CareerBridge database
# Run this from Git Bash or WSL: ./setup_db.sh

echo "================================================"
echo "  CareerBridge Database Setup"
echo "================================================"
echo ""

# Database configuration from .env
DB_USER="postgres"
DB_PASSWORD="postMEHERAJ"
DB_HOST="localhost"
DB_PORT="5433"
DB_NAME="database_db"

# Export password for psql
export PGPASSWORD=$DB_PASSWORD

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "✗ PostgreSQL client (psql) not found!"
    echo ""
    echo "Please install PostgreSQL client:"
    echo "  - Windows: https://www.postgresql.org/download/windows/"
    echo "  - Ubuntu/Debian: sudo apt-get install postgresql-client"
    echo "  - macOS: brew install postgresql"
    echo ""
    echo "Or add PostgreSQL bin directory to your PATH."
    exit 1
fi

echo "✓ Found PostgreSQL client"
echo ""
echo "Setting up database: $DB_NAME"

# Step 1: Check if database exists
echo ""
echo "Step 1: Checking database..."

DB_EXISTS=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" 2>/dev/null)

if [ "$DB_EXISTS" = "1" ]; then
    echo "  Database '$DB_NAME' already exists"
    read -p "  Do you want to recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "  Dropping existing database..."
        psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "DROP DATABASE $DB_NAME;" 2>/dev/null
        echo "  Creating fresh database..."
        psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null
        echo "  ✓ Database recreated"
    fi
else
    echo "  Creating database..."
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null
    echo "  ✓ Database created"
fi

# Step 2: Run schema
echo ""
echo "Step 2: Creating tables..."

if [ -f "schema.sql" ]; then
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f schema.sql 2>/dev/null
    echo "  ✓ Tables created successfully"
else
    echo "  ✗ schema.sql not found!"
    exit 1
fi

# Step 3: Seed data
echo ""
echo "Step 3: Loading sample data..."

if [ -f "seed_data.sql" ]; then
    # Clear existing seed data to avoid duplicates
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "TRUNCATE jobs, learning_resources RESTART IDENTITY CASCADE;" 2>/dev/null
    
    # Load new seed data
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f seed_data.sql 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "  ✓ Sample data loaded successfully"
        
        # Count jobs
        JOB_COUNT=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -tAc "SELECT COUNT(*) FROM jobs;" 2>/dev/null)
        RESOURCE_COUNT=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -tAc "SELECT COUNT(*) FROM learning_resources;" 2>/dev/null)
        
        echo ""
        echo "  📊 Database Statistics:"
        echo "     Jobs: $JOB_COUNT"
        echo "     Learning Resources: $RESOURCE_COUNT"
    else
        echo "  ✗ Failed to load sample data"
        exit 1
    fi
else
    echo "  ✗ seed_data.sql not found!"
    exit 1
fi

echo ""
echo "================================================"
echo "  ✓ Database Setup Complete!"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Start the backend: cargo run"
echo "2. The jobs section should now show all available positions"
echo ""

# Clean up
unset PGPASSWORD
