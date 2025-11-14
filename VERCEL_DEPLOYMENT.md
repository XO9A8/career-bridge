# Vercel Deployment Guide - CareerBridge Frontend

This guide will walk you through deploying the CareerBridge Next.js frontend to Vercel.

## Prerequisites

- Vercel account ([vercel.com](https://vercel.com))
- GitHub repository with your code
- Backend deployed on Railway (with the public URL)

## Deployment Steps

### 1. Get Your Railway Backend URL

Before deploying to Vercel, you need your Railway backend URL:

1. Go to your Railway project dashboard
2. Click on your backend service
3. Go to **"Settings"** tab
4. Find the **"Domains"** section
5. Copy the public URL (e.g., `https://backend-production-xxxx.up.railway.app`)

### 2. Deploy to Vercel via Dashboard

#### Option A: Deploy from GitHub (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository (`career-bridge`)
4. Configure the project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

5. **Add Environment Variables**:
   Click **"Environment Variables"** and add:
   
   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_API_BASE_URL` | `https://your-backend-url.up.railway.app/api` |

6. Click **"Deploy"**

#### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend directory
cd frontend

# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel

# Set environment variable
vercel env add NEXT_PUBLIC_API_BASE_URL production

# Redeploy with new environment variable
vercel --prod
```

### 3. Configure Environment Variables

After initial deployment, you can manage environment variables:

1. Go to your Vercel project dashboard
2. Click **"Settings"** tab
3. Click **"Environment Variables"**
4. Add or update:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.up.railway.app/api
```

**Note**: Environment variables starting with `NEXT_PUBLIC_` are exposed to the browser.

### 4. Update Railway Backend CORS

Now that your frontend is deployed, update the Railway backend's `FRONTEND_URL` environment variable:

1. Go to Railway project dashboard
2. Click on your **backend** service
3. Go to **"Variables"** tab
4. Update `FRONTEND_URL` to your Vercel deployment URL:
   ```
   https://career-bridge.vercel.app
   ```
   (Replace with your actual Vercel URL)

5. Railway will automatically redeploy with the new CORS settings

### 5. Verify Deployment

1. Visit your Vercel deployment URL (e.g., `https://career-bridge.vercel.app`)
2. Check that the site loads correctly
3. Test API connectivity by trying to:
   - Register a new user
   - Login
   - Browse jobs
4. Check browser console for any CORS or API errors

### 6. Set Up Custom Domain (Optional)

1. In Vercel project dashboard, go to **"Settings"** → **"Domains"**
2. Add your custom domain
3. Follow Vercel's DNS configuration instructions
4. Update Railway's `FRONTEND_URL` to your custom domain

## Vercel Configuration Files

### vercel.json

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_API_BASE_URL": "https://your-railway-backend-url.up.railway.app/api"
  }
}
```

### .env.example

```env
# Backend API URL
NEXT_PUBLIC_API_BASE_URL=https://your-railway-backend-url.up.railway.app/api
```

**Note**: Never commit `.env` or `.env.local` files with sensitive data!

## Automatic Deployments

Vercel automatically deploys when you:
- Push to your `main` branch (production)
- Create a pull request (preview deployment)
- Push to any branch (development deployment)

Each deployment gets a unique URL for testing.

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL | `https://backend.up.railway.app/api` |

## Troubleshooting

### API Connection Fails

**Problem**: Frontend can't connect to backend

**Solutions**:
- Verify `NEXT_PUBLIC_API_BASE_URL` is set correctly in Vercel
- Check Railway backend is running and accessible
- Verify CORS settings in Railway backend include your Vercel URL
- Check Railway backend logs for CORS errors

### Build Fails

**Problem**: Vercel build fails

**Solutions**:
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript/ESLint errors (or disable in `next.config.ts`)
- Try building locally: `npm run build`

### Environment Variables Not Working

**Problem**: Environment variables not being applied

**Solutions**:
- Ensure variables start with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding/updating environment variables
- Check variables are set for the correct environment (Production/Preview/Development)
- Clear cache and redeploy: Go to Deployments → three dots → Redeploy

### CORS Errors

**Problem**: CORS errors in browser console

**Solutions**:
- Update `FRONTEND_URL` in Railway backend to match Vercel URL
- Ensure Railway backend CORS middleware allows your Vercel domain
- Check that backend is using the `FRONTEND_URL` environment variable
- Restart Railway backend deployment after updating CORS settings

## Performance Optimizations

Vercel automatically provides:
- ✅ Edge CDN for fast global delivery
- ✅ Automatic image optimization
- ✅ Smart caching
- ✅ Serverless functions
- ✅ Compression (gzip/brotli)

## Monitoring

- **Analytics**: Enable Vercel Analytics in project settings
- **Speed Insights**: Monitor Core Web Vitals
- **Logs**: Check function logs in Vercel dashboard
- **Deployments**: View deployment history and status

## Updating Deployment

To deploy updates:

1. Push changes to GitHub
2. Vercel automatically detects and deploys
3. Monitor deployment progress in Vercel dashboard
4. Verify deployment at your Vercel URL

Or manually trigger deployment:
```bash
vercel --prod
```

## Rollback

If something goes wrong:

1. Go to Vercel project dashboard
2. Click **"Deployments"** tab
3. Find a previous successful deployment
4. Click three dots → **"Promote to Production"**

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Custom Domains](https://vercel.com/docs/concepts/projects/domains)

## Support

If you encounter issues:
1. Check Vercel documentation
2. Review deployment logs
3. Visit [Vercel Community](https://github.com/vercel/vercel/discussions)
4. Check [Next.js Discord](https://discord.gg/nextjs)

---

## Quick Deployment Checklist

- [ ] Backend deployed and running on Railway
- [ ] Got Railway backend public URL
- [ ] Created Vercel account
- [ ] Connected GitHub repository to Vercel
- [ ] Set root directory to `frontend`
- [ ] Added `NEXT_PUBLIC_API_BASE_URL` environment variable
- [ ] Deployed to Vercel
- [ ] Updated Railway `FRONTEND_URL` with Vercel URL
- [ ] Tested frontend-backend connectivity
- [ ] Verified user registration/login works
- [ ] Set up custom domain (optional)
