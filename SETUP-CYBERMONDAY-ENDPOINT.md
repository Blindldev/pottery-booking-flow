# Setup Cyber Monday API Gateway Endpoint

## Problem
The `/cybermonday-play` endpoint is returning 404 because it doesn't exist in API Gateway yet. This needs to be created and configured.

## Solution: Create `/cybermonday-play` Endpoint in API Gateway

### Step 1: Go to API Gateway Console
1. Go to AWS Console → API Gateway
2. Find your API (the one with ID `mg9brncx39`)
3. Click on it to open

### Step 2: Create `/cybermonday-play` Resource
1. In the left sidebar, find the `/prod` resource (or your stage name)
2. Click on it to expand
3. Click **Actions** → **Create Resource**
4. Resource name: `cybermonday-play`
5. Resource path: `/cybermonday-play` (should auto-fill)
6. Click **Create Resource**

### Step 3: Create POST Method
1. Select the newly created `/cybermonday-play` resource
2. Click **Actions** → **Create Method**
3. Choose **POST** from the dropdown
4. Click the checkmark ✓
5. Integration type: **Lambda Function**
6. Lambda Function: Enter your cybermonday handler function name (e.g., `cybermonday-handler` or `pottery-cybermonday-handler`)
   - If you haven't created the Lambda function yet, see Step 4 below
7. Click **Save** → **OK** (when prompted about permissions)

### Step 4: Create OPTIONS Method (for CORS)
1. Select the `/cybermonday-play` resource
2. Click **Actions** → **Create Method**
3. Choose **OPTIONS** from the dropdown
4. Click the checkmark ✓
5. Integration type: **Mock**
6. Click **Save**
7. Configure Mock Integration:
   - Integration Request: Leave defaults
   - Method Response: Add headers:
     - `Access-Control-Allow-Origin`
     - `Access-Control-Allow-Headers`
     - `Access-Control-Allow-Methods`
   - Integration Response: 
     - Status: 200
     - Header Mappings:
       - `Access-Control-Allow-Origin`: `'*'`
       - `Access-Control-Allow-Headers`: `'Content-Type'`
       - `Access-Control-Allow-Methods`: `'POST, OPTIONS'`

### Step 5: Enable CORS on Resource
1. Select the `/cybermonday-play` resource
2. Click **Actions** → **Enable CORS**
3. Leave default settings (should match the Lambda function headers)
4. Click **Enable CORS and replace existing CORS headers**

### Step 6: Create Lambda Function (if not exists)
If you don't have a Lambda function for cybermonday yet:

1. Go to AWS Console → Lambda
2. Click **Create function**
3. Function name: `cybermonday-handler` (or `pottery-cybermonday-handler`)
4. Runtime: **Node.js 20.x**
5. Click **Create function**
6. Copy the code from `aws-lambda/cybermonday-handler.js` into the function code
7. **Set Environment Variables:**
   - `CYBERMONDAY_TABLE_NAME` = `CyberMondayGamePlays`
   - `BOOKINGS_URL` = `https://thepotteryloop.com` (optional)
8. **Set up IAM Role:**
   - Go to Configuration → Permissions
   - Click on the execution role
   - Add policies:
     - `AmazonDynamoDBFullAccess` (or custom with PutItem/Query on CyberMondayGamePlays table)
     - `AmazonSESFullAccess` (or custom with SendEmail permission)
9. **Create DynamoDB Table** (if not exists):
   - Table name: `CyberMondayGamePlays`
   - Partition key: `id` (String)
   - Optional: Create GSI on `email` field for duplicate checking:
     - Index name: `email-index`
     - Partition key: `email` (String)

### Step 7: Deploy API
1. Click **Actions** → **Deploy API**
2. Deployment stage: `prod` (or your stage name)
3. Click **Deploy**

### Step 8: Test the Endpoint
Test with curl or Postman:
```bash
curl -X POST https://mg9brncx39.execute-api.us-east-2.amazonaws.com/prod/cybermonday-play \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "consent": true
  }'
```

Expected response:
```json
{
  "success": true,
  "offerLabel": "Get $5 off our Ceramic Candles class",
  "code": "CANDLE5",
  "link": "https://www.thepotteryloop.com/event-details/winter-candle-workshop-2025-12-06-13-30"
}
```

## Troubleshooting

### Still getting CORS error?
- Make sure CORS is enabled on the `/cybermonday-play` resource (not just the method)
- Verify the Lambda function returns CORS headers (it should, based on the code)
- Try redeploying the API after enabling CORS
- Check that OPTIONS method is configured correctly

### Lambda function not found?
- Make sure the function name in API Gateway matches your actual Lambda function name
- Check that the function is in the same region (us-east-2)

### 404 error?
- Verify the endpoint path is exactly `/cybermonday-play` (case-sensitive)
- Make sure the API is deployed to the `prod` stage
- Check that the resource and method are created correctly

## Quick Checklist
- [ ] `/cybermonday-play` resource created in API Gateway
- [ ] POST method created and connected to Lambda
- [ ] OPTIONS method created for CORS preflight
- [ ] CORS enabled on `/cybermonday-play` resource
- [ ] Lambda function exists and has correct code
- [ ] DynamoDB table `CyberMondayGamePlays` exists
- [ ] GSI `email-index` created on DynamoDB table (optional, for duplicate checking)
- [ ] Lambda has IAM permissions (DynamoDB + SES)
- [ ] API deployed to `prod` stage
- [ ] Test request works





