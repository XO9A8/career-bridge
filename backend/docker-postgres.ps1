# PostgreSQL Docker Setup Script for CareerBridge (Windows)

Write-Host "🐳 Setting up PostgreSQL with Docker..." -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Stop and remove existing container if it exists
Write-Host "🧹 Cleaning up any existing containers..." -ForegroundColor Yellow
docker stop career-bridge-postgres 2>$null
docker rm career-bridge-postgres 2>$null

Write-Host "📦 Creating PostgreSQL container..." -ForegroundColor Yellow
docker run -d `
  --name career-bridge-postgres `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=career_bridge `
  -p 5432:5432 `
  postgres:15

Write-Host ""
Write-Host "⏳ Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check if container is running
$containerRunning = docker ps | Select-String "career-bridge-postgres"
if ($containerRunning) {
    Write-Host ""
    Write-Host "✅ PostgreSQL is running!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Connection Details:" -ForegroundColor Cyan
    Write-Host "   Host: localhost" -ForegroundColor White
    Write-Host "   Port: 5432" -ForegroundColor White
    Write-Host "   Database: career_bridge" -ForegroundColor White
    Write-Host "   Username: postgres" -ForegroundColor White
    Write-Host "   Password: postgres" -ForegroundColor White
    Write-Host ""
    Write-Host "🔗 Connection String:" -ForegroundColor Cyan
    Write-Host "   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/career_bridge" -ForegroundColor White
    Write-Host ""
    Write-Host "🛠️  Useful Commands:" -ForegroundColor Cyan
    Write-Host "   Stop database:    docker stop career-bridge-postgres" -ForegroundColor White
    Write-Host "   Start database:   docker start career-bridge-postgres" -ForegroundColor White
    Write-Host "   View logs:        docker logs career-bridge-postgres" -ForegroundColor White
    Write-Host "   Remove database:  docker rm -f career-bridge-postgres" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "❌ Failed to start PostgreSQL container" -ForegroundColor Red
    Write-Host "Check Docker logs with: docker logs career-bridge-postgres" -ForegroundColor Yellow
    exit 1
}
