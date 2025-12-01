# GitHub Pages Setup for potterychicago.com

## Current Issue: 404 Error

The 404 error means DNS is working (pointing to GitHub Pages), but the site needs to be configured.

## ✅ What I Just Did:

1. ✅ Committed `public/CNAME` file with `potterychicago.com`
2. ✅ Updated `vite.config.js` to use root path `/`
3. ✅ Updated GitHub Actions workflow
4. ✅ Pushed changes to trigger deployment

## 🔧 Next Steps (Do These Now):

### Step 1: Configure Custom Domain in GitHub

1. Go to: **https://github.com/blindldev/pottery-booking-flow/settings/pages**
2. Under **Custom domain**, enter: `potterychicago.com`
3. Check **Enforce HTTPS**
4. Click **Save**

**Important:** GitHub will automatically create/update the CNAME record when you save.

### Step 2: Wait for Deployment

1. Go to: **https://github.com/blindldev/pottery-booking-flow/actions**
2. Check that the deployment workflow is running/completed
3. Wait 1-2 minutes for the deployment to finish

### Step 3: Verify DNS Configuration

Your Namecheap DNS should have:

**A Records (4 total):**
- `@` → `185.199.108.153`
- `@` → `185.199.109.153`
- `@` → `185.199.110.153`
- `@` → `185.199.111.153`

**CNAME Record:**
- `www` → `blindldev.github.io`

### Step 4: Check GitHub Pages Status

After saving the custom domain in GitHub:
1. Go back to **Settings** → **Pages**
2. The custom domain should show as **"Verified"** with a green checkmark
3. If it shows "Not verified", wait a few minutes and refresh

## ⏱️ Timeline:

- **Deployment**: 1-2 minutes after push
- **DNS Verification**: 5-15 minutes after setting custom domain
- **HTTPS Certificate**: 5-30 minutes after DNS verification
- **Full Propagation**: Up to 24 hours (usually much faster)

## 🔍 Troubleshooting:

### Still seeing 404 after 10 minutes?

1. **Check GitHub Actions**: Make sure deployment completed successfully
   - Go to: https://github.com/blindldev/pottery-booking-flow/actions
   - Look for green checkmark on latest workflow run

2. **Verify Custom Domain**: 
   - Go to: https://github.com/blindldev/pottery-booking-flow/settings/pages
   - Ensure `potterychicago.com` is listed and verified

3. **Check DNS**:
   - Visit: https://www.whatsmydns.net/#A/potterychicago.com
   - Should show the 4 GitHub Pages IPs

4. **Clear Browser Cache**:
   - Try incognito/private window
   - Hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)

### If Custom Domain Shows "Not Verified":

1. Double-check DNS records in Namecheap
2. Wait 10-15 minutes for DNS propagation
3. Try removing and re-adding the custom domain in GitHub
4. Ensure the CNAME file in `public/CNAME` contains exactly: `potterychicago.com` (no www, no trailing slash)

## ✅ Once Working:

You should see:
- ✅ Site loads at `https://potterychicago.com`
- ✅ HTTPS certificate active (green lock)
- ✅ All forms working (API URL is set via GitHub Secret)
- ✅ No 404 errors

## 📝 Current Status:

- ✅ CNAME file committed
- ✅ Vite config updated for custom domain
- ✅ GitHub Actions workflow ready
- ✅ Changes pushed to main branch
- ⏳ **Waiting for you to set custom domain in GitHub Settings**

