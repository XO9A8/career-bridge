# CareerBridge Backend Setup Script (Windows)
# This script helps set up the development environment

Write-Host "🚀 CareerBridge Backend Setup" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Check if Rust is installed
if (!(Get-Command cargo -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Rust is not installed!" -ForegroundColor Red
    Write-Host "Please install Rust from: https://rustup.rs/" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Rust is installed" -ForegroundColor Green

# Check if PostgreSQL is running
if (!(Get-Command psql -ErrorAction SilentlyContinue)) {
    Write-Host "⚠️  PostgreSQL CLI not found." -ForegroundColor Yellow
    Write-Host "   Make sure PostgreSQL is installed and running." -ForegroundColor Yellow
    Write-Host "   You can use Docker instead: docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:15" -ForegroundColor Yellow
} else {
    Write-Host "✅ PostgreSQL CLI found" -ForegroundColor Green
}

# Check if .env exists
if (!(Test-Path .env)) {
    Write-Host "📝 Creating .env file from .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✅ .env file created. Please update it with your database credentials." -ForegroundColor Green
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

# Install SQLx CLI if not present
if (!(Get-Command sqlx -ErrorAction SilentlyContinue)) {
    Write-Host "📦 Installing SQLx CLI..." -ForegroundColor Yellow
    cargo install sqlx-cli --no-default-features --features postgres
    Write-Host "✅ SQLx CLI installed" -ForegroundColor Green
} else {
    Write-Host "✅ SQLx CLI already installed" -ForegroundColor Green
}

# Create database if it doesn't exist
Write-Host "🗄️  Setting up database..." -ForegroundColor Yellow
try {
    sqlx database create 2>$null
} catch {
    Write-Host "Database already exists or connection failed" -ForegroundColor Yellow
}

# Run migrations
Write-Host "🔄 Running database migrations..." -ForegroundColor Yellow
sqlx migrate run

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To start the development server, run:" -ForegroundColor Cyan
Write-Host "  cargo run" -ForegroundColor White
Write-Host ""
Write-Host "Or with hot reload:" -ForegroundColor Cyan
Write-Host "  cargo install cargo-watch" -ForegroundColor White
Write-Host "  cargo watch -x run" -ForegroundColor White
Write-Host ""
