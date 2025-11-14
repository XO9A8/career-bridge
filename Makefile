# CareerBridge Makefile
# Automates building, running, and managing the full-stack application

.PHONY: help install dev build start stop clean test lint db-setup db-migrate db-seed db-reset backend-dev frontend-dev backend-build frontend-build backend-test frontend-test backend-clean frontend-clean

# Default target
.DEFAULT_GOAL := help

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

##@ General

help: ## Display this help message
	@echo "$(BLUE)CareerBridge - Available Commands$(NC)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf "Usage:\n  make $(GREEN)<target>$(NC)\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2 } /^##@/ { printf "\n$(BLUE)%s$(NC)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Installation & Setup

install: ## Install all dependencies (backend + frontend)
	@echo "$(BLUE)Installing dependencies...$(NC)"
	@echo "$(YELLOW)Installing Rust dependencies...$(NC)"
	cd backend && cargo build
	@echo "$(YELLOW)Installing Node.js dependencies...$(NC)"
	cd frontend && npm install
	@echo "$(GREEN)✓ All dependencies installed!$(NC)"

db-setup: ## Create database and apply schema
	@echo "$(BLUE)Setting up database...$(NC)"
	@echo "$(YELLOW)Creating database...$(NC)"
	-createdb -U postgres database_db 2>/dev/null || true
	@echo "$(YELLOW)Applying schema...$(NC)"
	psql -U postgres -d database_db -f backend/schema.sql
	@echo "$(GREEN)✓ Database setup complete!$(NC)"

db-seed: ## Seed database with sample data
	@echo "$(BLUE)Seeding database...$(NC)"
	psql -U postgres -d database_db -f backend/seed_data.sql
	@echo "$(GREEN)✓ Database seeded!$(NC)"

db-migrate: ## Run database migrations (if any)
	@echo "$(BLUE)Running migrations...$(NC)"
	cd backend && sqlx migrate run
	@echo "$(GREEN)✓ Migrations complete!$(NC)"

db-reset: db-setup db-seed ## Reset database (drop, create, schema, seed)
	@echo "$(GREEN)✓ Database reset complete!$(NC)"

##@ Development

dev: ## Start both backend and frontend in development mode (parallel)
	@echo "$(BLUE)Starting development servers...$(NC)"
	@echo "$(YELLOW)Backend: http://127.0.0.1:3000$(NC)"
	@echo "$(YELLOW)Frontend: http://localhost:3001$(NC)"
	@$(MAKE) -j2 backend-dev frontend-dev

backend-dev: ## Start backend development server
	@echo "$(BLUE)Starting backend server...$(NC)"
	cd backend && cargo run

frontend-dev: ## Start frontend development server
	@echo "$(BLUE)Starting frontend server...$(NC)"
	cd frontend && npm run dev

##@ Building

build: backend-build frontend-build ## Build both backend and frontend for production

backend-build: ## Build backend for production
	@echo "$(BLUE)Building backend...$(NC)"
	cd backend && cargo build --release
	@echo "$(GREEN)✓ Backend built: backend/target/release/backend$(NC)"

frontend-build: ## Build frontend for production
	@echo "$(BLUE)Building frontend...$(NC)"
	cd frontend && npm run build
	@echo "$(GREEN)✓ Frontend built: frontend/.next$(NC)"

##@ Running Production

start: ## Start both backend and frontend in production mode (requires build first)
	@echo "$(BLUE)Starting production servers...$(NC)"
	@$(MAKE) -j2 backend-start frontend-start

backend-start: ## Start backend in production mode
	@echo "$(BLUE)Starting backend production server...$(NC)"
	cd backend && ./target/release/backend

frontend-start: ## Start frontend in production mode
	@echo "$(BLUE)Starting frontend production server...$(NC)"
	cd frontend && npm start

##@ Testing

test: backend-test ## Run all tests

backend-test: ## Run backend tests
	@echo "$(BLUE)Running backend tests...$(NC)"
	cd backend && cargo test
	@echo "$(GREEN)✓ Backend tests complete!$(NC)"

frontend-test: ## Run frontend tests (if configured)
	@echo "$(BLUE)Running frontend tests...$(NC)"
	cd frontend && npm test || true
	@echo "$(GREEN)✓ Frontend tests complete!$(NC)"

##@ Code Quality

lint: backend-lint frontend-lint ## Run linters for both projects

backend-lint: ## Run Rust linter (clippy)
	@echo "$(BLUE)Running Rust linter...$(NC)"
	cd backend && cargo clippy -- -D warnings
	@echo "$(GREEN)✓ Backend lint complete!$(NC)"

frontend-lint: ## Run frontend linter (ESLint)
	@echo "$(BLUE)Running frontend linter...$(NC)"
	cd frontend && npm run lint
	@echo "$(GREEN)✓ Frontend lint complete!$(NC)"

format: backend-format frontend-format ## Format code for both projects

