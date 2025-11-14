# JOBS NOT SHOWING - READ THIS FIRST!

## The Issue
Your jobs section is empty because the database needs to be populated with the sample job data.

## The Fix (Choose ONE method)

### ✅ EASIEST: Use pgAdmin 4 (Graphical Interface)

1. **Open pgAdmin 4** (search in Windows Start Menu)
   - If not installed: https://www.pgadmin.org/download/

2. **Connect to PostgreSQL**
   - Server → PostgreSQL
   - Password: `postMEHERAJ`

3. **Check database exists**
   - Look for `database_db` under Databases
   - If missing: Right-click Databases → Create → Database → Name: `database_db`

4. **Create tables**
   - Right-click `database_db` → Query Tool
   - Open `schema.sql` in Notepad
   - Copy everything, paste in Query Tool
   - Click Execute (▶️)

5. **Load 20 sample jobs**
   - In Query Tool, run:
     ```sql
     TRUNCATE jobs, learning_resources RESTART IDENTITY CASCADE;
     ```
   - Open `seed_data.sql` in Notepad
   - Copy everything, paste in Query Tool  
   - Click Execute (▶️)

6. **Verify**
   ```sql
   SELECT COUNT(*) FROM jobs;
   ```
   Should show: **20**

7. **Restart backend**
   ```bash
   cd backend
   cargo run
   ```

8. **Check the jobs page** - You should now see 20 jobs!

---

## What's Included

✅ **20 Real Jobs** with full details:
- Software Engineering: Frontend, Backend, Full Stack, React, Python, DevOps
- Data Science: Data Analyst, Data Scientist, Data Engineer  
- Design: UI/UX, Graphic Designer, Product Designer
- Marketing: Digital Marketing, Social Media, Content Marketing
- More: QA Engineer, Business Analyst

Each job has:
- Complete job description
- Required skills
- Salary ranges
- Responsibilities
- Requirements
- Benefits
- Experience level
- Job type

✅ **40+ Learning Resources** curated for skill development

---

## Still Having Issues?

See detailed guides:
- **QUICK_FIX_JOBS.md** - Step-by-step with screenshots
- **DATABASE_SETUP.md** - Complete setup documentation

---

**Quick Start:** Use pgAdmin 4 → Run `schema.sql` → Run `seed_data.sql` → Restart backend → Enjoy!
