# AWS Setup Status

## ✅ What's Configured

1. **Environment Variables** - `.env` file created with:
   - API Gateway Base URL: `https://3za8u5fmv6.execute-api.us-east-2.amazonaws.com/prod/`
   - Region: `us-east-2`

2. **Lambda Function** - Code ready in `aws-lambda/booking-handler.js`
   - Region updated to `us-east-2`
   - Handles CORS
   - Stores data in DynamoDB
   - Sends email via SES

3. **Frontend Integration** - `BookingFlow.jsx` configured to send to API Gateway

## ❌ What's Missing

### API Gateway Endpoint Not Created

The test shows **404 Not Found** because the `/booking` endpoint doesn't exist yet.

**Current API Gateway URL:**
```
https://3za8u5fmv6.execute-api.us-east-2.amazonaws.com/prod/booking
```

**You have:**
```
https://3za8u5fmv6.execute-api.us-east-2.amazonaws.com/prod/hook/pickup
```

## 🔧 What You Need to Do

### Option 1: Create New `/booking` Resource in API Gateway

1. Go to AWS Console → API Gateway
2. Find your API (the one with ID `3za8u5fmv6`)
3. Under the `/prod` stage, create a new resource:
   - Resource path: `/booking`
   - Method: `POST`
   - Integration type: Lambda Function
   - Lambda function: `pottery-booking-handler` (or your function name)
   - Enable CORS: Yes
4. Deploy to `/prod` stage

### Option 2: Use Existing Resource Path

If you want to use a different path, update `.env`:
```
VITE_AWS_API_URL=https://3za8u5fmv6.execute-api.us-east-2.amazonaws.com/prod/your-path
```

## 📋 Complete Setup Checklist

### 1. Lambda Function
- [ ] Deploy `aws-lambda/booking-handler.js` to Lambda
- [ ] Function name: `pottery-booking-handler` (or your preferred name)
- [ ] Runtime: Node.js 18.x or 20.x
- [ ] Region: `us-east-2`
- [ ] IAM Role with permissions:
  - [ ] DynamoDB: `PutItem` on `PotteryBookings` table
  - [ ] SES: `SendEmail` (for `PotteryChicago@gmail.com`)

### 2. DynamoDB Table
- [ ] Create table: `PotteryBookings`
- [ ] Primary key: `bookingId` (String)
- [ ] Region: `us-east-2`

### 3. SES Configuration
- [ ] Verify email: `PotteryChicago@gmail.com` (if in sandbox mode)
- [ ] Or move SES to production mode
- [ ] Region: `us-east-2`

### 4. API Gateway
- [ ] Create `/booking` resource
- [ ] Configure POST method
- [ ] Connect to Lambda function
- [ ] Enable CORS
- [ ] Deploy to `/prod` stage

### 5. Test
- [ ] Run: `node test-aws-connection.js`
- [ ] Verify DynamoDB entry created
- [ ] Verify email received at `PotteryChicago@gmail.com`

## 📧 Sample Request Flow

**Request:**
```json
POST https://3za8u5fmv6.execute-api.us-east-2.amazonaws.com/prod/booking
Content-Type: application/json

{
  "eventTypes": ["Corporate"],
  "groupSize": 15,
  "venue": "Studio",
  "workshops": ["Pottery Wheel classes"],
  "dates": ["2024-12-15"],
  "contact": {
    "name": "Test User",
    "phone": "(555) 123-4567",
    "email": "test@example.com"
  },
  "totalEstimate": 675,
  "submittedAt": "2024-12-15T14:30:00.000Z"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Booking submitted successfully",
  "bookingId": "BK-1734282600000-abc123xyz"
}
```

## 🚀 Once Setup is Complete

After creating the API Gateway endpoint, run:
```bash
node test-aws-connection.js
```

This will:
1. Send a test booking request
2. Show the exact request/response
3. Confirm if `PotteryChicago@gmail.com` receives the email
4. Verify the booking is stored in DynamoDB

