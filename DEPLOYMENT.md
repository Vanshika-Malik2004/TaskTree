# TaskTree Deployment Guide

This guide will help you deploy your TaskTree application to production.

## Prerequisites

Before deploying, make sure you have:

- A [Clerk](https://clerk.com) account with an application set up
- A [Convex](https://convex.dev) account
- A [Vercel](https://vercel.com) account (or Netlify/other hosting provider)

## Step 1: Deploy Convex Backend

### 1.1 Initialize Convex Production Deployment

```bash
npx convex deploy
```

This will:

- Create a production deployment on Convex
- Generate your production `CONVEX_DEPLOYMENT` URL
- Push your schema and functions to production

### 1.2 Configure Clerk Authentication for Production

1. Go to your Clerk Dashboard: https://dashboard.clerk.com
2. Select your application
3. Go to **JWT Templates** in the sidebar
4. Create a new template named "convex"
5. Copy the **JWKS Endpoint URL** (looks like: `https://your-app.clerk.accounts.dev/.well-known/jwks.json`)
6. Extract the domain (the part before `/.well-known/jwks.json`)
7. Set the environment variable in Convex:

```bash
npx convex env set CLERK_JWT_ISSUER_DOMAIN "your-app.clerk.accounts.dev"
```

Replace `"your-app.clerk.accounts.dev"` with your actual Clerk domain.

### 1.3 Note Your Convex Deployment URL

After running `npx convex deploy`, you'll get a deployment URL like:

```
https://your-project-123.convex.cloud
```

Save this URL - you'll need it for the frontend deployment.

## Step 2: Deploy Frontend to Vercel

### 2.1 Prepare Your Project

Create a `.env.production` file (if it doesn't exist):

```bash
# .env.production
VITE_CONVEX_URL=https://your-project-123.convex.cloud
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxx
```

### 2.2 Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### Option B: Using Vercel Web Dashboard

1. Push your code to GitHub
2. Go to https://vercel.com/new
3. Import your repository
4. Configure your project:

   - **Framework Preset**: Vite
   - **Build Command**: `pnpm build`
   - **Output Directory**: `dist`
   - **Install Command**: `pnpm install`

5. Add Environment Variables:

   - `VITE_CONVEX_URL`: Your Convex deployment URL
   - `VITE_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key (get from Clerk Dashboard)

6. Click **Deploy**

### 2.3 Configure Clerk for Your Production Domain

1. Go to your Clerk Dashboard
2. Navigate to **Domains**
3. Add your Vercel domain (e.g., `your-app.vercel.app`)
4. Update allowed redirect URLs if needed

## Step 3: Alternative Hosting Providers

### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

Create a `netlify.toml` file:

```toml
[build]
  command = "pnpm build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Other Static Hosts (Cloudflare Pages, GitHub Pages, etc.)

Just build your project and deploy the `dist` folder:

```bash
pnpm build
```

Then upload the contents of the `dist` directory to your hosting provider.

## Step 4: Verify Deployment

1. Visit your deployed frontend URL
2. Test authentication (sign up/login with Clerk)
3. Create a workspace and tasks to verify Convex is working
4. Check the browser console for any errors

## Environment Variables Summary

### For Convex (set via `npx convex env set`)

- `CLERK_JWT_ISSUER_DOMAIN`: Your Clerk domain for JWT verification

### For Frontend (set in hosting provider)

- `VITE_CONVEX_URL`: Your production Convex deployment URL
- `VITE_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key

## Troubleshooting

### Authentication Issues

- Verify that your Clerk domain is correctly set in Convex
- Make sure your production domain is added to Clerk's allowed domains
- Check that JWT template is named "convex" in Clerk

### Convex Connection Issues

- Verify `VITE_CONVEX_URL` is set correctly
- Check that Convex functions deployed successfully
- Look at Convex logs: `npx convex logs`

### Build Errors

- Make sure all dependencies are installed: `pnpm install`
- Check for TypeScript errors: `pnpm build`
- Verify Node.js version compatibility

## Continuous Deployment

For automatic deployments on every push:

1. **Convex**: Use `npx convex deploy --cmd 'pnpm build'` in your CI/CD pipeline
2. **Frontend**: Connect your Git repository to Vercel/Netlify for automatic deployments

## Production Checklist

- [ ] Convex deployed: `npx convex deploy`
- [ ] Clerk JWT issuer domain configured in Convex
- [ ] Frontend built successfully: `pnpm build`
- [ ] Environment variables set in hosting provider
- [ ] Production domain added to Clerk
- [ ] Test authentication flow
- [ ] Test core functionality (workspaces, tasks)
- [ ] Custom domain configured (optional)
- [ ] Analytics set up (optional)

## Support

- Convex Documentation: https://docs.convex.dev
- Clerk Documentation: https://clerk.com/docs
- Vercel Documentation: https://vercel.com/docs

---

🎉 Congratulations! Your TaskTree app should now be live in production!
