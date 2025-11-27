# AWS Setup Instructions for Pottery Booking Form

This guide will help you set up AWS services to handle booking form submissions.

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI installed and configured (optional, but helpful)
- Node.js 14+ (for local testing)

## Required AWS Services

1. **API Gateway** - To expose the Lambda function as an HTTP endpoint
2. **Lambda** - To process booking submissions
3. **DynamoDB** - To store booking data
4. **SES (Simple Email Service)** - To send confirmation emails

## Step-by-Step Setup

### 1. Set Up DynamoDB Table

1. Go to AWS Console → DynamoDB
2. Click "Create table"
3. Table name: `PotteryBookings`
4. Partition key: `bookingId` (String)
5. Settings: Use default settings or customize as needed
6. Click "Create table"

### 2. Set Up SES (Simple Email Service)

1. Go to AWS Console → SES
2. **Verify your email address:**
   - Click "Verified identities" → "Create identity"
   - Select "Email address"
   - Enter: `PotteryChicago@gmail.com`
   - Click "Create identity"
   - Check your email and click the verification link

3. **If you're in SES Sandbox mode** (new accounts):
   - You can only send emails to verified addresses
   - To send to any email, request production access:
     - Go to "Account dashboard"
     - Click "Request production access"
     - Fill out the form (usually approved within 24 hours)

### 3. Create Lambda Function

1. Go to AWS Console → Lambda
2. Click "Create function"
3. Choose "Author from scratch"
4. Function name: `pottery-booking-handler`
5. Runtime: Node.js 18.x or 20.x
6. Click "Create function"

7. **Add the code:**
   - Copy the code from `aws-lambda/booking-handler.js`
   - Paste it into the Lambda function editor
   - Click "Deploy"

8. **Set Environment Variables:**
   - Go to Configuration → Environment variables
   - Add: `BOOKINGS_TABLE_NAME` = `PotteryBookings`

9. **Set up IAM Role:**
   - Go to Configuration → Permissions
   - Click on the execution role
   - Add the following policies:
     - `AmazonDynamoDBFullAccess` (or create a custom policy with only PutItem permission)
     - `AmazonSESFullAccess` (or create a custom policy with only SendEmail permission)

### 4. Create API Gateway

1. Go to AWS Console → API Gateway
2. Click "Create API"
3. Choose "REST API" → "Build"
4. API name: `PotteryBookingAPI`
5. Click "Create API"

6. **Create Resource:**
   - Click "Actions" → "Create Resource"
   - Resource name: `booking`
   - Click "Create Resource"

7. **Create Method:**
   - Select the `/booking` resource
   - Click "Actions" → "Create Method"
   - Choose "POST"
   - Integration type: "Lambda Function"
   - Lambda Function: `pottery-booking-handler`
   - Click "Save" → "OK"

8. **Enable CORS:**
   - Select the `/booking` resource
   - Click "Actions" → "Enable CORS"
   - Leave default settings
   - Click "Enable CORS and replace existing CORS headers"

9. **Deploy API:**
   - Click "Actions" → "Deploy API"
   - Deployment stage: `prod` (or create new)
   - Click "Deploy"
   - **Copy the Invoke URL** (you'll need this for the frontend)

### 5. Update Frontend Configuration

1. Create a `.env` file in the project root:
   ```
   VITE_AWS_API_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/booking
   ```

2. Or update the API URL directly in the code (see next step)

## Testing

1. Test the Lambda function directly:
   - Go to Lambda → `pottery-booking-handler`
   - Click "Test"
   - Create a test event with sample booking data
   - Run the test

2. Test via API Gateway:
   - Use Postman or curl to send a POST request to your API endpoint
   - Check DynamoDB for the stored record
   - Check your email for the confirmation

## Cost Estimate

- **DynamoDB**: Free tier includes 25 GB storage and 25 read/write units
- **Lambda**: Free tier includes 1M requests/month
- **SES**: Free tier includes 62,000 emails/month (if sending from EC2)
- **API Gateway**: Free tier includes 1M requests/month

For a small pottery studio, this should be well within free tier limits.

## Troubleshooting

### Email not sending
- Verify your email address in SES
- Check SES sandbox status
- Verify Lambda execution role has SES permissions

### DynamoDB errors
- Verify table name matches environment variable
- Check Lambda execution role has DynamoDB permissions

### CORS errors
- Ensure CORS is enabled in API Gateway
- Check that headers match in Lambda response

## Security Considerations

1. **Add API Key or Authentication** (recommended for production):
   - In API Gateway, add API Key requirement
   - Or implement AWS Cognito for authentication

2. **Rate Limiting**:
   - Configure throttling in API Gateway
   - Set up WAF rules if needed

3. **Input Validation**:
   - Add validation in Lambda function
   - Sanitize user inputs

4. **Environment Variables**:
   - Store sensitive data in AWS Secrets Manager
   - Use IAM roles instead of hardcoded credentials

