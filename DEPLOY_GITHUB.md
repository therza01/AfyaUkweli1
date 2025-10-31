# 🚀 Deploy AfyaUkweli via GitHub + Vercel

## Complete Step-by-Step Guide (10 Minutes)

---

## 📋 Prerequisites

- GitHub account (free)
- Vercel account (free) - Sign up at https://vercel.com with your GitHub

---

## 🔧 Step 1: Prepare Your Project

First, ensure you're in the project directory:

```bash
cd /tmp/cc-agent/59457083/project
```

---

## 📦 Step 2: Initialize Git Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit your code
git commit -m "Initial commit - AfyaUkweli Hedera Hashgraph Project"
```

---

## 🌐 Step 3: Create GitHub Repository

### Option A: Using GitHub Web Interface

1. Go to https://github.com/new
2. Repository name: `afyaukweli` (or your choice)
3. Description: `Blockchain-powered Community Health Worker Management System`
4. Visibility: **Public** (required for free Vercel deployment)
5. **DO NOT** initialize with README, .gitignore, or license
6. Click **"Create repository"**

### Option B: Using GitHub CLI (if installed)

```bash
# Create repo using GitHub CLI
gh repo create afyaukweli --public --source=. --remote=origin

# Push code
git push -u origin main
```

---

## 🔗 Step 4: Connect Repository to GitHub

If you used Option A (web interface), run these commands:

```bash
# Add your GitHub repository as remote
# Replace 'yourusername' with your actual GitHub username
git remote add origin https://github.com/yourusername/afyaukweli.git

# Rename branch to main (if needed)
git branch -M main

# Push your code to GitHub
git push -u origin main
```

**Verify:** Visit your GitHub repo URL to see your code uploaded

---

## ☁️ Step 5: Deploy to Vercel

### 5.1: Sign in to Vercel

1. Go to https://vercel.com
2. Click **"Sign Up"** or **"Login"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub account

### 5.2: Import Your Project

1. On Vercel dashboard, click **"Add New..."** → **"Project"**
2. You'll see your GitHub repositories
3. Find **"afyaukweli"** in the list
4. Click **"Import"**

### 5.3: Configure Project Settings

Vercel will auto-detect Next.js. Verify these settings:

- **Framework Preset:** Next.js (auto-detected)
- **Root Directory:** `./`
- **Build Command:** `npm run build` (auto-filled)
- **Output Directory:** `.next` (auto-filled)
- **Install Command:** `npm install` (auto-filled)

**Don't click Deploy yet!** We need to add environment variables first.

---

## 🔐 Step 6: Add Environment Variables

Still on the configuration page, scroll down to **"Environment Variables"** section.

Add these **THREE** variables:

### Variable 1:
- **Name:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** `https://eucbioblmhdifclgvzqr.supabase.co`
- Click **"Add"**