backend-format: ## Format Rust code
	@echo "$(BLUE)Formatting Rust code...$(NC)"
	cd backend && cargo fmt
	@echo "$(GREEN)✓ Backend formatted!$(NC)"

frontend-format: ## Format frontend code (if prettier configured)
	@echo "$(BLUE)Formatting frontend code...$(NC)"
	cd frontend && npx prettier --write "src/**/*.{ts,tsx,js,jsx,json,css}" || true
	@echo "$(GREEN)✓ Frontend formatted!$(NC)"

##@ Cleaning

clean: backend-clean frontend-clean ## Clean all build artifacts

backend-clean: ## Clean backend build artifacts
	@echo "$(BLUE)Cleaning backend...$(NC)"
	cd backend && cargo clean
	@echo "$(GREEN)✓ Backend cleaned!$(NC)"

frontend-clean: ## Clean frontend build artifacts
	@echo "$(BLUE)Cleaning frontend...$(NC)"
	cd frontend && rm -rf .next node_modules/.cache
	@echo "$(GREEN)✓ Frontend cleaned!$(NC)"

deep-clean: clean ## Deep clean (including node_modules)
	@echo "$(BLUE)Deep cleaning...$(NC)"
	cd frontend && rm -rf node_modules
	@echo "$(GREEN)✓ Deep clean complete!$(NC)"

##@ Logs & Monitoring

logs-backend: ## Show backend logs (tail)
	@echo "$(BLUE)Showing backend logs...$(NC)"
	tail -f backend/logs/*.log 2>/dev/null || echo "No log files found"

logs-frontend: ## Show frontend logs (tail)
	@echo "$(BLUE)Showing frontend logs...$(NC)"
	tail -f frontend/.next/*.log 2>/dev/null || echo "No log files found"

##@ Database Management

db-console: ## Open PostgreSQL console
	@echo "$(BLUE)Opening database console...$(NC)"
	psql -U postgres -d database_db

db-backup: ## Backup database
	@echo "$(BLUE)Backing up database...$(NC)"
	pg_dump -U postgres database_db > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✓ Database backed up!$(NC)"

db-restore: ## Restore database from backup (set BACKUP_FILE=filename.sql)
	@echo "$(BLUE)Restoring database from $(BACKUP_FILE)...$(NC)"
	psql -U postgres -d database_db < $(BACKUP_FILE)
	@echo "$(GREEN)✓ Database restored!$(NC)"

##@ Docker (Optional)

docker-build: ## Build Docker images (if Dockerfiles exist)
	@echo "$(BLUE)Building Docker images...$(NC)"
	docker-compose build || echo "Docker Compose not configured"

docker-up: ## Start services with Docker Compose
	@echo "$(BLUE)Starting Docker containers...$(NC)"
	docker-compose up -d || echo "Docker Compose not configured"

docker-down: ## Stop Docker containers
	@echo "$(BLUE)Stopping Docker containers...$(NC)"
	docker-compose down || echo "Docker Compose not configured"

docker-logs: ## Show Docker logs
	@echo "$(BLUE)Showing Docker logs...$(NC)"
	docker-compose logs -f || echo "Docker Compose not configured"

##@ Utility

check: ## Check project health (dependencies, build status)
	@echo "$(BLUE)Checking project health...$(NC)"
	@echo "$(YELLOW)Checking Rust...$(NC)"
	@rustc --version || echo "$(RED)Rust not installed$(NC)"
	@cargo --version || echo "$(RED)Cargo not installed$(NC)"
	@echo "$(YELLOW)Checking Node.js...$(NC)"
	@node --version || echo "$(RED)Node.js not installed$(NC)"
	@npm --version || echo "$(RED)npm not installed$(NC)"
	@echo "$(YELLOW)Checking PostgreSQL...$(NC)"
	@psql --version || echo "$(RED)PostgreSQL not installed$(NC)"
	@echo "$(GREEN)✓ Health check complete!$(NC)"

env-example: ## Create example .env files
	@echo "$(BLUE)Creating example .env files...$(NC)"
	@echo "DATABASE_URL=postgresql://postgres:password@localhost:5432/database_db" > backend/.env.example
	@echo "JWT_SECRET=your-secret-key-change-in-production" >> backend/.env.example
	@echo "FRONTEND_URL=http://localhost:3001" >> backend/.env.example
	@echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > frontend/.env.example
	@echo "$(GREEN)✓ Example .env files created!$(NC)"

quickstart: install db-setup db-seed ## Quick start setup (install + db setup + seed)
	@echo "$(GREEN)✓ Quick start complete! Run 'make dev' to start development servers.$(NC)"

##@ Documentation

docs: ## Generate documentation
	@echo "$(BLUE)Generating documentation...$(NC)"
	cd backend && cargo doc --open --no-deps
	@echo "$(GREEN)✓ Documentation generated!$(NC)"

api-docs: ## Open API documentation
	@echo "$(BLUE)Opening API documentation...$(NC)"
	@echo "See backend/README.md for API endpoints"
	@echo "Use backend/api_tests.http for interactive API testing"
