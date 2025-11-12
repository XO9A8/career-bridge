# CareerBridge Database Schema# CareerBridge Backend



PostgreSQL database setup and schema design for the CareerBridge platform - supporting SDG 8 (Decent Work and Economic Growth).Rust backend API for CareerBridge - an AI-powered career roadmap platform built with Axum and SQLx.



## 🎯 Role: Database & DevOps## Tech Stack



This repository contains the **database foundation** for CareerBridge. The backend API implementation (Axum, handlers, routes, authentication) is handled by the Backend Developer.- **Framework**: Axum 0.7 (async web framework)

- **Database**: PostgreSQL with SQLx (compile-time checked queries)

## Tech Stack- **Authentication**: JWT with bcrypt password hashing

- **Runtime**: Tokio (async runtime)

- **Database**: PostgreSQL 15+- **Serialization**: Serde

- **Query Builder**: SQLx (compile-time checked queries)

- **Migration Tool**: SQLx CLI## Features

- **DevOps**: Docker, PostgreSQL

- ✅ User authentication (register/login with JWT)

## Database Schema- ✅ User profile management

- ✅ Skills catalog and user skill tracking

### Core Tables (7 tables)- ✅ Job listings with filtering and search

- ✅ Skill-based job recommendations

1. **users** - User accounts and authentication- ✅ Learning resources with filtering

   - Stores user credentials, profile information- ✅ Personalized resource recommendations

   - Fields: id, email, password_hash, full_name, bio, location, etc.- ✅ Compile-time SQL query validation with SQLx

- ✅ CORS enabled for frontend integration

2. **skills** - Master catalog of skills- ✅ Comprehensive error handling

   - All available skills in the platform

   - Fields: id, name, category, description, created_at## Prerequisites



