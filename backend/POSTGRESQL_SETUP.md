# PostgreSQL Installation Guide

Choose the method that works best for you:

## 🐳 Option 1: Docker (Recommended - Easiest!)

### Why Docker?
- ✅ No system installation needed
- ✅ Easy to start/stop/remove
- ✅ Consistent across all operating systems
- ✅ Isolated from your system
- ✅ Can run multiple versions

### Prerequisites
1. **Install Docker Desktop**
   - Windows/Mac: https://www.docker.com/products/docker-desktop/
   - Linux: `sudo apt-get install docker.io` (Ubuntu/Debian)

2. **Start Docker Desktop**
   - Open Docker Desktop app
   - Wait for it to say "Docker Desktop is running"

### Quick Setup (Choose your OS)

**Windows (PowerShell):**
```powershell
cd backend
.\docker-postgres.ps1
```

**Linux/Mac (Bash):**
```bash
cd backend
chmod +x docker-postgres.sh
./docker-postgres.sh
```

**Or manually run this command:**
```bash
docker run -d \
  --name career-bridge-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=career_bridge \
  -p 5432:5432 \
  postgres:15
```

### Verify It's Running
```bash
docker ps
```

You should see `career-bridge-postgres` in the list.

### Connection Details
```
Host: localhost
Port: 5432
Database: career_bridge
Username: postgres
Password: postgres

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/career_bridge
```

### Useful Docker Commands
```bash
# Stop the database
docker stop career-bridge-postgres

# Start the database again
docker start career-bridge-postgres

# View logs
docker logs career-bridge-postgres

# Access PostgreSQL CLI
docker exec -it career-bridge-postgres psql -U postgres -d career_bridge

# Remove the database completely (data will be lost!)
docker rm -f career-bridge-postgres
```

---

## 💻 Option 2: Native Installation

### Windows

1. **Download PostgreSQL**
   - Go to: https://www.postgresql.org/download/windows/
   - Download the installer (PostgreSQL 15 or 16)

2. **Run the Installer**
   - Accept default installation directory
   - Remember the password you set for `postgres` user
   - Use default port: 5432
   - Accept default locale

3. **Create Database**
   Open Command Prompt or PowerShell:
   ```cmd
   # Add PostgreSQL to PATH (or use full path)
   "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres

   # In psql prompt:
   CREATE DATABASE career_bridge;
   \q
   ```

4. **Update .env file**
   ```
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/career_bridge
   ```

### macOS

**Using Homebrew (Recommended):**
```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Create database
createdb career_bridge
```

**Or download from:**
- https://www.postgresql.org/download/macosx/
- Or use Postgres.app: https://postgresapp.com/

### Linux (Ubuntu/Debian)

```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres createdb career_bridge

# Create user (optional, if you want a different user)
sudo -u postgres psql
CREATE USER myuser WITH PASSWORD 'mypassword';
GRANT ALL PRIVILEGES ON DATABASE career_bridge TO myuser;
\q
```

**Update .env file:**
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/career_bridge
# Or if you created a custom user:
DATABASE_URL=postgresql://myuser:mypassword@localhost:5432/career_bridge
```

### Linux (Fedora/RHEL/CentOS)

```bash
# Install PostgreSQL
sudo dnf install postgresql postgresql-server

# Initialize database
sudo postgresql-setup --initdb

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres createdb career_bridge
```

---

## 🧪 Testing the Connection

### Method 1: Using psql (PostgreSQL CLI)

```bash
# Connect to database
psql postgresql://postgres:postgres@localhost:5432/career_bridge

# Or if installed natively
psql -U postgres -d career_bridge

# In psql prompt, test with:
\l              # List databases
\dt             # List tables (empty for now)
SELECT version();  # Check PostgreSQL version
\q              # Quit
```

### Method 2: Using SQLx CLI

```bash
# Install SQLx CLI
cargo install sqlx-cli --no-default-features --features postgres

# Test connection (from backend directory)
sqlx database create

# This should say "Database already exists" if it's working
```

---

## 🔧 After PostgreSQL is Running

Once you have PostgreSQL running (via Docker or native installation):

1. **Verify your `.env` file has the correct DATABASE_URL**
   ```bash
   cd backend
   cat .env
   ```

2. **Run the migrations**
   ```bash
   sqlx migrate run
   ```
   This will create all the tables and seed initial data.

3. **Start the backend**
   ```bash
   cargo run
   ```

4. **Test an endpoint**
   ```bash
   curl http://localhost:8000/api/skills
   ```
   You should see a list of skills!

---

## ❓ Troubleshooting

### Connection Refused
- **Docker**: Make sure Docker Desktop is running
  ```bash
  docker ps  # Should list your container
  ```
- **Native**: Make sure PostgreSQL service is running
  ```bash
  # Windows
  services.msc  # Look for "postgresql-x64-15"
  
  # Linux/Mac
  sudo systemctl status postgresql
  # or
  brew services list
  ```

### Port 5432 Already in Use
- Stop the existing PostgreSQL instance
- Or change the port in docker command: `-p 5433:5432`
- Update .env: `DATABASE_URL=postgresql://postgres:postgres@localhost:5433/career_bridge`

### Permission Denied
- **Docker**: Make sure Docker Desktop has permissions
- **Linux**: Use `sudo` for PostgreSQL commands

### Password Authentication Failed
- Check your .env file has the correct password
- For Docker, default password is `postgres`

---

## 🎯 Recommended Setup for Development

**Docker is the best choice because:**
1. ✅ Works the same on all operating systems
2. ✅ Easy to reset (just delete and recreate container)
3. ✅ Doesn't mess with your system
4. ✅ Can stop/start easily
5. ✅ No version conflicts

**To use Docker:**
```bash
# 1. Install Docker Desktop
# 2. Start Docker Desktop
# 3. Run the setup script:
cd backend
./docker-postgres.ps1   # Windows
./docker-postgres.sh    # Linux/Mac

# 4. Install SQLx CLI
cargo install sqlx-cli --no-default-features --features postgres

# 5. Run migrations
sqlx migrate run

# 6. Start backend
cargo run
```

That's it! Your database will be ready to use.

---

## 📚 GUI Tools (Optional)

If you prefer a graphical interface:

- **pgAdmin** (Free, Official): https://www.pgadmin.org/
- **DBeaver** (Free): https://dbeaver.io/
- **TablePlus** (Paid, Beautiful): https://tableplus.com/
- **DataGrip** (Paid, JetBrains): https://www.jetbrains.com/datagrip/

Connect using:
- Host: `localhost`
- Port: `5432`
- Database: `career_bridge`
- Username: `postgres`
- Password: `postgres`