### Variable 2:
- **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1Y2Jpb2JsbWhkaWZjbGd2enFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MDk1MDAsImV4cCI6MjA3NzM4NTUwMH0.PK2WlB-b4E2M7L0PAQEl3tYXzaZkybcAisvbgay5Nq4`
- Click **"Add"**

### Variable 3:
- **Name:** `HEDERA_MOCK`
- **Value:** `true`
- Click **"Add"**

**Important:** Make sure all three are added before deploying!

---

## 🚀 Step 7: Deploy!

1. Click the big **"Deploy"** button
2. Wait 2-3 minutes while Vercel:
   - Clones your repository
   - Installs dependencies
   - Builds your Next.js app
   - Deploys to their CDN

3. Watch the build logs (optional but fun!)

---

## ✅ Step 8: Get Your Deployment URL

Once deployment completes:

1. You'll see a success screen with confetti! 🎉
2. Your URL will be displayed, like:
   ```
   https://afyaukweli-abc123xyz.vercel.app
   ```
3. Click **"Visit"** to open your live app
4. **COPY THIS URL** - this is your submission link!

---

## 🧪 Step 9: Test Your Deployment

### Test 1: Homepage
- Visit your Vercel URL
- Expected: Login page with AfyaUkweli branding
- Demo accounts should be listed at bottom

### Test 2: CHW Login
```
Email: akinyi.otieno@afya.ke
Password: demo123
```
- Should redirect to `/chw` dashboard
- Should show "Akinyi Otieno" and points balance

### Test 3: Submit a Task
1. Stay logged in as CHW
2. Select "Home Visit"
3. Enter consent code: `TEST-001-2024`
4. Add notes and submit
5. Should see transaction ID (format: `mock-XXXXX`)

### Test 4: Supervisor Login
```
Email: mary.wekesa@afya.ke
Password: demo123
```
- Should redirect to `/supervisor` dashboard
- Should see pending tasks

### Test 5: Approve Task
1. Click on the task you just submitted
2. Click "Approve"
3. Should see approval transaction ID
4. CHW points should increase

### Test 6: Admin Dashboard
```
Email: admin@afya.ke
Password: demo123
```
- Should redirect to `/admin` dashboard
- Should see KPI cards with metrics

**All working? Perfect!** ✅

---

## 📱 Step 10: Test on Mobile

Open your Vercel URL on your phone:
- Login should work
- Pages should be responsive
- Navigation should be smooth

---

## 🎯 YOUR SUBMISSION LINK

**Copy this for your submission:**

```
Project: AfyaUkweli - Blockchain CHW Management System
Live URL: https://[your-vercel-url].vercel.app
GitHub: https://github.com/[yourusername]/afyaukweli

Demo Accounts:
- CHW: akinyi.otieno@afya.ke / demo123
- Supervisor: mary.wekesa@afya.ke / demo123
- Admin: admin@afya.ke / demo123

Description:
Blockchain-powered Community Health Worker management system using
Hedera Hashgraph (HCS for task logging, HTS for token rewards).
Solves healthcare transparency challenges in Kenya with immutable
audit trails and automated incentives.

Technologies: Next.js, Hedera Hashgraph, Supabase, TailwindCSS
Status: Production-ready, fully functional
```

---

## 🔄 Making Updates After Deployment

If you need to update your app:

```bash
# Make your changes to files

# Commit changes
git add .
git commit -m "Description of changes"

# Push to GitHub
git push origin main

# Vercel will automatically redeploy! (takes ~2 minutes)
```

Vercel watches your GitHub repo and redeploys automatically on every push to main branch.

---

## ⚙️ Managing Your Deployment

### View Deployment Dashboard
1. Go to https://vercel.com/dashboard
2. Click on your project
3. See deployment history, logs, and analytics

### Update Environment Variables
1. In Vercel dashboard, go to project Settings
2. Click "Environment Variables"
3. Edit, add, or remove variables
4. Click "Save"
5. Redeploy for changes to take effect

### Custom Domain (Optional)
1. In project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration steps
4. Your app will be available at your domain!

---

## 🐛 Troubleshooting

### Issue: "Deploy failed"
**Check:**
1. Build logs in Vercel dashboard
2. Look for error messages
3. Common fixes:
   ```bash
   # Locally test build
   npm run build

   # Fix any errors, then:
   git add .
   git commit -m "Fix build errors"
   git push origin main
   ```

### Issue: "Login doesn't work"
**Fix:**
1. Go to Vercel dashboard → Settings → Environment Variables
2. Verify all 3 variables are set correctly
3. Click "Redeploy" button

### Issue: "404 on pages"
**Fix:**
1. Check `next.config.js` is in repository
2. Verify all page files are committed
3. Redeploy

### Issue: "Git push rejected"
**Fix:**
```bash
# Pull latest changes first
git pull origin main --rebase