3. **user_skills** - User skill proficiency (Many-to-Many)- Rust 1.70+ (install from [rustup.rs](https://rustup.rs/))

   - Links users to their skills with proficiency levels- PostgreSQL 14+ (or Docker)

   - Fields: id, user_id, skill_id, proficiency_level, years_of_experience- SQLx CLI (for migrations)



4. **jobs** - Job postings## Installation

   - Job listings with requirements

   - Fields: id, title, company, description, location, job_type, experience_level, salary_range### 1. Install SQLx CLI



5. **job_skills** - Required skills per job (Many-to-Many)```bash

   - Links jobs to required skillscargo install sqlx-cli --no-default-features --features postgres

   - Fields: id, job_id, skill_id, required_proficiency, is_required```



6. **learning_resources** - Educational content### 2. Set up PostgreSQL

   - Learning materials and courses

   - Fields: id, title, description, url, resource_type, difficulty_level, cost, provider**Option A: Local PostgreSQL**

```bash

7. **learning_resource_skills** - Skills covered by resources (Many-to-Many)# Install PostgreSQL on your system

   - Links resources to skills they teach# Create a database

   - Fields: id, resource_id, skill_idpsql -U postgres

CREATE DATABASE career_bridge;

### Key Features\q

```

- ✅ Proper foreign key relationships for data integrity

- ✅ Indexes on frequently queried columns**Option B: Docker**

- ✅ UUID primary keys for security```bash

- ✅ Timestamps for audit trailsdocker run --name career-bridge-postgres \

- ✅ Enum-like constraints for standardized values  -e POSTGRES_PASSWORD=postgres \

- ✅ Normalized schema (3NF)  -e POSTGRES_DB=career_bridge \

- ✅ Ready for AI integration (Part 2 of project)  -p 5432:5432 \

- ✅ Optimized for HashSet-based skill matching algorithm  -d postgres:15

```

## Prerequisites

### 3. Configure Environment

- PostgreSQL 14+ (or Docker)

- SQLx CLI for migrations```bash

# Copy the example env file

## Installationcp .env.example .env



### 1. Install SQLx CLI# Edit .env with your database credentials

# Make sure DATABASE_URL matches your PostgreSQL setup

```bash```

cargo install sqlx-cli --no-default-features --features postgres

```### 4. Run Migrations



### 2. Set up PostgreSQL```bash

# Run all migrations to set up the database schema

**Option A: Docker (Recommended for Development)**sqlx migrate run

```

```bash

# Using the provided script### 5. Build and Run

chmod +x docker-postgres.sh

./docker-postgres.sh```bash

# Development mode (with hot reload using cargo-watch)

# Or manuallycargo install cargo-watch

docker run --name career-bridge-postgres \cargo watch -x run

  -e POSTGRES_PASSWORD=postgres \

  -e POSTGRES_DB=career_bridge \# Or just run normally

  -p 5432:5432 \cargo run

  -d postgres:15

```# Production build

cargo build --release

**Option B: Native PostgreSQL Installation**./target/release/career_bridge_backend

```

See [POSTGRESQL_SETUP.md](./POSTGRESQL_SETUP.md) for detailed instructions.

The server will start at `http://127.0.0.1:8000`

### 3. Configure Environment

## Database Schema

```bash

# Copy the example env file### Tables

cp .env.example .env

- **users**: User accounts and profiles

# The .env should contain:- **skills**: Skills catalog

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/career_bridge- **user_skills**: User skill proficiency levels

```- **jobs**: Job listings

- **job_skills**: Required skills for jobs

### 4. Run Migrations- **learning_resources**: Educational resources



```bash## API Endpoints

# Navigate to backend directory

cd backend### Authentication (Public)



# Run all migrations to create tables```

sqlx migrate runPOST /api/auth/register    - Register new user

```POST /api/auth/login       - Login user

```

This will execute:

1. Create the `users` table### Profile (Protected)

2. Create the `skills` table

3. Create the `user_skills` table (with foreign keys)```

4. Create the `jobs` tableGET  /api/profile          - Get current user profile

5. Create the `job_skills` table (with foreign keys)POST /api/profile          - Update user profile

6. Create the `learning_resources` table```

7. Create the `learning_resource_skills` table

8. Seed initial skills data (50+ pre-populated skills)### Skills



## Migrations```

GET  /api/skills           - Get all skills (public)

All migrations are located in `migrations/` directory:POST /api/skills           - Create new skill (public)

GET  /api/skills/me        - Get user's skills (protected)

```POST /api/skills/me        - Add skill to user (protected)

migrations/DELETE /api/skills/me/:id  - Remove user skill (protected)

├── 20241112000001_create_users_table.sql```

├── 20241112000002_create_skills_table.sql

├── 20241112000003_create_user_skills_table.sql### Jobs

├── 20241112000004_create_jobs_table.sql

├── 20241112000005_create_job_skills_table.sql```

├── 20241112000006_create_learning_resources_table.sqlGET  /api/jobs                    - Get jobs with filters (public)

└── 20241112000007_seed_skills.sqlGET  /api/jobs/:id                - Get job by ID (public)

```POST /api/jobs                    - Create job (public)

GET  /api/jobs/recommended        - Get recommended jobs (protected)

### Managing Migrations```



```bash**Query Parameters for GET /api/jobs**:

# Run pending migrations- `search`: Search in title/company

sqlx migrate run- `location`: Filter by location

- `job_type`: full-time, part-time, contract, internship, remote

# Revert last migration- `experience_level`: entry, junior, mid, senior, lead

sqlx migrate revert- `page`: Page number (default: 1)

- `limit`: Items per page (default: 10, max: 50)

# Create a new migration

sqlx migrate add <migration_name>### Learning Resources



# Check migration status```

sqlx migrate infoGET  /api/resources                    - Get resources with filters (public)

```GET  /api/resources/:id                - Get resource by ID (public)

POST /api/resources                    - Create resource (public)

## Database Schema DetailsGET  /api/resources/recommended        - Get recommended resources (protected)

```

### Users Table

**Query Parameters for GET /api/resources**:

Stores user authentication and profile data for the authentication system.- `search`: Search in title/description

- `skill_id`: Filter by skill UUID

```sql- `resource_type`: course, tutorial, article, video, book, documentation

CREATE TABLE users (- `difficulty_level`: beginner, intermediate, advanced

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),- `cost`: free, paid

    email VARCHAR(255) UNIQUE NOT NULL,- `page`: Page number (default: 1)

    password_hash VARCHAR(255) NOT NULL,  -- Backend will use Argon2- `limit`: Items per page (default: 10, max: 50)

    full_name VARCHAR(255) NOT NULL,

    bio TEXT,## Example API Usage

    location VARCHAR(255),

    profile_image_url TEXT,### Register a new user

    linkedin_url TEXT,

    github_url TEXT,```bash

    created_at TIMESTAMPTZ DEFAULT NOW(),curl -X POST http://localhost:8000/api/auth/register \

    updated_at TIMESTAMPTZ DEFAULT NOW()  -H "Content-Type: application/json" \

);  -d '{

```    "email": "john@example.com",

    "password": "password123",

### Skills Table    "full_name": "John Doe"

  }'

Master catalog of all skills - optimized for HashSet operations.```



```sql### Login

CREATE TABLE skills (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),```bash

    name VARCHAR(100) UNIQUE NOT NULL,curl -X POST http://localhost:8000/api/auth/login \

    category VARCHAR(50) NOT NULL,  -H "Content-Type: application/json" \

    description TEXT,  -d '{

    created_at TIMESTAMPTZ DEFAULT NOW()    "email": "john@example.com",

);    "password": "password123"

  }'

