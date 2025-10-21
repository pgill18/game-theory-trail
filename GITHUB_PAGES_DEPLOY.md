# 🚀 GitHub Pages Deployment - Step by Step

Your Game Theory Trail is ready to deploy to GitHub Pages!

---

## ✅ What's Already Done

- ✅ Git repository initialized
- ✅ Initial commit created (44 files)
- ✅ `gh-pages` package installed
- ✅ Deploy scripts configured
- ✅ Vite base path set to `/game-theory-trail/`
- ✅ Production build tested

---

## 📝 Next Steps (5 minutes)

### Step 1: Create GitHub Repository

1. **Go to GitHub:** https://github.com/new

2. **Fill in the details:**
   - **Repository name:** `game-theory-trail`
   - **Description:** `Game Theory Trail - Interactive prisoner's dilemma game`
   - **Visibility:** Public (required for free GitHub Pages)
   - **DO NOT** initialize with README, .gitignore, or license (we already have them)

3. **Click "Create repository"**

---

### Step 2: Connect Your Local Repository

Copy and run these commands:

```bash
# Add GitHub as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/game-theory-trail.git

# Verify remote was added
git remote -v
```

**Example:**
If your GitHub username is `johndoe`:
```bash
git remote add origin https://github.com/johndoe/game-theory-trail.git
```

---

### Step 3: Push to GitHub

```bash
# Push your code to GitHub
git push -u origin main
```

You might be asked to log in to GitHub. Use your credentials or a personal access token.

---

### Step 4: Deploy to GitHub Pages

```bash
# This will build and deploy automatically!
npm run deploy
```

This command will:
1. Run `npm run build` (build production files)
2. Create/update the `gh-pages` branch
3. Push the `dist` folder to that branch
4. GitHub Pages will automatically serve from there

---

### Step 5: Enable GitHub Pages

1. **Go to your repository on GitHub:**
   `https://github.com/YOUR_USERNAME/game-theory-trail`

2. **Click on "Settings"** tab

3. **Click "Pages"** in the left sidebar

4. **Configure:**
   - **Source:** Deploy from a branch
   - **Branch:** `gh-pages` (select from dropdown)
   - **Folder:** `/ (root)`

5. **Click "Save"**

6. **Wait 1-2 minutes** for GitHub to build and deploy

---

## 🎉 Your Site is Live!

Your game will be available at:

```
https://YOUR_USERNAME.github.io/game-theory-trail/
```

**Example:**
If your username is `johndoe`:
```
https://johndoe.github.io/game-theory-trail/
```

---

## 🔄 Making Updates

After you make changes to your code:

```bash
# 1. Add changes
git add .

# 2. Commit
git commit -m "Description of your changes"

# 3. Push to GitHub
git push

# 4. Deploy updated version
npm run deploy
```

Your site will update in 1-2 minutes!

---

## 🐛 Troubleshooting

### "Permission denied (publickey)"

You need to authenticate with GitHub. Options:

**Option A: HTTPS with Token**
```bash
# When asked for password, use a Personal Access Token
# Create one at: https://github.com/settings/tokens
```

**Option B: SSH**
```bash
# Use SSH URL instead
git remote set-url origin git@github.com:YOUR_USERNAME/game-theory-trail.git
```

### "gh-pages not found"

This is normal on first deploy! GitHub creates the branch automatically. Just wait and check your repository's branches.

### "404 Page not found"

1. Check that GitHub Pages is enabled (Settings → Pages)
2. Verify branch is set to `gh-pages`
3. Wait 1-2 minutes for deployment
4. Check the Actions tab for deployment status

### Deploy fails

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json dist
npm install
npm run build
npm run deploy
```

---

## 📊 Check Deployment Status

1. **Go to your repo on GitHub**
2. **Click "Actions" tab**
3. **Look for "pages build and deployment"**
4. **Green checkmark** = deployed successfully!

---

## 🎨 Custom Domain (Optional)

Want to use your own domain like `gametheory.yourdomain.com`?

1. **Buy a domain** (from Namecheap, Google Domains, etc.)

2. **Add DNS records:**
   ```
   Type: CNAME
   Name: gametheory (or whatever subdomain)
   Value: YOUR_USERNAME.github.io
   ```

3. **In GitHub Pages settings:**
   - Enter your custom domain
   - Enable "Enforce HTTPS"

---

## 📈 Analytics (Optional)

Want to track visitors?

1. **Get Google Analytics ID** from https://analytics.google.com

2. **Create `.env` file:**
   ```env
   VITE_GA_ID=G-XXXXXXXXXX
   ```

3. **Add to your app** (in `src/main.tsx`):
   ```typescript
   // Add Google Analytics script
   ```

---

## ✅ Quick Checklist

Before deploying, make sure:

- [ ] GitHub repository created
- [ ] Remote added (`git remote -v` shows origin)
- [ ] Code pushed to GitHub (`git push`)
- [ ] Deployed (`npm run deploy`)
- [ ] GitHub Pages enabled (Settings → Pages)
- [ ] Site loads at `https://YOUR_USERNAME.github.io/game-theory-trail/`

---

## 🎯 Quick Commands Summary

```bash
# Initial setup (do once)
git remote add origin https://github.com/YOUR_USERNAME/game-theory-trail.git
git push -u origin main
npm run deploy

# Future updates (do every time you make changes)
git add .
git commit -m "Your message"
git push
npm run deploy
```

---

## 🆘 Need Help?

**Check deployment status:**
```bash
# See what branch you're on
git branch

# See remotes
git remote -v

# See recent commits
git log --oneline -5
```

**Test locally first:**
```bash
npm run build
npm run preview
# Visit http://localhost:4173/game-theory-trail/
```

---

## 🎊 You're Ready!

Everything is set up. Just follow the steps above and your game will be live!

**Your deployment URL will be:**
```
https://YOUR_USERNAME.github.io/game-theory-trail/
```

Share it with the world! 🌍✨

---

**Any issues? Let me know and I'll help troubleshoot!**
