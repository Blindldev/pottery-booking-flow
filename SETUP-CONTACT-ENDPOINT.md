# Setup Contact API Gateway Endpoint

## Problem
The `/contact` endpoint is returning 404 because it doesn't exist in API Gateway yet. This needs to be created and configured.

## Solution: Create `/contact` Endpoint in API Gateway

### Step 1: Go to API Gateway Console
1. Go to AWS Console → API Gateway
2. Find your API (the one with ID `mg9brncx39`)
3. Click on it to open

### Step 2: Create `/contact` Resource
1. In the left sidebar, find the `/prod` resource (or your stage name)
2. Click on it to expand
3. Click **Actions** → **Create Resource**
4. Resource name: `contact`
5. Resource path: `/contact` (should auto-fill)
6. Click **Create Resource**

### Step 3: Create POST Method
1. Select the newly created `/contact` resource
2. Click **Actions** → **Create Method**
3. Choose **POST** from the dropdown
4. Click the checkmark ✓
5. Integration type: **Lambda Function**
6. Lambda Function: Enter your contact handler function name (e.g., `contact-handler` or `pottery-contact-handler`)
   - If you haven't created the Lambda function yet, see Step 4 below
7. Click **Save** → **OK** (when prompted about permissions)

### Step 4: Create Lambda Function (if not exists)
If you don't have a Lambda function for contact yet:

1. Go to AWS Console → Lambda
2. Click **Create function**
3. Function name: `contact-handler` (or `pottery-contact-handler`)
4. Runtime: **Node.js 20.x**
5. Click **Create function**
6. Copy the code from `aws-lambda/contact-handler.js` into the function code
7. **Set Environment Variables:**
   - `CONTACT_TABLE_NAME` = `ContactMessages`
8. **Set up IAM Role:**
   - Go to Configuration → Permissions
   - Click on the execution role
   - Add policies:
     - `AmazonDynamoDBFullAccess` (or custom with PutItem on ContactMessages table)
     - `AmazonSESFullAccess` (or custom with SendEmail permission)
9. **Create DynamoDB Table** (if not exists):
   - Go to DynamoDB → Create table
   - Table name: `ContactMessages`
   - Partition key: `messageId` (String)
   - Click **Create table**

### Step 5: Enable CORS
1. Select the `/contact` resource (not the method)
2. Click **Actions** → **Enable CORS**
3. Leave default settings:
   - Access-Control-Allow-Origin: `*`
   - Access-Control-Allow-Headers: `Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token`
   - Access-Control-Allow-Methods: `POST,OPTIONS`
4. Click **Enable CORS and replace existing CORS headers**

### Step 6: Deploy API
1. Click **Actions** → **Deploy API**
2. Deployment stage: `prod` (or your stage name)
3. Deployment description: `Add contact endpoint`
4. Click **Deploy**

### Step 7: Test the Endpoint
Test with curl:
```bash
curl -X POST https://mg9brncx39.execute-api.us-east-2.amazonaws.com/prod/contact \
  -H "Content-Type: application/json" \
  -H "Origin: https://potterychicago.com" \
  -d '{"name":"Test","email":"test@test.com","message":"Test message"}'
```

Expected response:
```json
{"success":true,"message":"Message sent successfully","messageId":"MSG-..."}
```

## Verify CORS
Test OPTIONS request:
```bash
curl -X OPTIONS https://mg9brncx39.execute-api.us-east-2.amazonaws.com/prod/contact \
  -H "Origin: https://potterychicago.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type" \
  -v
```

You should see:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: POST,OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

## Troubleshooting

### Still getting 404?
- Make sure you deployed the API after creating the resource
- Check that the resource path is exactly `/contact` (not `/prod/contact` - the stage is already in the URL)

### Still getting CORS error?
- Make sure CORS is enabled on the `/contact` resource (not just the method)
- Verify the Lambda function returns CORS headers (it should, based on the code)
- Try redeploying the API after enabling CORS

### Lambda function not found?
- Make sure the function name in API Gateway matches your actual Lambda function name
- Check that the function is in the same region (us-east-2)

## Quick Checklist
- [ ] `/contact` resource created in API Gateway
- [ ] POST method created and connected to Lambda
- [ ] Lambda function exists and has correct code
- [ ] DynamoDB table `ContactMessages` exists
- [ ] Lambda has IAM permissions (DynamoDB + SES)
- [ ] CORS enabled on `/contact` resource
- [ ] API deployed to `prod` stage
- [ ] Test request works

