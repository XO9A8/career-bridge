# CareerBridge Build & Run Automation Script
# PowerShell version for Windows

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

$ErrorActionPreference = "Continue"

# Colors
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Blue($message) { Write-ColorOutput Blue $message }
function Write-Green($message) { Write-ColorOutput Green $message }
function Write-Yellow($message) { Write-ColorOutput Yellow $message }
function Write-Red($message) { Write-ColorOutput Red $message }

# Help Command
function Show-Help {
    Write-Blue "`nCareerBridge - Available Commands`n"
    Write-Output "Usage: .\make.ps1 <command>`n"
    
    Write-Blue "Installation & Setup:"
    Write-Output "  install          - Install all dependencies (backend + frontend)"
    Write-Output "  db-setup         - Create database and apply schema"
    Write-Output "  db-seed          - Seed database with sample data"
    Write-Output "  db-reset         - Reset database (drop, create, schema, seed)"
    Write-Output "  quickstart       - Quick start (install + db setup + seed)`n"
    
    Write-Blue "Development:"
    Write-Output "  dev              - Start both backend and frontend"
    Write-Output "  backend-dev      - Start backend development server"
    Write-Output "  frontend-dev     - Start frontend development server`n"
    
    Write-Blue "Building:"
    Write-Output "  build            - Build both backend and frontend for production"
    Write-Output "  backend-build    - Build backend for production"
    Write-Output "  frontend-build   - Build frontend for production`n"
    
    Write-Blue "Testing:"
    Write-Output "  test             - Run all tests"
    Write-Output "  backend-test     - Run backend tests"
    Write-Output "  lint             - Run linters for both projects`n"
    
    Write-Blue "Cleaning:"
    Write-Output "  clean            - Clean all build artifacts"
    Write-Output "  backend-clean    - Clean backend build artifacts"
    Write-Output "  frontend-clean   - Clean frontend build artifacts"
    Write-Output "  deep-clean       - Deep clean (including node_modules)`n"
    
    Write-Blue "Database:"
    Write-Output "  db-console       - Open PostgreSQL console"
    Write-Output "  db-backup        - Backup database"
    Write-Output "  db-restore       - Restore database from backup`n"
    
    Write-Blue "Utility:"
    Write-Output "  check            - Check project health"
    Write-Output "  env-example      - Create example .env files"
    Write-Output "  docs             - Generate Rust documentation`n"
}

# Installation Commands
function Install-Dependencies {
    Write-Blue "Installing dependencies..."
    
    Write-Yellow "Installing Rust dependencies..."
    Set-Location backend
    cargo build
    Set-Location ..
    
    Write-Yellow "Installing Node.js dependencies..."
    Set-Location frontend
    npm install
    Set-Location ..
    
    Write-Green "✓ All dependencies installed!"
}

function Setup-Database {
    Write-Blue "Setting up database..."
    
    Write-Yellow "Creating database..."
    createdb -U postgres database_db 2>$null
    
    Write-Yellow "Applying schema..."
    psql -U postgres -d database_db -f backend/schema.sql
    
    Write-Green "✓ Database setup complete!"
}

function Seed-Database {
    Write-Blue "Seeding database..."
    psql -U postgres -d database_db -f backend/seed_data.sql
    Write-Green "✓ Database seeded!"
}

function Reset-Database {
    Setup-Database
    Seed-Database
    Write-Green "✓ Database reset complete!"
}

# Development Commands
function Start-Dev {
    Write-Blue "Starting development servers..."
    Write-Yellow "Backend: http://127.0.0.1:3000"
    Write-Yellow "Frontend: http://localhost:3001"
    Write-Yellow "`nPress Ctrl+C to stop both servers`n"
    
    # Start backend in background
    $backendJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD/backend
        cargo run
    }
    
    # Start frontend in background
    $frontendJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD/frontend
        npm run dev
    }
    
    # Wait for both jobs and show output
    try {
        while ($true) {
            Receive-Job -Job $backendJob
            Receive-Job -Job $frontendJob
            Start-Sleep -Milliseconds 100
        }
    }
    finally {
        Write-Yellow "`nStopping servers..."
        Stop-Job -Job $backendJob, $frontendJob
        Remove-Job -Job $backendJob, $frontendJob
    }
}

function Start-BackendDev {
    Write-Blue "Starting backend server..."
    Set-Location backend
    cargo run
    Set-Location ..
}

function Start-FrontendDev {
    Write-Blue "Starting frontend server..."
    Set-Location frontend
    npm run dev
    Set-Location ..
}

# Build Commands
function Build-All {
    Build-Backend
    Build-Frontend
}

function Build-Backend {
    Write-Blue "Building backend..."
    Set-Location backend
    cargo build --release
    Set-Location ..
    Write-Green "✓ Backend built: backend/target/release/backend.exe"
}

function Build-Frontend {
    Write-Blue "Building frontend..."
    Set-Location frontend
    npm run build
    Set-Location ..
    Write-Green "✓ Frontend built: frontend/.next"
}

# Testing Commands
function Test-All {
    Test-Backend
}

function Test-Backend {
    Write-Blue "Running backend tests..."
    Set-Location backend
    cargo test
    Set-Location ..
    Write-Green "✓ Backend tests complete!"
}