CREATE INDEX idx_skills_category ON skills(category);```

CREATE INDEX idx_skills_name ON skills(name);

```### Get Profile (with JWT token)



### User Skills Table```bash

curl http://localhost:8000/api/profile \

Links users to their skills - enables skill-based matching.  -H "Authorization: Bearer YOUR_JWT_TOKEN"

```

```sql

CREATE TABLE user_skills (### Get Jobs with Filters

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID REFERENCES users(id) ON DELETE CASCADE,```bash

    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,curl "http://localhost:8000/api/jobs?job_type=full-time&experience_level=mid&page=1&limit=10"

    proficiency_level VARCHAR(20) NOT NULL,```

    years_of_experience INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),## Development

    UNIQUE(user_id, skill_id)

);### Adding New Migrations



CREATE INDEX idx_user_skills_user ON user_skills(user_id);```bash

CREATE INDEX idx_user_skills_skill ON user_skills(skill_id);# Create a new migration

```sqlx migrate add migration_name



### Jobs Table# Edit the generated .sql file in migrations/

# Then run:

Job postings with requirements.sqlx migrate run

```

```sql

CREATE TABLE jobs (### Database Cleanup

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title VARCHAR(255) NOT NULL,```bash

    company VARCHAR(255) NOT NULL,# Revert last migration

    description TEXT NOT NULL,sqlx migrate revert

    location VARCHAR(255),

    job_type VARCHAR(50) NOT NULL,# Drop all tables and rerun migrations

    experience_level VARCHAR(50) NOT NULL,sqlx database drop

    salary_range VARCHAR(100),sqlx database create

    requirements TEXT[],sqlx migrate run

    posted_at TIMESTAMPTZ DEFAULT NOW(),```

    expires_at TIMESTAMPTZ,

    is_active BOOLEAN DEFAULT true### Code Organization

);

```

CREATE INDEX idx_jobs_type ON jobs(job_type);src/

CREATE INDEX idx_jobs_location ON jobs(location);├── main.rs           # Application entry point

```├── config/           # Configuration management

├── db/               # Database connection pool

### Job Skills Table├── handlers/         # Request handlers (business logic)

├── middleware/       # Authentication middleware

Required skills for each job - used in matching algorithm.├── models/           # Data models and DTOs

├── routes/           # Route definitions

```sql└── utils/            # Utilities (JWT, errors)

CREATE TABLE job_skills (```

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,## Environment Variables

    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,

    required_proficiency VARCHAR(20),| Variable | Description | Default |

    is_required BOOLEAN DEFAULT true,|----------|-------------|---------|

    UNIQUE(job_id, skill_id)| `DATABASE_URL` | PostgreSQL connection string | Required |

);| `HOST` | Server host | 127.0.0.1 |

| `PORT` | Server port | 8000 |

CREATE INDEX idx_job_skills_job ON job_skills(job_id);| `JWT_SECRET` | Secret key for JWT signing | Required |

CREATE INDEX idx_job_skills_skill ON job_skills(skill_id);| `JWT_EXPIRATION` | JWT expiration in seconds | 86400 (24h) |

```| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:5173 |

| `RUST_LOG` | Log level | debug |

### Learning Resources Table| `ENVIRONMENT` | Environment (development/production) | development |



Educational content and courses.## Testing



```sql```bash

CREATE TABLE learning_resources (# Run tests

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),cargo test

    title VARCHAR(255) NOT NULL,

    description TEXT,# Run tests with output

    url TEXT NOT NULL,cargo test -- --nocapture

    resource_type VARCHAR(50) NOT NULL,```

    difficulty_level VARCHAR(20) NOT NULL,

    cost VARCHAR(20) NOT NULL,## Production Deployment

    provider VARCHAR(255),

    duration_hours INTEGER,1. Set environment variables properly

    rating DECIMAL(3,2),2. Change `JWT_SECRET` to a strong random value

    created_at TIMESTAMPTZ DEFAULT NOW()3. Set `ENVIRONMENT=production`

);4. Build with `cargo build --release`

```5. Run migrations on production database

6. Deploy the binary from `target/release/`

### Learning Resource Skills Table

## SQLx Compile-Time Verification

Skills covered by each resource.

SQLx validates SQL queries at compile time. To prepare for offline builds:

```sql

CREATE TABLE learning_resource_skills (```bash

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),# Generate sqlx-data.json for offline compilation

    resource_id UUID REFERENCES learning_resources(id) ON DELETE CASCADE,cargo sqlx prepare

    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,```

    UNIQUE(resource_id, skill_id)

);## Troubleshooting

