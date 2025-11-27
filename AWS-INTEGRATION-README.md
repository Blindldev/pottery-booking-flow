# AWS Integration for Pottery Booking Form

## Overview

The booking form now supports integration with AWS services to:
1. Store booking submissions in DynamoDB
2. Send confirmation emails via SES to PotteryChicago@gmail.com

## Quick Start

### 1. Set Up AWS Services

Follow the detailed instructions in `aws-setup-instructions.md` to:
- Create DynamoDB table
- Set up SES (verify email)
- Create Lambda function
- Set up API Gateway

### 2. Configure Frontend

1. After deploying your API Gateway, copy the Invoke URL
2. Create a `.env` file in the project root:
   ```
   VITE_AWS_API_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/booking
   ```
3. Restart your dev server if running

### 3. Test

Submit a test booking through the form. You should:
- See the booking stored in DynamoDB
- Receive an email at PotteryChicago@gmail.com with all booking details

## What Gets Sent

The form sends the following data to AWS:

- **Contact Information**: Name, email, phone, notes
- **Event Details**: Event types, group size, venue
- **Workshops**: Selected workshops with pricing estimates
- **Dates**: Preferred dates or flexible date ranges
- **Total Estimate**: Calculated total cost

## Fallback Behavior

If `VITE_AWS_API_URL` is not set, the form will:
- Still show success message to user
- Log data to browser console
- Display a warning in console about missing API configuration

This allows the form to work during development before AWS is set up.

## Files Created

- `aws-lambda/booking-handler.js` - Lambda function code
- `aws-setup-instructions.md` - Detailed AWS setup guide
- `src/config/api.js` - API configuration helper
- Updated `src/components/BookingFlow.jsx` - Added AWS API call

## Next Steps

1. Complete AWS setup following `aws-setup-instructions.md`
2. Add your API Gateway URL to `.env` file
3. Test the integration
4. Consider adding:
   - API authentication (API keys or Cognito)
   - Rate limiting
   - Input validation on Lambda side
   - Error monitoring (CloudWatch)

