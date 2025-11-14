# Database Setup Guide

This guide will help you set up the CareerBridge database with all the necessary tables and sample job data.

## Quick Setup (Recommended)

### Windows (PowerShell)
```powershell
cd backend
.\setup_db.ps1
```

### Linux/macOS/Git Bash
```bash
cd backend
chmod +x setup_db.sh
./setup_db.sh
```

## Manual Setup

If the automated scripts don't work, follow these steps:

### Step 1: Find your PostgreSQL installation

**Windows:**
- Usually located at: `C:\Program Files\PostgreSQL\[version]\bin`
- Or use pgAdmin 4 (graphical interface)

**Linux/macOS:**
```bash
which psql
```

### Step 2: Connect to PostgreSQL

**Using Command Line:**
```bash
psql -U postgres -h localhost -p 5433
```

**Using pgAdmin 4:**
1. Open pgAdmin 4
2. Connect to your PostgreSQL server
3. Right-click on "Databases" → "Query Tool"

### Step 3: Create the Database

```sql
CREATE DATABASE database_db;
```

### Step 4: Run the Schema

**Command Line:**
```bash
psql -U postgres -h localhost -p 5433 -d database_db -f schema.sql
```

**pgAdmin 4:**
1. Open `schema.sql` in a text editor
2. Copy the contents
3. Paste into the Query Tool
4. Click "Execute" (F5)

### Step 5: Load Sample Data

**Command Line:**
```bash
psql -U postgres -h localhost -p 5433 -d database_db -f seed_data.sql
```

**pgAdmin 4:**
1. Open `seed_data.sql` in a text editor
2. Copy the contents
3. Paste into the Query Tool
4. Click "Execute" (F5)

### Step 6: Verify the Setup

Run this query to check if jobs were loaded:

```sql
SELECT COUNT(*) FROM jobs;
```

You should see **20 jobs** in the database.

To see all job titles:
```sql
SELECT job_title, company, experience_level FROM jobs ORDER BY id;
```

## Sample Jobs Included

The seed data includes 20+ diverse job listings:

### Software Engineering & Development
- Frontend Developer (Junior) - Tech Solutions Inc
- Full Stack Developer (Mid) - Innovation Labs
- Junior Web Developer (Fresher) - Startup Hub
- React Developer (Junior) - Digital Agency
- Backend Developer (Mid) - Cloud Systems
- Python Developer (Junior) - FinTech Startup
- DevOps Engineer (Mid) - Cloud Infrastructure

### Data & Analytics
- Data Analyst (Junior) - Analytics Corp
- Junior Data Scientist (Fresher) - AI Innovations
- Data Engineer (Mid) - BigData Solutions

### Design
- UI/UX Designer (Junior) - Creative Studio
- Graphic Designer (Fresher) - Marketing Agency
- Product Designer (Mid) - Tech Products Co
- Web Designer (Junior) - Design Collective

### Marketing
- Digital Marketing Specialist (Junior) - Growth Marketing
- Social Media Manager (Fresher) - Brand Agency
- Marketing Analyst (Junior) - E-commerce Giant
- Content Marketing Manager (Mid) - SaaS Company

### Quality Assurance
- QA Engineer (Fresher) - Software Testing Co

### Business Analysis
- Business Analyst (Junior) - Consulting Firm

Each job includes:
- ✅ Detailed job description
- ✅ Required skills array
- ✅ Salary range (min-max)
- ✅ Responsibilities list
- ✅ Requirements list
- ✅ Benefits list
- ✅ Experience level
- ✅ Job type (full-time, part-time, internship, freelance)

## Troubleshooting

### "psql: command not found"

**Windows:**
Add PostgreSQL to your PATH:
1. Search for "Environment Variables" in Windows
2. Edit "Path" under System Variables
3. Add: `C:\Program Files\PostgreSQL\[version]\bin`
4. Restart your terminal

**Linux/Ubuntu:**
```bash
sudo apt-get install postgresql-client
```

**macOS:**
```bash
brew install postgresql
```

### "password authentication failed"

Update the password in `.env` file:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5433/database_db
```

And in the setup scripts if needed.

### "database already exists"

The setup scripts will ask if you want to recreate it. Say yes to start fresh.

Or manually:
```sql
DROP DATABASE database_db;
CREATE DATABASE database_db;
```

### "port 5433 refused"

Check if PostgreSQL is running:

**Windows:**
```powershell
Get-Service postgresql*
```

If stopped, start it:
```powershell
Start-Service postgresql-x64-[version]
```

**Linux:**
```bash
sudo systemctl status postgresql
sudo systemctl start postgresql
```

### Jobs not showing in frontend

1. Verify jobs exist in database:
```bash
psql -U postgres -h localhost -p 5433 -d database_db -c "SELECT COUNT(*) FROM jobs;"
```

2. Make sure backend is running:
```bash
cd backend
cargo run
```

3. Check backend logs for errors

4. Verify DATABASE_URL in `.env` matches your PostgreSQL configuration

5. Check that frontend is calling the correct API endpoint:
   - Should be: `http://127.0.0.1:3000/api/jobs/recommendations`

## Database Connection Details

From `.env` file:
- **Host:** localhost
- **Port:** 5433
- **Database:** database_db
- **User:** postgres
- **Password:** postMEHERAJ

## Next Steps

After successful database setup:

1. **Start the backend:**
   ```bash
   cd backend
   cargo run
   ```

2. **Start the frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test the jobs endpoint:**
   - Register/login to get a JWT token
   - Visit the Jobs page
   - You should see all 20 jobs listed

4. **Verify in browser:**
   - Go to http://localhost:3001/jobs
   - You should see job cards with:
     - Match scores (if profile completed)
     - Job titles and companies
     - Required skills
     - Salary ranges
     - Job details

## Support

If you encounter any issues:

1. Check the backend logs for error messages
2. Verify PostgreSQL is running
3. Ensure database connection details in `.env` are correct
4. Make sure all tables were created (use `\dt` in psql)
5. Verify jobs were loaded (`SELECT COUNT(*) FROM jobs;`)

For more help, see the main [Backend README](README.md).
