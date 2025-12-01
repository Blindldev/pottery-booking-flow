# AWS Connection Checklist - What to Get from Your Other Project

## Required Information

### 1. API Gateway Endpoint URL ⭐ **MOST IMPORTANT**
Look for:
- `.env` file with `VITE_AWS_API_URL` or similar
- Environment variables
- Configuration files
- The actual API Gateway URL format: `https://[api-id].execute-api.[region].amazonaws.com/[stage]/[resource]`

**Example:**
```
VITE_AWS_API_URL=https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod/booking
```

### 2. AWS Region
- Which region is your API Gateway in? (e.g., us-east-1, us-west-2)
- This is needed for SES configuration in Lambda

### 3. DynamoDB Table Name
- What's the exact table name?
- Default we're using: `PotteryBookings`
- Check if your other project uses a different naming convention

### 4. Lambda Function Configuration
From your other project, check:
- Lambda function name
- Runtime (Node.js version - should be 18.x or 20.x)
- Environment variables set in Lambda
- IAM role name (for reference)

### 5. SES Configuration
- Is the email `PotteryChicago@gmail.com` already verified in SES?
- What region is SES configured in?
- Is SES in sandbox mode or production?

### 6. IAM Permissions
From your Lambda execution role, check:
- DynamoDB permissions (PutItem on your table)
- SES permissions (SendEmail)
- Any other policies attached

## Files to Check in Your Other Project

1. **`.env` or `.env.local`** - Contains API Gateway URL
2. **`aws-lambda/` directory** - Lambda function code (for reference)
3. **`package.json`** - Any AWS SDK versions
4. **AWS Console** - API Gateway → Your API → Stages → Invoke URL
5. **AWS Console** - Lambda → Your function → Configuration → Environment variables
6. **AWS Console** - DynamoDB → Tables → Table name

## Quick Setup Steps

Once you have the API Gateway URL:

1. **Create `.env` file in this project:**
   ```
   VITE_AWS_API_URL=https://your-api-id.execute-api.region.amazonaws.com/stage/booking
   ```

2. **Update Lambda function** (if needed):
   - Copy the Lambda code from `aws-lambda/booking-handler.js`
   - Update region if different
   - Update table name if different
   - Deploy to your Lambda function

3. **Verify:**
   - DynamoDB table exists: `PotteryBookings`
   - SES email verified: `PotteryChicago@gmail.com`
   - Lambda has correct IAM permissions

## What to Share

Please provide:
1. ✅ API Gateway endpoint URL
2. ✅ AWS Region
3. ✅ DynamoDB table name (if different from `PotteryBookings`)
4. ✅ SES region (if different from Lambda region)

With just the API Gateway URL, we can test the connection immediately!

