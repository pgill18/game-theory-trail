# 🚀 Game Theory Trail - Deployment Guide

Complete guide to deploy your Game Theory Trail app to production.

---

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git (for deploying to platforms)

---

## 🏃 Quick Start (Local Development)

### 1. Install Dependencies
```bash
cd /Users/pgill/Projects/games/tit-for-tat/vibed
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:5173` to see your app!

### 3. Build for Production
```bash
npm run build
```

### 4. Preview Production Build
```bash
npm run preview
```

---

## 🌐 Deployment Options

Choose your preferred hosting platform:

### Option 1: Vercel (Recommended) ⚡

**Why Vercel?**
- ✅ Free tier with generous limits
- ✅ Automatic HTTPS
- ✅ Zero configuration needed
- ✅ Automatic deployments on git push
- ✅ Fast global CDN

**Steps:**

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd /Users/pgill/Projects/games/tit-for-tat/vibed
   vercel
   ```

3. **Follow the prompts:**
   - Set up and deploy? `Y`
   - Which scope? (Select your account)
   - Link to existing project? `N`
   - What's your project's name? `game-theory-trail`
   - In which directory is your code located? `./`
   - Want to override settings? `N`

4. **Production Deployment**
   ```bash
   vercel --prod
   ```

**Your app is now live!** 🎉

Vercel will give you a URL like: `https://game-theory-trail.vercel.app`

---

### Option 2: Netlify 🌊

**Why Netlify?**
- ✅ Free tier with good limits
- ✅ Drag-and-drop deployment
- ✅ Form handling (if needed later)
- ✅ Easy custom domains

**Method A: Drag & Drop (Easiest)**

1. Build your app:
   ```bash
   npm run build
   ```

2. Go to [app.netlify.com](https://app.netlify.com)

3. Sign up/Login

4. Drag the `dist` folder to Netlify

5. **Done!** Your app is live!

**Method B: CLI Deployment**

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login**
   ```bash
   netlify login
   ```

3. **Deploy**
   ```bash
   cd /Users/pgill/Projects/games/tit-for-tat/vibed
   netlify deploy
   ```

4. **Production**
   ```bash
   netlify deploy --prod
   ```

**Method C: Git-based Deployment**

1. Push your code to GitHub/GitLab/Bitbucket

2. Go to [app.netlify.com](https://app.netlify.com)

3. Click "New site from Git"

4. Connect your repository

5. Configure:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`

6. Click "Deploy site"

---

### Option 3: GitHub Pages 🐙

**Why GitHub Pages?**
- ✅ Free hosting for public repos
- ✅ Integrated with GitHub
- ✅ Simple setup

**Steps:**

1. **Add to package.json:**
   ```json
   {
     "homepage": "https://YOUR_USERNAME.github.io/game-theory-trail"
   }
   ```

2. **Install gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

3. **Add deploy scripts to package.json:**
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

4. **Create Git repository (if not already):**
   ```bash
   cd /Users/pgill/Projects/games/tit-for-tat/vibed
   git init
   git add .
   git commit -m "Initial commit"
   ```

5. **Create GitHub repository** at github.com/new

6. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/game-theory-trail.git
   git branch -M main
   git push -u origin main
   ```

7. **Deploy:**
   ```bash
   npm run deploy
   ```

8. **Enable GitHub Pages:**
   - Go to repo Settings → Pages
   - Source: `gh-pages` branch
   - Click Save

**Live at:** `https://YOUR_USERNAME.github.io/game-theory-trail`

---

### Option 4: Cloudflare Pages ☁️

**Why Cloudflare Pages?**
- ✅ Free unlimited bandwidth
- ✅ Fast global CDN
- ✅ Great performance

**Steps:**

1. Push code to GitHub

2. Go to [pages.cloudflare.com](https://pages.cloudflare.com)

3. Connect GitHub account

4. Select repository

5. Configure build:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output:** `dist`

6. Click "Save and Deploy"

---

## 🔧 Build Configuration

### Environment Variables

If you need environment variables (for analytics, APIs, etc.):

Create `.env` file:
```env
VITE_APP_NAME=Game Theory Trail
VITE_ANALYTICS_ID=your-analytics-id
```

Access in code:
```typescript
const appName = import.meta.env.VITE_APP_NAME;
```

**For deployment platforms:**
- **Vercel:** Add in dashboard under Settings → Environment Variables
- **Netlify:** Add in dashboard under Site settings → Environment variables
- **GitHub Pages:** Use GitHub Secrets

### Custom Domain

**Vercel:**
1. Go to project settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed

**Netlify:**
1. Site settings → Domain management
2. Add custom domain
3. Follow DNS instructions

**GitHub Pages:**
1. Settings → Pages → Custom domain
2. Add domain and verify

---

## 🧪 Testing Your Deployment

### Pre-deployment Checklist

- [ ] Run `npm run build` successfully
- [ ] Run `npm run preview` and test locally
- [ ] Test all game features:
  - [ ] Strategy selection
  - [ ] Platform clicking
  - [ ] Playing rounds
  - [ ] Leaderboards
  - [ ] Modals
  - [ ] Auto-play
  - [ ] Keyboard navigation (C/D/Escape)
- [ ] Test on mobile devices
- [ ] Check browser console for errors

### After Deployment

- [ ] Visit deployed URL
- [ ] Test all features in production
- [ ] Check mobile responsiveness
- [ ] Test on different browsers
- [ ] Verify HTTPS is working
- [ ] Check page load speed

---

## 🎯 Recommended: Vercel Deployment

**For the fastest deployment right now:**

```bash
# 1. Install dependencies
npm install

# 2. Install Vercel CLI
npm install -g vercel

# 3. Deploy!
vercel
```

That's it! Your app will be live in ~60 seconds. 🚀

---

## 📊 Performance Tips

### Optimize Build
```bash
# Check bundle size
npm run build

# Preview production build
npm run preview
```

### Analytics (Optional)

Add Google Analytics or Plausible:

```typescript
// In src/main.tsx
import { initAnalytics } from './analytics';

initAnalytics();
```

---

## 🐛 Troubleshooting

### Build Fails

**Error: Module not found**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**TypeScript Errors**
```bash
# Check for errors
npm run typecheck

# Fix imports and types
```

### Deployment Issues

**Vercel: Build failed**
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Node version: Use Node 18+ (set in Vercel settings if needed)

**Netlify: 404 errors**
- Ensure `netlify.toml` is in root
- Check build output directory is `dist`
- Verify redirects are configured

**GitHub Pages: Blank page**
- Check `homepage` in package.json
- Ensure you're using `HashRouter` or proper routing
- Check browser console for errors

---

## 🔄 Continuous Deployment

Once set up with Git-based deployment (Vercel/Netlify):

```bash
# Make changes
git add .
git commit -m "Update game"
git push

# Your site automatically redeploys! 🎉
```

---

## 📝 Post-Deployment

### Share Your Game!
- Tweet the link
- Share on Reddit
- Post in game theory communities
- Add to your portfolio

### Monitor
- Check analytics (if added)
- Monitor error logs
- Get user feedback

### Update
- Fix bugs quickly
- Add new strategies
- Enhance features
- Push updates via git

---

## 🎉 You're Live!

Your Game Theory Trail is now accessible to the world!

**Next steps:**
1. Test thoroughly
2. Share with friends
3. Gather feedback
4. Iterate and improve

---

## 📞 Need Help?

- **Vite Docs:** https://vitejs.dev
- **Vercel Docs:** https://vercel.com/docs
- **Netlify Docs:** https://docs.netlify.com
- **React Docs:** https://react.dev

---

**Happy Deploying! 🚀**
