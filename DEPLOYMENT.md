# Deployment Guide for Festiscrape

This guide will help you deploy your Festiscrape application to make it available on other computers.

## Option 1: Deploy to Vercel (Recommended)

Vercel is the platform created by the team behind Next.js and offers the easiest deployment experience.

### Prerequisites
- A GitHub account
- Your code pushed to a GitHub repository

### Steps

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Sign up for Vercel**
   - Go to [Vercel](https://vercel.com/)
   - Sign up or log in with your GitHub account

3. **Import your project**
   - Click on "Add New..." and select "Project"
   - Select your GitHub repository
   - Vercel will automatically detect that it's a Next.js project

4. **Configure environment variables**
   - In the "Environment Variables" section, add:
     - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

5. **Deploy**
   - Click "Deploy" and Vercel will build and deploy your application
   - Once deployed, Vercel will provide you with a URL (e.g., `https://festiscrape.vercel.app`)

## Option 2: Deploy to Netlify

Netlify is another popular platform for deploying web applications.

### Steps

1. **Push your code to GitHub** (same as above)

2. **Sign up for Netlify**
   - Go to [Netlify](https://www.netlify.com/)
   - Sign up or log in with your GitHub account

3. **Import your project**
   - Click on "Add new site" > "Import an existing project"
   - Select your GitHub repository

4. **Configure build settings**
   - Build command: `npm run build`
   - Publish directory: `.next`

5. **Configure environment variables**
   - Go to Site settings > Build & deploy > Environment
   - Add your Supabase environment variables

6. **Deploy**
   - Click "Deploy site" and Netlify will build and deploy your application

## Option 3: Deploy to Supabase Hosting

Since you're already using Supabase, you can also deploy your application using Supabase Hosting.

### Steps

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**
   ```bash
   supabase login
   ```

3. **Initialize Supabase project**
   ```bash
   supabase init
   ```

4. **Deploy to Supabase**
   ```bash
   supabase deploy
   ```

## Sharing Your Application

Once deployed, you can share the URL with others. They will be able to access your application from any device with a web browser.

## Local Development

For local development, you can still use:
```bash
npm run dev
```

This will start your application on `http://localhost:3000` (or another port if 3000 is in use). 