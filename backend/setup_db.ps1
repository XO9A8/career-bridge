# PowerShell script to set up CareerBridge database
# Run this from PowerShell: .\setup_db.ps1

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  CareerBridge Database Setup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Database configuration from .env
$DB_USER = "postgres"
$DB_PASSWORD = "postMEHERAJ"
$DB_HOST = "localhost"
$DB_PORT = "5433"
$DB_NAME = "database_db"

# Check if PostgreSQL is installed
Write-Host "Checking PostgreSQL installation..." -ForegroundColor Yellow

# Common PostgreSQL installation paths
$pgPaths = @(
    "C:\Program Files\PostgreSQL\16\bin",
    "C:\Program Files\PostgreSQL\15\bin",
    "C:\Program Files\PostgreSQL\14\bin",
    "C:\Program Files\PostgreSQL\13\bin",
    "C:\Program Files (x86)\PostgreSQL\16\bin",
    "C:\Program Files (x86)\PostgreSQL\15\bin",
    "C:\Program Files (x86)\PostgreSQL\14\bin"
)

$psqlPath = $null
foreach ($path in $pgPaths) {
    if (Test-Path "$path\psql.exe") {
        $psqlPath = "$path\psql.exe"
        Write-Host "[OK] Found PostgreSQL at: $path" -ForegroundColor Green
        break
    }
}

if (-not $psqlPath) {
    Write-Host "[ERROR] PostgreSQL not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install PostgreSQL from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    Write-Host "Or if PostgreSQL is installed, add it to your PATH environment variable." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Manual Setup Instructions:" -ForegroundColor Cyan
    Write-Host "1. Open pgAdmin 4 or use psql command line" -ForegroundColor White
    Write-Host "2. Run schema.sql to create tables" -ForegroundColor White
    Write-Host "3. Run seed_data.sql to populate with sample jobs" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "Setting up database: $DB_NAME" -ForegroundColor Yellow

# Set PGPASSWORD environment variable for this session
$env:PGPASSWORD = $DB_PASSWORD

try {
    # Step 1: Create database if it doesn't exist
    Write-Host ""
    Write-Host "Step 1: Creating database..." -ForegroundColor Yellow
    
    $checkDb = "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'"
    $dbExists = & $psqlPath -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -t -c $checkDb 2>$null
    
    if ($dbExists -match "1") {
        Write-Host "  Database already exists" -ForegroundColor Green
        $response = Read-Host "  Do you want to recreate it? (y/N)"
        if ($response -eq 'y' -or $response -eq 'Y') {
            Write-Host "  Dropping existing database..." -ForegroundColor Yellow
            & $psqlPath -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "DROP DATABASE $DB_NAME;" 2>$null
            Write-Host "  Creating fresh database..." -ForegroundColor Yellow
            & $psqlPath -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;" 2>$null
            Write-Host "  [OK] Database recreated" -ForegroundColor Green
        }
    } else {
        & $psqlPath -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;" 2>$null
        Write-Host "  [OK] Database created" -ForegroundColor Green
    }

    # Step 2: Run schema
    Write-Host ""
    Write-Host "Step 2: Creating tables..." -ForegroundColor Yellow
    
    if (Test-Path "schema.sql") {
        & $psqlPath -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f schema.sql 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  [OK] Tables created successfully" -ForegroundColor Green
        } else {
            Write-Host "  [WARN] Some warnings during table creation" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  [ERROR] schema.sql not found!" -ForegroundColor Red
        exit 1
    }

    # Step 3: Seed data
    Write-Host ""
    Write-Host "Step 3: Loading sample data..." -ForegroundColor Yellow
    
    if (Test-Path "seed_data.sql") {
        # First, clear existing seed data to avoid duplicates
        & $psqlPath -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "TRUNCATE jobs, learning_resources RESTART IDENTITY CASCADE;" 2>$null
        
        # Load new seed data
        & $psqlPath -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f seed_data.sql 2>$null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  [OK] Sample data loaded successfully" -ForegroundColor Green
            
            # Count jobs
            $jobCountCmd = "SELECT COUNT(*) FROM jobs;"
            $resourceCountCmd = "SELECT COUNT(*) FROM learning_resources;"
            $jobCount = & $psqlPath -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c $jobCountCmd 2>$null
            $resourceCount = & $psqlPath -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c $resourceCountCmd 2>$null
            
            Write-Host ""
            Write-Host "  Database Statistics:" -ForegroundColor Cyan
            Write-Host "     Jobs: $($jobCount.Trim())" -ForegroundColor White
            Write-Host "     Learning Resources: $($resourceCount.Trim())" -ForegroundColor White
        } else {
            Write-Host "  [ERROR] Failed to load sample data" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "  [ERROR] seed_data.sql not found!" -ForegroundColor Red
        exit 1
    }

    Write-Host ""
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "  Database Setup Complete!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Start the backend: cargo run" -ForegroundColor White
    Write-Host "2. The jobs section should now show all available positions" -ForegroundColor White
    Write-Host ""

} catch {
    Write-Host ""
    Write-Host "[ERROR] An error occurred: $_" -ForegroundColor Red
    exit 1
} finally {
    # Clear password from environment
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}
