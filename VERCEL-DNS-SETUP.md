# Vercel DNS Configuration for potterychicago.com

## Current Status
✅ **Domain Added to Vercel Project**: Both `potterychicago.com` and `www.potterychicago.com` have been added to the `pottery-chicago` project.

⚠️ **DNS Configuration Required**: The domain is currently pointing to GitHub Pages. You need to update your DNS records to point to Vercel.

## Step 1: Update DNS Records in Namecheap

### Option A: Using A Records (Recommended for Root Domain)

1. Log in to your Namecheap account
2. Go to **Domain List** → Click **Manage** next to `potterychicago.com`
3. Go to the **Advanced DNS** tab
4. **Remove existing GitHub Pages A records** (if any):
   - Delete any A records pointing to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, or `185.199.111.153`
5. **Add Vercel A record for root domain**:
   ```
   Type: A Record
   Host: @
   Value: 76.76.21.21
   TTL: Automatic (or 30 min)
   ```
6. **For www subdomain**, you have two options:

   **Option 6a: CNAME Record (Recommended for www)**
   ```
   Type: CNAME Record
   Host: www
   Value: cname.vercel-dns.com
   TTL: Automatic (or 30 min)
   ```
   
   **OR Option 6b: A Record**
   ```
   Type: A Record
   Host: www
   Value: 76.76.21.21
   TTL: Automatic (or 30 min)
   ```

### Option B: Using Vercel Nameservers (Alternative - Simpler)

If you prefer to let Vercel manage all DNS:

1. In Namecheap, go to **Domain List** → **Manage** → **Nameservers**
2. Select **Custom DNS**
3. Enter Vercel's nameservers:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
4. Save changes
5. Vercel will automatically configure all DNS records

## Step 2: Wait for DNS Propagation

- DNS changes typically take **15 minutes to 48 hours** to propagate
- Usually completes within 1-2 hours
- You can check propagation status at: https://www.whatsmydns.net/#A/potterychicago.com

## Step 3: Verify Domain in Vercel

After DNS propagation:

1. Vercel will automatically verify the domain (you'll receive an email)
2. Check domain status: `vercel domains inspect potterychicago.com`
3. The domain should show as "Verified" ✅

## Step 4: Test Your Site

Once DNS has propagated and Vercel has verified:

1. Visit `https://potterychicago.com` - should load your Vercel deployment
2. Visit `https://www.potterychicago.com` - should also work
3. Verify you see the new "Current Courses" section with "New Added" tag

## Current Vercel Deployment

- **Project**: pottery-chicago
- **Latest Production URL**: https://pottery-chicago.vercel.app
- **Custom Domain**: potterychicago.com (pending DNS configuration)
- **Latest Deployment**: https://pottery-chicago-2zych4pk7-blindls-projects.vercel.app

## Troubleshooting

### Domain not working after 48 hours:
1. Verify DNS records are correct in Namecheap
2. Check that old GitHub Pages records are removed
3. Clear your browser cache and try incognito mode
4. Check DNS propagation status
5. Verify domain in Vercel dashboard: https://vercel.com/blindls-projects/pottery-chicago/settings/domains

### HTTPS not working:
1. Vercel automatically provides SSL certificates
2. Wait for DNS propagation to complete
3. Vercel will issue SSL certificate automatically (can take up to 24 hours after DNS is configured)

### Still seeing old content:
1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
2. Try incognito/private browsing mode
3. Verify you're accessing the correct domain (not cached GitHub Pages version)

## Important Notes

- **GitHub Pages**: The domain was previously configured for GitHub Pages. Make sure to remove those DNS records.
- **Automatic SSL**: Vercel automatically provides SSL certificates via Let's Encrypt
- **Deployment**: All changes are already deployed to Vercel and will be live once DNS is updated

## Quick Reference

**Vercel A Record IP**: `76.76.21.21`  
**Vercel CNAME**: `cname.vercel-dns.com`  
**Vercel Nameservers**: `ns1.vercel-dns.com`, `ns2.vercel-dns.com`

