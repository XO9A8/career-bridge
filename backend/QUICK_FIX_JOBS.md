# Quick Fix: Jobs Not Showing

## Problem
The jobs section isn't showing any jobs because the database hasn't been set up with the seed data yet.

## Solution

You have **20 sample jobs** ready to load in `seed_data.sql`. Here's how to load them:

---

## Method 1: Using pgAdmin 4 (Easiest - GUI Method)

### Step 1: Open pgAdmin 4
- Search for "pgAdmin" in Windows Start Menu
- If you don't have it, download from: https://www.pgadmin.org/download/

### Step 2: Connect to Your Server
- Expand "Servers" in the left panel
- Click on your PostgreSQL server
- Enter password: `postMEHERAJ`

### Step 3: Verify Database Exists
- Look for `database_db` under Databases
- If it doesn't exist:
  - Right-click "Databases" → Create → Database
  - Name: `database_db`
  - Click Save

### Step 4: Run Schema (Create Tables)
1. Right-click on `database_db` → Query Tool
2. Open this file in Notepad: `E:\blockchain\testing2\career-bridge\backend\schema.sql`
3. Copy ALL the content
4. Paste into the Query Tool
5. Click the Execute button (▶️) or press F5
6. You should see "Query returned successfully"

### Step 5: Load Sample Jobs
1. Still in the Query Tool (or open a new one)
2. First, clear any existing data:
   ```sql
   TRUNCATE jobs, learning_resources RESTART IDENTITY CASCADE;
   ```
3. Click Execute (▶️)
4. Open this file in Notepad: `E:\blockchain\testing2\career-bridge\backend\seed_data.sql`
5. Copy ALL the content
6. Paste into the Query Tool
7. Click Execute (▶️)
8. You should see "Query returned successfully"

### Step 6: Verify Jobs Were Loaded
Run this query:
```sql
SELECT COUNT(*) FROM jobs;
```

You should see: **20**

To see all jobs:
```sql
SELECT id, job_title, company, experience_level FROM jobs ORDER BY id;
```

---

## Method 2: Using Command Line (If psql is installed)

### Find psql.exe
Look in one of these locations:
- `C:\Program Files\PostgreSQL\16\bin\psql.exe`
- `C:\Program Files\PostgreSQL\15\bin\psql.exe`
- `C:\Program Files\PostgreSQL\14\bin\psql.exe`

### Run Commands
Open PowerShell or Command Prompt in the backend folder:

```powershell
cd E:\blockchain\testing2\career-bridge\backend

# Set password (for this session only)
$env:PGPASSWORD="postMEHERAJ"

# Create database (if needed)
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -h localhost -p 5433 -d postgres -c "CREATE DATABASE database_db;"

# Create tables
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -h localhost -p 5433 -d database_db -f schema.sql

# Load sample data
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -h localhost -p 5433 -d database_db -f seed_data.sql

# Verify
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -h localhost -p 5433 -d database_db -c "SELECT COUNT(*) FROM jobs;"
```

---

## After Loading Data

### 1. Start the Backend
```bash
cd E:\blockchain\testing2\career-bridge\backend
cargo run
```

Wait for: `Server running at http://127.0.0.1:3000`

### 2. Start the Frontend
In a new terminal:
```bash
cd E:\blockchain\testing2\career-bridge\frontend
npm run dev
```

### 3. Test It
1. Go to: http://localhost:3001
2. Register or login
3. Go to the Jobs page
4. You should now see 20 jobs!

---

## Jobs You'll See

### Software Engineering (7 jobs)
- Frontend Developer - Tech Solutions Inc
- Full Stack Developer - Innovation Labs
- Junior Web Developer - Startup Hub
- React Developer - Digital Agency
- Backend Developer - Cloud Systems
- Python Developer - FinTech Startup
- DevOps Engineer - Cloud Infrastructure

### Data & Analytics (3 jobs)
- Data Analyst - Analytics Corp
- Junior Data Scientist - AI Innovations
- Data Engineer - BigData Solutions

### Design (4 jobs)
- UI/UX Designer - Creative Studio
- Graphic Designer - Marketing Agency
- Product Designer - Tech Products Co
- Web Designer - Design Collective

### Marketing (4 jobs)
- Digital Marketing Specialist - Growth Marketing
- Social Media Manager - Brand Agency
- Marketing Analyst - E-commerce Giant
- Content Marketing Manager - SaaS Company

### Other (2 jobs)
- QA Engineer - Software Testing Co
- Business Analyst - Consulting Firm

---

## Troubleshooting

### "relation does not exist"
→ You need to run `schema.sql` first to create the tables

### "duplicate key value violates unique constraint"
→ Jobs already exist. Run this to clear and reload:
```sql
TRUNCATE jobs, learning_resources RESTART IDENTITY CASCADE;
```
Then run `seed_data.sql` again

### Backend shows "database connection failed"
→ Make sure PostgreSQL is running:
- Open Services (Windows + R, type `services.msc`)
- Find "postgresql-x64-16" (or similar)
- Make sure it's "Running"
- If not, right-click → Start

### Frontend shows "Failed to load jobs"
1. Check backend is running at http://127.0.0.1:3000
2. Make sure you're logged in (have a JWT token)
3. Check browser console (F12) for errors
4. Verify jobs exist: Open pgAdmin → Query Tool → `SELECT COUNT(*) FROM jobs;`

---

## Database Connection Info

From your `.env` file:
- **Host:** localhost
- **Port:** 5433
- **Database:** database_db
- **Username:** postgres
- **Password:** postMEHERAJ

---

## Need More Help?

1. **Check if PostgreSQL is installed:**
   - Open Services (services.msc)
   - Look for "postgresql" service

2. **Check backend logs:**
   - Look at terminal where `cargo run` is running
   - Any database errors will show there

3. **Verify database exists:**
   - Open pgAdmin 4
   - Look for `database_db` under Databases

4. **Check backend is accessible:**
   - Visit: http://127.0.0.1:3000/health (should return "OK" or 404)

---

## Summary

✅ 20 sample jobs are ready in `seed_data.sql`  
✅ Use pgAdmin 4 (GUI) for easiest setup  
✅ Or use command line if psql is in PATH  
✅ After loading, restart backend and check Jobs page  
✅ Jobs include full details: skills, salary, responsibilities, etc.  

The jobs will work with the AI matching system and show match scores based on your profile!
