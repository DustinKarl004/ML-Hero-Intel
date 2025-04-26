# Frontend Deployment Guide

This guide outlines the steps to deploy the ML Hero Intel frontend application to Vercel.

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Git
- A [Vercel](https://vercel.com) account
- [Vercel CLI](https://vercel.com/docs/cli) (optional)
- Firebase project (see Backend Deployment Guide)

## Step 1: Prepare Your Environment Variables

1. Create a `.env.local` file in the frontend directory with your Firebase configuration:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

2. You can find these values in your Firebase console:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Click on the web app icon (</>) in the Project Overview
   - Register a new web app if you haven't already
   - Copy the configuration values

## Step 2: Test Your Application Locally

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Ensure your application is working correctly at `http://localhost:3000`

## Step 3: Deploy to Vercel

### Option 1: Deploy via Git Integration (Recommended)

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Log in to your [Vercel dashboard](https://vercel.com/dashboard)

3. Click "New Project"

4. Import your Git repository

5. Configure the project:
   - Set the Framework Preset to "Next.js"
   - Set the Root Directory to "frontend"
   - Add Environment Variables (from your `.env.local` file)

6. Click "Deploy"

### Option 2: Deploy via Vercel CLI

1. Install Vercel CLI globally:
```bash
npm install -g vercel
```

2. Log in to Vercel:
```bash
vercel login
```

3. Deploy from the frontend directory:
```bash
cd frontend
vercel
```

4. Follow the CLI prompts to configure your project

5. To deploy to production:
```bash
vercel --prod
```

## Step 4: Configure Custom Domain (Optional)

1. Go to your project in the Vercel dashboard

2. Click on "Domains"

3. Add your custom domain and follow the verification steps

4. Update your DNS settings as instructed by Vercel

## Step 5: Set Up Continuous Deployment

With Git integration, Vercel automatically deploys when you push changes to your repository. You can configure branch deployments:

1. Go to your project settings in Vercel

2. Under "Git", configure:
   - Production Branch (usually `main` or `master`)
   - Preview Branches (development branches)

## Step 6: Post-Deployment Verification

1. Check that your application is working on the Vercel deployment URL

2. Verify that Firebase Authentication and Firestore connections are working

3. Test user flows: signup, login, viewing hero data, etc.

## Troubleshooting

### Firebase Connection Issues

- Verify environment variables are correctly set in Vercel
- Ensure Firebase Security Rules allow your deployed application to access Firestore
- Check browser console for any CORS errors

### Build Failures

- Review Vercel build logs for errors
- Common issues include:
  - Missing dependencies
  - Incompatible Node.js version
  - Environment variable configuration problems

### Performance Optimization

1. Enable Vercel Edge Functions for improved performance

2. Configure Next.js Image Optimization:
```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
}
```

## Maintenance

1. Monitor your Vercel dashboard for:
   - Deployment status
   - Error rates
   - Performance metrics

2. Set up Vercel status notifications (email or Slack)

3. Update dependencies regularly:
```bash
npm outdated
npm update
```

## Cost Estimation

- Vercel's Hobby plan is free and includes:
  - Unlimited personal projects
  - Basic analytics
  - Automated deployments
  - Serverless functions (limited execution)

- For production applications, consider:
  - Pro plan ($20/month): Team collaboration, more serverless function execution
  - Enterprise plan: Custom pricing, dedicated support, advanced security

## Security Notes

1. Never commit `.env` files to your repository
2. Use Vercel's environment variable management for sensitive information
3. Set up two-factor authentication for your Vercel account
4. Regularly rotate API keys and update them in Vercel 