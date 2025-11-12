# 🚀 Next Steps - Getting Started

Your Rust backend with SQLx, Axum, and PostgreSQL is now fully set up! Here's what to do next:

## Step 1: Install PostgreSQL

### Option A: Install PostgreSQL Locally (Recommended for Windows)

1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer
3. Remember the password you set for the `postgres` user
4. Make sure PostgreSQL service is running

### Option B: Use Docker (Easier)

```bash
docker run --name career-bridge-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=career_bridge \
  -p 5432:5432 \
  -d postgres:15
```

## Step 2: Install SQLx CLI

The SQLx CLI is required to run database migrations:

```bash
cargo install sqlx-cli --no-default-features --features postgres
```

This might take 5-10 minutes to compile.

## Step 3: Configure Environment

The `.env` file is already created. Update it if needed:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/career_bridge
```

Replace `YOUR_PASSWORD` with your PostgreSQL password.

## Step 4: Create Database and Run Migrations

```bash
# Navigate to backend directory
cd backend

# Create the database
sqlx database create

# Run migrations (creates all tables)
sqlx migrate run
```

This will create all tables:
- ✅ users
- ✅ skills (with 40+ pre-seeded skills)
- ✅ user_skills
- ✅ jobs
- ✅ job_skills
- ✅ learning_resources

## Step 5: Run the Backend Server

```bash
# Simple run
cargo run

# OR with hot reload (recommended for development)
cargo install cargo-watch
cargo watch -x run
```

The server will start at: **http://127.0.0.1:8000**

You should see output like:
```
Server running on http://127.0.0.1:8000
Environment: development
```

## Step 6: Test the API

### Test with curl:

```bash
# Register a new user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User"
  }'
```

### Or use a tool like:
- **Postman**: https://www.postman.com/
- **Thunder Client** (VS Code extension)
- **REST Client** (VS Code extension)

## Step 7: Integrate with Frontend

Update your frontend API calls to point to: `http://localhost:8000/api`

Example in React:

```javascript
const API_URL = 'http://localhost:8000/api';

// Register
const response = await fetch(`${API_URL}/auth/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password, full_name })
});

// Login
const loginResponse = await fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { token } = await loginResponse.json();

// Protected route (with JWT)
const profileResponse = await fetch(`${API_URL}/profile`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## Available Endpoints

### 🔓 Public Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/skills` - Get all skills
- `GET /api/jobs` - Get jobs (with filters)
- `GET /api/resources` - Get learning resources

### 🔒 Protected Endpoints (Require JWT)
- `GET /api/profile` - Get user profile
- `POST /api/profile` - Update profile
- `GET /api/skills/me` - Get user's skills
- `POST /api/skills/me` - Add skill
- `DELETE /api/skills/me/:id` - Remove skill
- `GET /api/jobs/recommended` - Get recommended jobs
- `GET /api/resources/recommended` - Get recommended resources

## Common Issues & Solutions

### ❌ "Database connection failed"
- Check if PostgreSQL is running
- Verify DATABASE_URL in `.env` is correct
- Make sure the database `career_bridge` exists

### ❌ "SQLx CLI not found"
- Run: `cargo install sqlx-cli --no-default-features --features postgres`
- Make sure `~/.cargo/bin` is in your PATH

### ❌ "Migration failed"
- Drop and recreate database: `sqlx database drop && sqlx database create && sqlx migrate run`

### ❌ "Port 8000 already in use"
- Change PORT in `.env` to 8001 or another available port

## Development Workflow

1. **Make changes** to handlers, models, or routes
2. The server will **auto-reload** (if using `cargo watch`)
3. **Test** with your frontend or API client
4. **Commit** your changes to git

## Adding New Features

### To add a new migration:
```bash
sqlx migrate add add_new_table
# Edit the generated .sql file
sqlx migrate run
```

### To add a new endpoint:
1. Add model in `src/models/`
2. Add handler in `src/handlers/`
3. Add route in `src/routes/mod.rs`

## Performance Tips

For faster compilation during development:
- Use `cargo check` instead of `cargo build`
- Enable incremental compilation (already enabled)
- Consider using `sccache` for caching

## Ready for Production?

When deploying:
1. ✅ Set `ENVIRONMENT=production` in `.env`
2. ✅ Change `JWT_SECRET` to a strong random value
3. ✅ Update CORS settings for your production frontend URL
4. ✅ Build with: `cargo build --release`
5. ✅ Use a production PostgreSQL instance
6. ✅ Set up proper logging and monitoring

---

## 🎉 You're All Set!

Your backend is fully configured with:
- ✅ SQLx with compile-time SQL checking
- ✅ PostgreSQL database
- ✅ JWT authentication
- ✅ User profiles and skills
- ✅ Job recommendations
- ✅ Learning resources
- ✅ CORS enabled for frontend

**Happy coding! 🚀**
