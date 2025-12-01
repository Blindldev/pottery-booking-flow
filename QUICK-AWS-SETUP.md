# Quick AWS Setup - What I Need From You

## Minimum Required (to test connection):

### 1. API Gateway Endpoint URL
**This is the most important!** 

It should look like:
```
https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod/booking
```

**Where to find it:**
- In your other project's `.env` file
- AWS Console → API Gateway → Your API → Stages → Click on stage → "Invoke URL"
- Copy the full URL including the `/booking` path

### 2. AWS Region (optional but helpful)
- Usually in the API Gateway URL (e.g., `us-east-1`)
- Or check your Lambda function region

## Once You Provide the API URL:

I'll:
1. Create `.env` file with the URL
2. Test the connection
3. Verify the request/response flow
4. Confirm email delivery works

## Optional (if you want me to verify everything):

- DynamoDB table name (default: `PotteryBookings`)
- SES region (usually same as Lambda)
- Lambda function name (for reference)

## Quick Test Command

Once you give me the API URL, I can run:
```bash
export VITE_AWS_API_URL=https://your-api-url-here
node test-aws-connection.js
```

This will show the exact request/response and confirm everything works!