function Lint-All {
    Lint-Backend
    Lint-Frontend
}

function Lint-Backend {
    Write-Blue "Running Rust linter..."
    Set-Location backend
    cargo clippy -- -D warnings
    Set-Location ..
    Write-Green "✓ Backend lint complete!"
}

function Lint-Frontend {
    Write-Blue "Running frontend linter..."
    Set-Location frontend
    npm run lint
    Set-Location ..
    Write-Green "✓ Frontend lint complete!"
}

# Cleaning Commands
function Clean-All {
    Clean-Backend
    Clean-Frontend
}

function Clean-Backend {
    Write-Blue "Cleaning backend..."
    Set-Location backend
    cargo clean
    Set-Location ..
    Write-Green "✓ Backend cleaned!"
}

function Clean-Frontend {
    Write-Blue "Cleaning frontend..."
    Set-Location frontend
    if (Test-Path ".next") { Remove-Item -Recurse -Force .next }
    if (Test-Path "node_modules/.cache") { Remove-Item -Recurse -Force node_modules/.cache }
    Set-Location ..
    Write-Green "✓ Frontend cleaned!"
}

function Deep-Clean {
    Clean-All
    Write-Blue "Deep cleaning..."
    Set-Location frontend
    if (Test-Path "node_modules") { Remove-Item -Recurse -Force node_modules }
    Set-Location ..
    Write-Green "✓ Deep clean complete!"
}

# Database Commands
function Open-DbConsole {
    Write-Blue "Opening database console..."
    psql -U postgres -d database_db
}

function Backup-Database {
    Write-Blue "Backing up database..."
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    pg_dump -U postgres database_db > "backup_$timestamp.sql"
    Write-Green "✓ Database backed up to backup_$timestamp.sql"
}

function Restore-Database {
    param([string]$BackupFile)
    if (-not $BackupFile) {
        Write-Red "Error: Please specify backup file with -BackupFile parameter"
        return
    }
    Write-Blue "Restoring database from $BackupFile..."
    psql -U postgres -d database_db -f $BackupFile
    Write-Green "✓ Database restored!"
}

# Utility Commands
function Check-ProjectHealth {
    Write-Blue "Checking project health...`n"
    
    Write-Yellow "Checking Rust..."
    if (Get-Command rustc -ErrorAction SilentlyContinue) {
        rustc --version
        cargo --version
    } else {
        Write-Red "Rust not installed"
    }
    
    Write-Yellow "`nChecking Node.js..."
    if (Get-Command node -ErrorAction SilentlyContinue) {
        node --version
        npm --version
    } else {
        Write-Red "Node.js not installed"
    }
    
    Write-Yellow "`nChecking PostgreSQL..."
    if (Get-Command psql -ErrorAction SilentlyContinue) {
        psql --version
    } else {
        Write-Red "PostgreSQL not installed"
    }
    
    Write-Green "`n✓ Health check complete!"
}

function Create-EnvExamples {
    Write-Blue "Creating example .env files..."
    
    @"
DATABASE_URL=postgresql://postgres:password@localhost:5432/database_db
JWT_SECRET=your-secret-key-change-in-production
FRONTEND_URL=http://localhost:3001
GOOGLE_REDIRECT_URI=http://127.0.0.1:3000/api/auth/google/callback
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_REDIRECT_URI=http://127.0.0.1:3000/api/auth/github/callback
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
"@ | Out-File -FilePath "backend/.env.example" -Encoding UTF8
    
    @"
NEXT_PUBLIC_API_URL=http://localhost:3000
"@ | Out-File -FilePath "frontend/.env.example" -Encoding UTF8
    
    Write-Green "✓ Example .env files created!"
}

function Quick-Start {
    Install-Dependencies
    Setup-Database
    Seed-Database
    Write-Green "`n✓ Quick start complete! Run '.\make.ps1 dev' to start development servers."
}

function Generate-Docs {
    Write-Blue "Generating documentation..."
    Set-Location backend
    cargo doc --open --no-deps
    Set-Location ..
    Write-Green "✓ Documentation generated!"
}

# Main Command Router
switch ($Command.ToLower()) {
    "help" { Show-Help }
    "install" { Install-Dependencies }
    "db-setup" { Setup-Database }
    "db-seed" { Seed-Database }
    "db-reset" { Reset-Database }
    "dev" { Start-Dev }
    "backend-dev" { Start-BackendDev }
    "frontend-dev" { Start-FrontendDev }
    "build" { Build-All }
    "backend-build" { Build-Backend }
    "frontend-build" { Build-Frontend }
    "test" { Test-All }
    "backend-test" { Test-Backend }
    "lint" { Lint-All }
    "backend-lint" { Lint-Backend }
    "frontend-lint" { Lint-Frontend }
    "clean" { Clean-All }
    "backend-clean" { Clean-Backend }
    "frontend-clean" { Clean-Frontend }
    "deep-clean" { Deep-Clean }
    "db-console" { Open-DbConsole }
    "db-backup" { Backup-Database }
    "db-restore" { Restore-Database }
    "check" { Check-ProjectHealth }
    "env-example" { Create-EnvExamples }
    "quickstart" { Quick-Start }
    "docs" { Generate-Docs }
    default {
        Write-Red "Unknown command: $Command"
        Write-Output ""
        Show-Help
    }
}
