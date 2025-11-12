# CareerBridge Backend

Rust backend API for CareerBridge - an AI-powered career roadmap platform built with Axum and SQLx.

## Tech Stack

- **Framework**: Axum 0.7 (async web framework)
- **Database**: PostgreSQL with SQLx (compile-time checked queries)
- **Authentication**: JWT with bcrypt password hashing
- **Runtime**: Tokio (async runtime)
- **Serialization**: Serde

## Features

- ✅ User authentication (register/login with JWT)
- ✅ User profile management
- ✅ Skills catalog and user skill tracking
- ✅ Job listings with filtering and search
- ✅ Skill-based job recommendations
- ✅ Learning resources with filtering
- ✅ Personalized resource recommendations
- ✅ Compile-time SQL query validation with SQLx
- ✅ CORS enabled for frontend integration
- ✅ Comprehensive error handling

## Prerequisites

- Rust 1.70+ (install from [rustup.rs](https://rustup.rs/))
- PostgreSQL 14+ (or Docker)
- SQLx CLI (for migrations)

## Installation

### 1. Install SQLx CLI

```bash
cargo install sqlx-cli --no-default-features --features postgres
```

### 2. Set up PostgreSQL

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL on your system
# Create a database
psql -U postgres
CREATE DATABASE career_bridge;
\q
```

**Option B: Docker**
```bash
docker run --name career-bridge-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=career_bridge \
  -p 5432:5432 \
  -d postgres:15
```

### 3. Configure Environment

```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your database credentials
# Make sure DATABASE_URL matches your PostgreSQL setup
```

### 4. Run Migrations

```bash
# Run all migrations to set up the database schema
sqlx migrate run
```

### 5. Build and Run

```bash
# Development mode (with hot reload using cargo-watch)
cargo install cargo-watch
cargo watch -x run

# Or just run normally
cargo run

# Production build
cargo build --release
./target/release/career_bridge_backend
```

The server will start at `http://127.0.0.1:8000`

## Database Schema

### Tables

- **users**: User accounts and profiles
- **skills**: Skills catalog
- **user_skills**: User skill proficiency levels
- **jobs**: Job listings
- **job_skills**: Required skills for jobs
- **learning_resources**: Educational resources

## API Endpoints

### Authentication (Public)

```
POST /api/auth/register    - Register new user
POST /api/auth/login       - Login user
```

### Profile (Protected)

```
GET  /api/profile          - Get current user profile
POST /api/profile          - Update user profile
```

### Skills

```
GET  /api/skills           - Get all skills (public)
POST /api/skills           - Create new skill (public)
GET  /api/skills/me        - Get user's skills (protected)
POST /api/skills/me        - Add skill to user (protected)
DELETE /api/skills/me/:id  - Remove user skill (protected)
```

### Jobs

```
GET  /api/jobs                    - Get jobs with filters (public)
GET  /api/jobs/:id                - Get job by ID (public)
POST /api/jobs                    - Create job (public)
GET  /api/jobs/recommended        - Get recommended jobs (protected)
```

**Query Parameters for GET /api/jobs**:
- `search`: Search in title/company
- `location`: Filter by location
- `job_type`: full-time, part-time, contract, internship, remote
- `experience_level`: entry, junior, mid, senior, lead
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 50)

### Learning Resources

```
GET  /api/resources                    - Get resources with filters (public)
GET  /api/resources/:id                - Get resource by ID (public)
POST /api/resources                    - Create resource (public)
GET  /api/resources/recommended        - Get recommended resources (protected)
```

**Query Parameters for GET /api/resources**:
- `search`: Search in title/description
- `skill_id`: Filter by skill UUID
- `resource_type`: course, tutorial, article, video, book, documentation
- `difficulty_level`: beginner, intermediate, advanced
- `cost`: free, paid
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 50)

## Example API Usage

### Register a new user

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123",
    "full_name": "John Doe"
  }'
```

### Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get Profile (with JWT token)

```bash
curl http://localhost:8000/api/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Jobs with Filters

```bash
curl "http://localhost:8000/api/jobs?job_type=full-time&experience_level=mid&page=1&limit=10"
```

## Development

### Adding New Migrations

```bash
# Create a new migration
sqlx migrate add migration_name

# Edit the generated .sql file in migrations/
# Then run:
sqlx migrate run
```

### Database Cleanup

```bash
# Revert last migration
sqlx migrate revert

# Drop all tables and rerun migrations
sqlx database drop
sqlx database create
sqlx migrate run
```

### Code Organization

```
src/
├── main.rs           # Application entry point
├── config/           # Configuration management
├── db/               # Database connection pool
├── handlers/         # Request handlers (business logic)
├── middleware/       # Authentication middleware
├── models/           # Data models and DTOs
├── routes/           # Route definitions
└── utils/            # Utilities (JWT, errors)
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `HOST` | Server host | 127.0.0.1 |
| `PORT` | Server port | 8000 |
| `JWT_SECRET` | Secret key for JWT signing | Required |
| `JWT_EXPIRATION` | JWT expiration in seconds | 86400 (24h) |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:5173 |
| `RUST_LOG` | Log level | debug |
| `ENVIRONMENT` | Environment (development/production) | development |

## Testing

```bash
# Run tests
cargo test

# Run tests with output
cargo test -- --nocapture
```

## Production Deployment

1. Set environment variables properly
2. Change `JWT_SECRET` to a strong random value
3. Set `ENVIRONMENT=production`
4. Build with `cargo build --release`
5. Run migrations on production database
6. Deploy the binary from `target/release/`

## SQLx Compile-Time Verification

SQLx validates SQL queries at compile time. To prepare for offline builds:

```bash
# Generate sqlx-data.json for offline compilation
cargo sqlx prepare
```

## Troubleshooting

**Migration errors**: Ensure PostgreSQL is running and DATABASE_URL is correct
**Compile errors**: Run `cargo clean` and rebuild
**Connection refused**: Check if PostgreSQL is running on the correct port

## License

This project is part of the CareerBridge hackathon submission.
