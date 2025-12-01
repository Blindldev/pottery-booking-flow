# Verify API Gateway Endpoint

## Current Test Results

**Test Request:**
- URL: `https://3za8u5fmv6.execute-api.us-east-2.amazonaws.com/prod/booking`
- Method: POST
- Status: **404 Not Found**

## Possible Solutions

### Option 1: Endpoint Not Created Yet
If you haven't created the `/booking` endpoint yet, you need to:
1. Go to AWS Console → API Gateway
2. Find API with ID: `3za8u5fmv6`
3. Create `/booking` resource
4. Add POST method
5. Connect to Lambda function
6. Deploy to `/prod` stage

### Option 2: Different Endpoint Path
If you created the endpoint with a different path, update `.env`:
```
VITE_AWS_API_URL=https://3za8u5fmv6.execute-api.us-east-2.amazonaws.com/prod/your-actual-path
```

### Option 3: Check Existing Endpoints
Your existing endpoint is:
- `https://3za8u5fmv6.execute-api.us-east-2.amazonaws.com/prod/hook/pickup` ✅

Maybe the booking endpoint is at:
- `/prod/hook/booking`?
- `/prod/api/booking`?
- `/prod/v1/booking`?

## Test Different Paths

You can test different paths by updating the `.env` file and running:
```bash
node test-mike-booking.js
```

## Sample Request That Will Be Sent

```json
{
  "eventTypes": ["Corporate"],
  "groupSize": 12,
  "venue": "Studio",
  "workshops": ["Pottery Wheel classes"],
  "dates": ["2024-12-20"],
  "contact": {
    "name": "Mike",
    "phone": "(555) 987-6543",
    "email": "mikevicentecs@gmail.com",
    "notes": "Team building event for our company. Looking forward to it!"
  },
  "workshopEstimates": [{
    "workshop": "Pottery Wheel classes",
    "perPerson": 45,
    "total": 540,
    "readinessNote": "Ready in ~3 weeks (single color glazing)"
  }],
  "totalEstimate": 540,
  "submittedAt": "2024-12-20T14:30:00.000Z"
}
```

## Once Endpoint Works

After the endpoint is created and working, you should see:
1. ✅ **200 OK** response
2. ✅ Booking ID returned
3. ✅ Email sent to PotteryChicago@gmail.com
4. ✅ Entry in DynamoDB table

