# AWS Integration Testing Guide

## Current Status

The AWS integration code is ready, but needs to be configured with your AWS API Gateway endpoint.

## What's Ready

✅ **Frontend Code**: The booking form is configured to send data to AWS API Gateway  
✅ **Lambda Function**: Code is ready to deploy (see `aws-lambda/booking-handler.js`)  
✅ **Error Handling**: Proper error handling and fallback to console logging  
✅ **CORS Support**: Lambda function handles CORS for browser requests  

## What You Need to Do

### Step 1: Set Up AWS Services

Follow the instructions in `aws-setup-instructions.md` to:
1. Create DynamoDB table: `PotteryBookings`
2. Verify email in SES: `PotteryChicago@gmail.com`
3. Deploy Lambda function with the code from `aws-lambda/booking-handler.js`
4. Create API Gateway endpoint
5. Get your API Gateway URL

### Step 2: Configure the Frontend

1. Create a `.env` file in the project root:
   ```
   VITE_AWS_API_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/booking
   ```

2. Restart your dev server:
   ```bash
   npm run dev
   ```

### Step 3: Test the Integration

#### Option A: Test via the Form
1. Go to `/private-bookings`
2. Fill out the entire booking form
3. Submit the form
4. Check:
   - Browser console for success message
   - DynamoDB table for the stored booking
   - Email inbox for confirmation email

#### Option B: Test with Script
```bash
# Set your API URL
export VITE_AWS_API_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/booking

# Run test script (requires Node.js 18+)
node test-aws-integration.js
```

#### Option C: Test Lambda Directly
1. Go to AWS Console → Lambda
2. Select `pottery-booking-handler`
3. Click "Test"
4. Use the event from `test-lambda-event.json`
5. Check CloudWatch logs for results

## Verification Checklist

After setup, verify:

- [ ] API Gateway is deployed and accessible
- [ ] Lambda function has correct IAM permissions (DynamoDB + SES)
- [ ] SES email is verified
- [ ] DynamoDB table exists
- [ ] `.env` file has `VITE_AWS_API_URL` set
- [ ] Form submission shows success
- [ ] Booking appears in DynamoDB
- [ ] Email is received at PotteryChicago@gmail.com

## Troubleshooting

### Form shows success but no data in DynamoDB
- Check Lambda CloudWatch logs for errors
- Verify Lambda execution role has DynamoDB permissions
- Check table name matches environment variable

### Email not received
- Verify email is verified in SES
- Check SES sandbox status (may need production access)
- Check Lambda CloudWatch logs for SES errors
- Verify Lambda execution role has SES permissions

### CORS errors in browser
- Ensure CORS is enabled in API Gateway
- Check Lambda response includes CORS headers
- Verify API Gateway CORS settings

### API returns 500 error
- Check CloudWatch logs for Lambda errors
- Verify all environment variables are set
- Check IAM permissions for Lambda execution role

## Current Code Status

The integration code is production-ready:
- ✅ Proper error handling
- ✅ CORS support
- ✅ Email formatting (HTML + text)
- ✅ Data validation structure
- ✅ Fallback behavior when API not configured

## Next Steps

1. Complete AWS setup (see `aws-setup-instructions.md`)
2. Add API URL to `.env` file
3. Test with a real booking submission
4. Monitor CloudWatch logs for any issues
5. Consider adding API authentication for production