```

**Migration errors**: Ensure PostgreSQL is running and DATABASE_URL is correct

## Seeded Data**Compile errors**: Run `cargo clean` and rebuild

**Connection refused**: Check if PostgreSQL is running on the correct port

The `seed_skills.sql` migration populates the database with 50+ essential skills across categories:

## License

**Programming Languages:**

- JavaScript, Python, Java, Rust, TypeScript, Go, C++, C#, PHP, RubyThis project is part of the CareerBridge hackathon submission.


**Web Development:**
- React, Vue.js, Angular, Node.js, HTML, CSS, Tailwind CSS, Next.js

**Mobile Development:**
- React Native, Flutter, Swift, Kotlin, iOS, Android

**DevOps & Cloud:**
- Docker, Kubernetes, CI/CD, AWS, Azure, GCP, Terraform

**Databases:**
- PostgreSQL, MongoDB, MySQL, Redis, SQLite

**Soft Skills:**
- Communication, Leadership, Problem Solving, Team Collaboration, Time Management

## Database Management

### Backup Database

```bash
pg_dump -U postgres career_bridge > backup.sql
```

### Restore Database

```bash
psql -U postgres career_bridge < backup.sql
```

### Reset Database (Development Only)

```bash
# Drop and recreate database
sqlx database drop
sqlx database create
sqlx migrate run
```

### Connect to Database

```bash
# Using psql
psql -U postgres -d career_bridge

# View all tables
\dt

# Describe a table
\d users

# Query data
SELECT * FROM skills LIMIT 10;

# Check skill categories
SELECT category, COUNT(*) FROM skills GROUP BY category;
```

## Docker Setup

### Start PostgreSQL Container

```bash
# Using provided script
./docker-postgres.sh

# Or manually
docker run --name career-bridge-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=career_bridge \
  -p 5432:5432 \
  -d postgres:15
```

### Stop Container

```bash
docker stop career-bridge-postgres
```

### View Logs

```bash
docker logs career-bridge-postgres
```

### Access Container Shell

```bash
docker exec -it career-bridge-postgres psql -U postgres -d career_bridge
```

## Environment Variables

Create a `.env` file with:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/career_bridge
```

## SQLx Compile-Time Verification

This database is designed to work with SQLx's compile-time query verification. The backend developer will use:

```bash
# Backend developer runs this to generate metadata
cargo sqlx prepare
```

This validates all SQL queries at compile time, preventing runtime errors.

## Troubleshooting

### Migration Errors

```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Or for native installation
sudo systemctl status postgresql  # Linux
brew services list | grep postgres  # macOS
```

### Connection Issues

```bash
# Test connection
psql postgresql://postgres:postgres@localhost:5432/career_bridge

# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL
```

### Port Already in Use

```bash
# Change PostgreSQL port in docker command
docker run -p 5433:5432 ...  # Use port 5433 instead

# Update DATABASE_URL accordingly
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/career_bridge
```

## Next Steps (Your DevOps Tasks)

- [ ] Docker Compose setup for multi-container deployment
- [ ] Database backup automation scripts
- [ ] Production database configuration
- [ ] Database monitoring setup (Grafana, Prometheus)
- [ ] CI/CD pipeline for automatic migrations
- [ ] Database replication for high availability
- [ ] Database performance tuning
- [ ] Redis caching layer setup

## Project Structure

```
backend/
├── migrations/              # SQL migration files (YOUR WORK)
│   ├── 20241112000001_create_users_table.sql
│   ├── 20241112000002_create_skills_table.sql
│   ├── 20241112000003_create_user_skills_table.sql
│   ├── 20241112000004_create_jobs_table.sql
│   ├── 20241112000005_create_job_skills_table.sql
│   ├── 20241112000006_create_learning_resources_table.sql
│   └── 20241112000007_seed_skills.sql
├── .env.example             # Environment template
├── .env                     # Local environment (gitignored)
├── .gitignore              # Git ignore rules
├── docker-postgres.sh      # Docker PostgreSQL setup script
├── docker-postgres.ps1     # Windows PowerShell version
├── setup.sh               # Linux/Mac setup script
├── setup.ps1              # Windows setup script
├── POSTGRESQL_SETUP.md    # Detailed PostgreSQL installation guide
└── README.md              # This file
```

## Team Collaboration

### Your Role: Database Schema & DevOps
✅ Database design and schema planning
✅ SQL migrations creation
✅ PostgreSQL setup and configuration
✅ Docker containerization
✅ DevOps infrastructure
✅ Database optimization and indexing

### Backend Developer's Role: API Implementation
❌ Axum web server setup
❌ API endpoints and HTTP routes
❌ JWT/Argon2 authentication logic
❌ Business logic (HashSet-based skill matching)
❌ Error handling with thiserror
❌ Logging with tracing crate
❌ Configuration management with figment

## License

Part of CareerBridge hackathon project supporting SDG 8 (Decent Work and Economic Growth).
