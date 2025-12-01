# Namecheap DNS Configuration for potterychicago.com

## Overview
This guide will help you configure your Namecheap DNS to point your custom domain `potterychicago.com` to GitHub Pages.

## Step 1: Enable Custom Domain in GitHub Pages

1. Go to your GitHub repository: `https://github.com/blindldev/pottery-booking-flow`
2. Navigate to **Settings** → **Pages**
3. Under **Custom domain**, enter: `potterychicago.com`
4. Check **Enforce HTTPS** (recommended)
5. Click **Save**

GitHub will create a CNAME record. Wait a few minutes for it to propagate.

## Step 2: Configure Namecheap DNS Records

### Option A: Using Namecheap's DNS (Recommended)

1. Log in to your Namecheap account
2. Go to **Domain List** → Click **Manage** next to `potterychicago.com`
3. Go to the **Advanced DNS** tab
4. Delete any existing A records for the root domain (if any)
5. Add the following records:

#### A Records (for root domain):
Add these 4 A records pointing to GitHub Pages IPs:
```
Type: A Record
Host: @
Value: 185.199.108.153
TTL: Automatic (or 30 min)

Type: A Record
Host: @
Value: 185.199.109.153
TTL: Automatic (or 30 min)

Type: A Record
Host: @
Value: 185.199.110.153
TTL: Automatic (or 30 min)

Type: A Record
Host: @
Value: 185.199.111.153
TTL: Automatic (or 30 min)
```

#### CNAME Record (for www subdomain):
```
Type: CNAME Record
Host: www
Value: blindldev.github.io
TTL: Automatic (or 30 min)
```

### Option B: Using GitHub's Nameservers (Alternative)

If you prefer to use GitHub's nameservers:

1. In Namecheap, go to **Domain List** → **Manage** → **Nameservers**
2. Select **Custom DNS**
3. Enter GitHub's nameservers:
   ```
   dns1.p08.nsone.net
   dns2.p08.nsone.net
   dns3.p08.nsone.net
   dns4.p08.nsone.net
   ```
4. Save changes
5. Configure DNS records in GitHub Pages settings

## Step 3: Verify Configuration

After updating DNS records:

1. **Wait 24-48 hours** for DNS propagation (usually faster, but can take up to 48 hours)
2. Check DNS propagation: Use https://www.whatsmydns.net/#A/potterychicago.com
3. Verify HTTPS: Visit https://potterychicago.com (should show GitHub Pages site)
4. Check GitHub Pages settings: The custom domain should show as "Verified" with a green checkmark

## Step 4: Test Your Site

Once DNS has propagated:

1. Visit `https://potterychicago.com` - should load your site
2. Visit `https://www.potterychicago.com` - should redirect to root domain
3. Test all forms:
   - Private Bookings
   - Instructor Applications
   - Collaborations
   - Contact Form

## Important Notes

- **DNS Propagation**: Changes can take anywhere from a few minutes to 48 hours to fully propagate
- **HTTPS**: GitHub Pages automatically provides SSL certificates via Let's Encrypt once DNS is configured
- **CNAME File**: The `public/CNAME` file has been created with `potterychicago.com` - this is required for custom domains
- **Base Path**: The Vite config has been updated to use `/` instead of `/pottery-booking-flow/` for the custom domain

## Troubleshooting

### Site not loading after 48 hours:
1. Verify DNS records are correct in Namecheap
2. Check GitHub Pages settings show the domain as verified
3. Clear your browser cache and try incognito mode
4. Check DNS propagation status

### HTTPS not working:
1. Ensure "Enforce HTTPS" is enabled in GitHub Pages settings
2. Wait for Let's Encrypt certificate to be issued (can take up to 24 hours)
3. Clear browser cache

### Forms not working:
1. Verify the `.env` file has `VITE_AWS_API_URL` set (this is NOT committed to GitHub)
2. For production, you'll need to set this as a GitHub Actions secret or use environment variables
3. The API URL should be: `https://mg9brncx39.execute-api.us-east-2.amazonaws.com/prod/booking`

## Setting Environment Variables for Production

Since `.env` files are not committed, you have two options:

### Option 1: GitHub Actions Secrets (Recommended)
1. Go to repository **Settings** → **Secrets and variables** → **Actions**
2. Add a new secret:
   - Name: `VITE_AWS_API_URL`
   - Value: `https://mg9brncx39.execute-api.us-east-2.amazonaws.com/prod/booking`
3. Update `.github/workflows/deploy.yml` to use the secret during build

### Option 2: Build-time Environment Variables
Update the GitHub Actions workflow to set the environment variable during build.

## Current Configuration

- **Repository**: blindldev/pottery-booking-flow
- **GitHub Pages URL**: https://blindldev.github.io/pottery-booking-flow/
- **Custom Domain**: potterychicago.com
- **AWS API Gateway**: https://mg9brncx39.execute-api.us-east-2.amazonaws.com/prod/