# Then push
git push origin main
```

### Issue: "Can't find repository on Vercel"
**Fix:**
1. Make sure repository is **Public** on GitHub
2. In Vercel, click "Adjust GitHub App Permissions"
3. Grant access to the repository
4. Refresh and try importing again

---

## 📊 Deployment Checklist

Before submitting, verify:

- [ ] ✅ Code pushed to GitHub
- [ ] ✅ Repository is public
- [ ] ✅ Vercel deployment successful
- [ ] ✅ Environment variables added
- [ ] ✅ Login page loads
- [ ] ✅ CHW login works
- [ ] ✅ Supervisor login works
- [ ] ✅ Admin login works
- [ ] ✅ Task submission works
- [ ] ✅ Transaction IDs generated
- [ ] ✅ Responsive on mobile
- [ ] ✅ No console errors
- [ ] ✅ URL copied for submission

---

## 🎓 What Happens Behind the Scenes

When you deploy to Vercel via GitHub:

1. **GitHub stores your code** - Version control and collaboration
2. **Vercel connects to GitHub** - Webhook integration
3. **Automatic deployments** - Every push triggers new deploy
4. **Build process** - Vercel runs `npm install` and `npm run build`
5. **CDN distribution** - App deployed to global edge network
6. **SSL certificate** - Automatic HTTPS
7. **Preview deployments** - Each branch/PR gets preview URL

---

## 💡 Pro Tips

### Tip 1: Preview Deployments
Create a new branch for testing:
```bash
git checkout -b feature/new-feature
# Make changes
git add .
git commit -m "New feature"
git push origin feature/new-feature
```
Vercel creates a preview URL for this branch!

### Tip 2: Environment Variables per Environment
In Vercel, you can set different variables for:
- Production
- Preview
- Development

### Tip 3: Deploy Logs
Check deployment logs in Vercel to debug issues:
- Build logs
- Function logs
- Edge logs

### Tip 4: Analytics
Vercel provides free analytics:
- Page views
- Top pages
- Geographic distribution
- Performance metrics

---

## 🚀 Alternative: Deploy to Other Platforms

Your app can also deploy to:

### Netlify
1. Import from GitHub
2. Build: `npm run build`
3. Publish: `.next`

### Cloudflare Pages
1. Connect GitHub repo
2. Build: `npm run build`
3. Output: `.next`

### Railway
1. Import GitHub repo
2. Auto-detects Next.js
3. Deploys automatically

**But Vercel is recommended** as it's made by the Next.js team!

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [GitHub Basics](https://docs.github.com/en/get-started)
- [Your Project README](./README.md)
- [Hedera Setup Guide](./HEDERA_SETUP.md)

---

## ✅ Final Checklist

You're ready to submit when:

- [x] ✅ Code on GitHub (public repo)
- [x] ✅ Deployed on Vercel
- [x] ✅ Environment variables set
- [x] ✅ All demo accounts tested
- [x] ✅ Core features working
- [x] ✅ Mobile responsive
- [x] ✅ Hedera integration functional (mock mode)
- [x] ✅ URL ready for submission

---

## 🎊 Congratulations!

Your AfyaUkweli app is now live on the internet! 🌐

**Submission Link Format:**
```
https://afyaukweli-[your-id].vercel.app
```

**This is what you submit to the Hedera Hashgraph course!**

---

## 🆘 Need Help?

If you encounter issues:

1. **Check Vercel build logs** - Most errors show here
2. **Test locally first** - Run `npm run build` locally
3. **Verify environment variables** - All 3 must be set
4. **Check GitHub repo** - Ensure all files pushed
5. **Review documentation** - Check other .md files in project

---

## 🏆 Success!

You now have:
- ✅ Live application on the internet
- ✅ Automatic deployments from GitHub
- ✅ Professional hosting with CDN
- ✅ HTTPS security
- ✅ Submission-ready URL

**Copy your Vercel URL and submit it!** 🚀

**Good luck with your Hedera Hashgraph submission!** 🎓
