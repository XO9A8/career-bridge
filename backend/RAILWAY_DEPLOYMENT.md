# Railway Deployment Guide (Without Docker)

This guide will walk you through deploying the CareerBridge backend and PostgreSQL database to Railway using Nixpacks (native Rust build).

## Prerequisites

- Railway account ([railway.app](https://railway.app))
- Railway CLI installed (optional but recommended)
- Git repository connected to Railway

## Deployment Steps

### 1. Create a New Railway Project

1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `career-bridge` repository
5. Railway will create a new project

### 2. Add PostgreSQL Database

1. In your Railway project dashboard, click "+ New"
2. Select "Database" → "Add PostgreSQL"
3. Railway will provision a PostgreSQL database
4. The `DATABASE_URL` environment variable will be automatically created

### 3. Configure Backend Service

1. Click on your backend service in the Railway dashboard
2. Go to the "Settings" tab
3. Configure the following:

#### Root Directory
- Set **Root Directory** to: `backend`

#### Environment Variables
The following variables should be automatically set or added:

```env
DATABASE_URL=postgresql://... (automatically set by Railway)
PORT=${{PORT}} (Railway provides this automatically)
RUST_ENV=production
JWT_SECRET=your-secure-jwt-secret-here
FRONTEND_URL=https://your-frontend-url.vercel.app
```

**Important Environment Variables to Add Manually:**

- `JWT_SECRET`: Generate a secure random string (at least 32 characters)
  ```bash
  # Generate using OpenSSL
  openssl rand -base64 32
  ```

- `FRONTEND_URL`: Your frontend deployment URL (for CORS)

- `RUST_ENV`: Set to `production`

#### Build Configuration

The build is configured in `railway.toml` and `nixpacks.toml`:

- **Builder**: NIXPACKS (native Rust compilation)
- **Build Command**: `cargo build --release`
- **Start Command**: `./target/release/backend`

### 4. Initialize Database Schema

After the backend service is deployed, you need to run the schema and seed data:

#### Option A: Using Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Run schema migration
railway run --service postgres psql $DATABASE_URL -f schema.sql

# (Optional) Load seed data
railway run --service postgres psql $DATABASE_URL -f seed_data.sql
```

#### Option B: Using Railway Dashboard Database Client

1. Go to your PostgreSQL service in Railway dashboard
2. Look for one of these options:
   - Click on the **"Data"** tab, then look for **"Query"**, **"SQL Editor"**, or **"Console"** button
   - Or click **"Connect"** → **"Query"** or **"SQL Shell"**
   - Or find **"PostgreSQL"** section and click **"Open Database"** or similar
3. In the SQL editor/console, copy and paste the contents of `schema.sql`
4. Execute the query (look for "Run", "Execute", or play button)
5. (Optional) Repeat with `seed_data.sql` for test data

**Alternative:** If you can't find the query interface:
1. Click on your Postgres service
2. Go to **"Settings"** or **"Connect"** tab
3. Copy the **DATABASE_URL** connection string
4. Use a database client like [pgAdmin](https://www.pgadmin.org/), [DBeaver](https://dbeaver.io/), or [TablePlus](https://tableplus.com/)
5. Connect using the DATABASE_URL and run the SQL files there

#### Option C: Using Local psql Client

```bash
# Get DATABASE_URL from Railway dashboard (Settings → Environment Variables)
export DATABASE_URL="postgresql://..."

# Run schema
psql $DATABASE_URL -f schema.sql

# (Optional) Load seed data
psql $DATABASE_URL -f seed_data.sql
```

### 5. Deploy

Railway will automatically deploy when you push to your connected branch (usually `main`).

To manually trigger a deployment:
1. Go to your backend service
2. Click "Deployments" tab
3. Click "Deploy" button

Or using Railway CLI:
```bash
railway up
```

### 6. Verify Deployment

1. Once deployed, Railway will provide a public URL (e.g., `backend-production-xxxx.up.railway.app`)
2. Test the API:
   ```bash
   curl https://your-backend-url.railway.app/api/
   ```
3. Check the logs in the Railway dashboard to ensure the server started correctly

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `PORT` | Server port (provided by Railway) | `3000` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-secret-key-here` |
| `RUST_ENV` | Environment mode | `production` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://your-frontend.vercel.app` |

## Build Configuration Files

### railway.toml
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "./target/release/backend"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

### nixpacks.toml
```toml
[phases.setup]
nixPkgs = ["rust", "cargo", "pkg-config", "openssl"]

[phases.build]
cmds = ["cargo build --release"]

[start]
cmd = "./target/release/backend"
```

## Troubleshooting

### Build Fails

- **Check build logs**: Review the deployment logs in Railway dashboard
- **Dependency issues**: Ensure all required system packages are listed in `nixpacks.toml`
- **sqlx compile-time verification**: If sqlx queries fail, you may need to set `SQLX_OFFLINE=true` and generate `sqlx-data.json`:
  ```bash
  cargo sqlx prepare -- --lib
  ```

### Database Connection Issues

- **Verify DATABASE_URL**: Ensure the environment variable is set correctly
- **Check database status**: Make sure the PostgreSQL service is running
- **Network issues**: Railway services can connect internally via private networking

### Server Doesn't Start

- **Check logs**: Review application logs in Railway dashboard
- **PORT binding**: Ensure the server binds to `0.0.0.0` and uses the `PORT` environment variable
- **Environment variables**: Verify all required environment variables are set

### CORS Issues

- **Set FRONTEND_URL**: Add your frontend domain to allowed origins
- **Check CORS configuration**: Verify CORS settings in your Rust code match your frontend URL

## Monitoring and Logs

- **View Logs**: Click on your service → "Logs" tab
- **Metrics**: Monitor CPU, memory, and network usage in the "Metrics" tab
- **Alerts**: Set up alerts for deployment failures or service downtime

## Scaling

Railway automatically handles scaling based on your plan:
- **Hobby Plan**: 512 MB RAM, shared CPU
- **Pro Plan**: Configurable resources, better performance

## Database Backups

- Railway provides automatic daily backups for PostgreSQL
- You can also manually backup using:
  ```bash
  railway run --service postgres pg_dump $DATABASE_URL > backup.sql
  ```

## Updating Deployment

To deploy updates:
1. Push changes to your GitHub repository
2. Railway automatically detects changes and redeploys
3. Monitor deployment progress in the dashboard

## Useful Commands

```bash
# View logs
railway logs

# Run commands in Railway environment
railway run <command>

# SSH into running container (if needed)
railway shell

# Check service status
railway status
```

## Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Nixpacks Documentation](https://nixpacks.com)
- [Rust on Railway](https://docs.railway.app/languages/rust)

## Support

If you encounter issues:
1. Check Railway documentation
2. Review deployment logs
3. Visit Railway Discord community
4. Check Railway status page for outages
