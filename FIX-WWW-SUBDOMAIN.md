# Fix www.potterychicago.com Configuration

## Issue
GitHub Pages is reporting that `www.potterychicago.com` is not properly configured with a CNAME record.

## Solution: Update Namecheap DNS

### Step 1: Log into Namecheap

1. Go to https://www.namecheap.com and log in
2. Navigate to **Domain List**
3. Click **Manage** next to `potterychicago.com`

### Step 2: Go to Advanced DNS

1. Click on the **Advanced DNS** tab
2. Look for existing records for `www`

### Step 3: Fix the www CNAME Record

**If a www record exists:**
1. Find the existing `www` record
2. Click the **pencil/edit icon** next to it
3. Make sure it's set to:
   - **Type**: CNAME Record
   - **Host**: www
   - **Value**: `blindldev.github.io` (exactly this, no trailing slash)
   - **TTL**: Automatic (or 30 min)
4. Click **Save** (checkmark icon)

**If no www record exists:**
1. Click **Add New Record**
2. Select **CNAME Record**
3. Set:
   - **Host**: `www`
   - **Value**: `blindldev.github.io`
   - **TTL**: Automatic (or 30 min)
4. Click **Save** (checkmark icon)

### Step 4: Verify Root Domain A Records

Make sure you have these 4 A records for the root domain (`@`):

1. **A Record**
   - Host: `@`
   - Value: `185.199.108.153`
   - TTL: Automatic

2. **A Record**
   - Host: `@`
   - Value: `185.199.109.153`
   - TTL: Automatic

3. **A Record**
   - Host: `@`
   - Value: `185.199.110.153`
   - TTL: Automatic

4. **A Record**
   - Host: `@`
   - Value: `185.199.111.153`
   - TTL: Automatic

### Step 5: Wait for DNS Propagation

1. **Wait 5-15 minutes** for DNS changes to propagate
2. Check DNS propagation: https://www.whatsmydns.net/#CNAME/www.potterychicago.com
   - Should show: `blindldev.github.io`
3. Go back to GitHub Pages settings: https://github.com/blindldev/pottery-booking-flow/settings/pages
4. The error should disappear once DNS propagates

## Common Mistakes to Avoid

❌ **Don't use**: `blindldev.github.io/pottery-booking-flow` (no path)
✅ **Do use**: `blindldev.github.io` (just the domain)

❌ **Don't use**: `www.blindldev.github.io` (no www prefix)
✅ **Do use**: `blindldev.github.io` (root domain)

❌ **Don't use**: A Record for www (must be CNAME)
✅ **Do use**: CNAME Record for www

## Expected Result

After DNS propagates:
- ✅ `potterychicago.com` works (via A records)
- ✅ `www.potterychicago.com` redirects to `potterychicago.com` (via CNAME)
- ✅ GitHub Pages shows no errors
- ✅ Both domains work with HTTPS

## Quick Reference

**Namecheap DNS Records Needed:**

```
Type: A Record
Host: @
Value: 185.199.108.153

Type: A Record
Host: @
Value: 185.199.109.153

Type: A Record
Host: @
Value: 185.199.110.153

Type: A Record
Host: @
Value: 185.199.111.153

Type: CNAME Record
Host: www
Value: blindldev.github.io
```

## Verification

After making changes, verify:
1. Check DNS: https://www.whatsmydns.net/#CNAME/www.potterychicago.com
2. Check GitHub: https://github.com/blindldev/pottery-booking-flow/settings/pages
3. Test site: https://www.potterychicago.com (should redirect to https://potterychicago.com)

