# CareerBridge Backend API

> A comprehensive career development platform API built with Rust and Axum
> 

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Quick Start](#-quick-start)
- [Setup Guide](#-setup-guide)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Code Documentation](#-code-documentation)
- [Algorithms](#-algorithms)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
- [Deployment](#-deployment)

## 🎯 Overview

CareerBridge helps users achieve career goals through:
- 🎯 **Skill Gap Analysis** - Identify and bridge skill gaps
- 💼 **Smart Job Matching** - AI-powered recommendations
- 📚 **Personalized Learning** - Curated courses and resources
- 📊 **Progress Tracking** - Monitor applications and learning

### SDG 8 Alignment
- **8.5** - Full Employment (job matching, application tracking)
- **8.6** - Youth Employment (learning resources, skill development)
- **8.b** - Global Jobs Pact (multi-track support)

## ✨ Features

### 🔐 Authentication & Security
- User registration with email validation
- JWT-based authentication (24-hour tokens)
- Argon2 password hashing
- Protected routes with token middleware
- SQL injection prevention

### 👤 Profile Management
- Complete user profiles with skills and projects
- CV/Resume text storage
- Target role preferences
- Update capabilities

### 💼 Job Recommendations
- AI-powered skill-based matching
- Match score calculation (0-100%)
- Matched and missing skills identification
- Filter by experience level and job type

### 📚 Learning Resources
- Personalized course recommendations
- Skill gap-based suggestions
- Relevance scoring
- Free and paid resource filtering
- Progress tracking (0-100%)

### 📊 Skill Gap Analysis
- Compare user skills vs role requirements
- Calculate match percentage
- Identify specific skill gaps
- Recommend learning resources

### 📝 Application Tracking
- Track job applications
- Status updates and notes
- Application history
- Timeline tracking

### 📈 Progress Tracking
- Track learning resource progress
- Automatic completion detection
- View learning history

## 🚀 Quick Start

```bash
# Prerequisites: Rust 1.70+, PostgreSQL 14+

# 1. Navigate to backend
cd backend

# 2. Set up environment
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET

# 3. Create database
createdb -U postgres career_bridge

# 4. Run schema
psql -U postgres -d career_bridge -f schema.sql

# 5. (Optional) Seed data
psql -U postgres -d career_bridge -f seed_data.sql

# 6. Build and run
cargo build
cargo run
```

Server starts at: `http://127.0.0.1:3000`

## 🛠 Tech Stack

- **Language**: Rust (Edition 2024)
- **Framework**: Axum 0.8 - Async web framework
- **Database**: PostgreSQL 14+ with SQLx
- **Authentication**: JWT (jsonwebtoken)
- **Password Security**: Argon2
- **Validation**: Validator with derive macros
- **Logging**: Tracing
- **Runtime**: Tokio

## 📖 Setup Guide

### 1. Install Prerequisites

**Rust**:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

**PostgreSQL**:
```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# macOS
brew install postgresql@14

# Windows - Download from postgresql.org
```

### 2. Start PostgreSQL

```bash
# Ubuntu/Debian
sudo service postgresql start

# macOS
brew services start postgresql@14

# Windows
net start postgresql-x64-14
```

### 3. Configure Environment

Create `.env`:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/career_bridge
JWT_SECRET=your-secret-key-change-in-production
```

### 4. Create & Setup Database

```bash
# Create database
createdb -U postgres career_bridge

# Apply schema
psql -U postgres -d career_bridge -f schema.sql

# Verify
psql -U postgres -d career_bridge -c "\dt"
```

### 5. Build & Run

```bash
cargo build
cargo run
```

## 📚 API Documentation

### Base URL
```
http://127.0.0.1:3000
```

### Public Endpoints

#### Register User
```http
POST /api/register
Content-Type: application/json

{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123",
  "education_level": "Bachelor's Degree",
  "experience_level": "junior",
  "preferred_track": "web_development"
}
```

**Experience Levels**: `fresher`, `junior`, `mid`  
**Career Tracks**: `web_development`, `data`, `design`, `marketing`

**Response**:
```json
{
  "message": "User registered successfully"
}
```

#### Login
```http
POST /api/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Response**:
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": "uuid",
    "full_name": "John Doe",
    "email": "john@example.com",
    "experience_level": "junior",
    "preferred_track": "web_development",
    "skills": [],
    "projects": [],
    "target_roles": []
  }
}
```

### Protected Endpoints

**Authentication**: Add header:
```
Authorization: Bearer <your_jwt_token>
```

#### Get Profile
```http
GET /api/profile
```

#### Update Profile
```http
PUT /api/profile
Content-Type: application/json

{
  "skills": ["JavaScript", "React", "Node.js"],
  "projects": ["E-commerce Platform"],
  "target_roles": ["Full Stack Developer"],
  "raw_cv_text": "My CV content..."
}
```

#### Get Job Recommendations
```http
GET /api/jobs/recommendations?experience_level=junior&limit=10
```

**Query Parameters**:
- `experience_level`: `fresher`, `junior`, `mid`
- `job_type`: `internship`, `part_time`, `full_time`, `freelance`
- `limit`: Number of results (default: 10)

**Response**:
```json
[
  {
    "job": {
      "id": 1,
      "job_title": "Frontend Developer",
      "company": "Tech Corp",
      "location": "Remote",
      "required_skills": ["JavaScript", "React"],
      "experience_level": "junior"
    },
    "match_score": 85.5,
    "matched_skills": ["JavaScript", "React"],
    "missing_skills": ["CSS"]
  }
]
```

#### Get Learning Recommendations
```http
GET /api/learning/recommendations
```

#### Analyze Skill Gap
```http
GET /api/skill-gap/Full%20Stack%20Developer
```

**Response**:
```json
{
  "user_skills": ["JavaScript", "React"],
  "target_role": "Full Stack Developer",
  "required_skills": ["JavaScript", "React", "Node.js", "PostgreSQL"],
  "skill_gaps": ["Node.js", "PostgreSQL"],
  "matching_skills": ["JavaScript", "React"],
  "match_percentage": 50.0,
  "recommended_resources": [...]
}
```

#### Create Application
```http
POST /api/applications
Content-Type: application/json

{
  "job_id": 1,
  "notes": "Applied via company website"
}
```

#### Get Applications
```http
GET /api/applications
```

#### Update Application
```http
PUT /api/applications/1
Content-Type: application/json

{
  "status": "interview_scheduled",
  "notes": "Interview Monday at 10am"
}
```

#### Start Resource Tracking
```http
POST /api/progress/resource/5/start
```

#### Update Progress
```http
PUT /api/progress/resource/5
Content-Type: application/json

{
  "completion_percentage": 75
}
```

#### Get Progress
```http
GET /api/progress
```

## 🗄 Database Schema

### Tables

#### users
- `id` (UUID, PK)
- `email` (TEXT, UNIQUE)
- `password_hash` (TEXT)
- `full_name` (TEXT)
- `education_level` (TEXT)
- `experience_level` (ENUM)
- `preferred_track` (ENUM)
- `skills` (TEXT[])
- `projects` (TEXT[])
- `target_roles` (TEXT[])
- `raw_cv_text` (TEXT)

#### jobs
- `id` (SERIAL, PK)
- `job_title` (TEXT)
- `company` (TEXT)
- `location` (TEXT)
- `required_skills` (TEXT[])
- `experience_level` (ENUM)
- `job_type` (ENUM)

#### learning_resources
- `id` (SERIAL, PK)
- `title` (TEXT)
- `platform` (TEXT)
- `url` (TEXT)
- `related_skills` (TEXT[])
- `cost` (ENUM)

#### application_tracking
- `id` (SERIAL, PK)
- `user_id` (UUID, FK → users)
- `job_id` (INT, FK → jobs)
- `status` (TEXT)
- `applied_at` (TIMESTAMPTZ)
- `notes` (TEXT)

#### user_progress
- `id` (SERIAL, PK)
- `user_id` (UUID, FK → users)
- `resource_id` (INT, FK → learning_resources)
- `completion_percentage` (INT)
- `started_at` (TIMESTAMPTZ)
- `completed_at` (TIMESTAMPTZ)

### Enums
- `experience_level`: fresher, junior, mid
- `career_track`: web_development, data, design, marketing
- `job_type`: internship, part_time, full_time, freelance
- `cost_indicator`: free, paid

## 📝 Code Documentation

Full Rust documentation available:

```bash
cargo doc --open --no-deps
```

Generates comprehensive HTML docs with:
- Crate overview and API reference
- Module documentation
- All structs, enums, functions
- Parameter and return descriptions
- Error conditions
- Usage examples
- Search functionality

## 🧮 Algorithms

### Job Matching
```
match_score = (matched_skills / required_skills) × 100
```
Calculates skill overlap percentage between user and job.

### Learning Resource Relevance
```
relevance = (new_skills_taught / total_skills) × 100
```
Prioritizes resources teaching new skills.

### Skill Gap Analysis
```
match_percentage = (matching_skills / required_skills) × 100
```
Aggregates requirements from multiple jobs for comprehensive analysis.

## 🧪 Testing

```bash
# Run all tests
cargo test

# Run specific test
cargo test test_name

# Show output
cargo test -- --nocapture

# With REST Client (VS Code)
# Open api_tests.http and click "Send Request"
```

## 🔧 Troubleshooting

### Database Connection Failed
```bash
# Check PostgreSQL is running
sudo service postgresql status

# Start if stopped
sudo service postgresql start
```

### "relation does not exist"
```bash
# Apply schema
psql -U postgres -d career_bridge -f schema.sql
```

### "password authentication failed"
```bash
# Reset password
sudo -u postgres psql
ALTER USER postgres PASSWORD 'newpassword';
\q

# Update .env with new password
```

### Port 3000 Already in Use
Change port in `src/main.rs`:
```rust
let addr = SocketAddr::from(([127, 0, 0, 1], 3001));
```

## 🚀 Deployment

### Production Checklist
- [ ] Use strong JWT_SECRET
- [ ] Configure database connection pooling
- [ ] Enable HTTPS/TLS
- [ ] Set up CORS for frontend
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Database backups
- [ ] Error reporting service

### Build for Production
```bash
cargo build --release
```

Binary: `./target/release/backend`

### Environment Variables
```env
DATABASE_URL=postgresql://user:pass@host:port/dbname
JWT_SECRET=production-secret-key
```

## 📊 Project Structure

```
backend/
├── src/
│   ├── main.rs                # Entry point
│   ├── lib.rs                 # Crate docs
│   ├── handlers/
│   │   ├── mod.rs             # Router
│   │   ├── types.rs           # Request/response types
│   │   ├── auth.rs            # Auth endpoints
│   │   ├── profile.rs         # Profile endpoints
│   │   ├── jobs.rs            # Job recommendations
│   │   ├── learning.rs        # Learning resources
│   │   ├── applications.rs    # Application tracking
│   │   └── progress.rs        # Progress tracking
│   ├── models.rs              # Database models
│   ├── auth.rs                # JWT logic
│   ├── security.rs            # Password hashing
│   └── errors.rs              # Error handling
├── schema.sql                 # Database schema
├── seed_data.sql              # Sample data
├── api_tests.http             # API tests
├── Cargo.toml                 # Dependencies
└── .env                       # Environment vars
```

## 🤝 Contributing

SDG 8 Hackathon project. Contributions welcome!

## 📄 License

MIT License

---

**Built with ❤️ using Rust** | **Version 0.1.0** | **Status: Production Ready** ✅
