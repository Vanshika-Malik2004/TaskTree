# 🚀 Quick Deployment Guide

Follow these steps to deploy your TaskTree app in ~10 minutes!

## ⚡ Quick Steps

### 1. Deploy Convex Backend (2 minutes)

```bash
cd taskman-main
pnpm run deploy:convex
```

**Save the Convex URL** that appears (looks like: `https://xxxx.convex.cloud`)

### 2. Configure Clerk JWT (1 minute)

```bash
# Set your Clerk domain in Convex
npx convex env set CLERK_JWT_ISSUER_DOMAIN "your-app.clerk.accounts.dev"
```

To find your Clerk domain:

1. Go to: https://dashboard.clerk.com
2. Select your app → **JWT Templates**
3. Create/find template named "convex"
4. Copy the domain from the JWKS URL

### 3. Deploy Frontend to Vercel (5 minutes)

**Option A: Via CLI (faster)**

```bash
npm i -g vercel
vercel login
vercel --prod
```

**Option B: Via Web (easier)**

1. Push code to GitHub
2. Go to https://vercel.com/new
3. Import your repository
4. Add these environment variables:
   - `VITE_CONVEX_URL`: Your Convex URL from step 1
   - `VITE_CLERK_PUBLISHABLE_KEY`: From Clerk Dashboard → API Keys
5. Click **Deploy**

### 4. Update Clerk Domain (1 minute)

1. Go to Clerk Dashboard → **Domains**
2. Add your Vercel domain (e.g., `your-app.vercel.app`)

## ✅ Done!

Visit your deployed app and test:

- [ ] Sign in with Clerk
- [ ] Create a workspace
- [ ] Add tasks
- [ ] Everything works!

---

**Need help?** Check [DEPLOYMENT.md](./DEPLOYMENT.md) for the full guide.

**Troubleshooting?** Run `npx convex logs` to check backend logs.
