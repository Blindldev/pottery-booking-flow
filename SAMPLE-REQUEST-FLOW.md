# Sample Booking Request Flow

## Complete Request/Response Flow

### 1. User Fills Out Form
User completes all steps:
- Event Type: Corporate
- Group Size: 15
- Venue: Studio
- Workshop: Pottery Wheel classes
- Dates: December 15, 2024
- Contact: Name, Email, Phone

### 2. Frontend Prepares Request

**Request URL:** `POST https://3za8u5fmv6.execute-api.us-east-2.amazonaws.com/prod/booking`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body (JSON):**
```json
{
  "eventTypes": ["Corporate"],
  "groupSize": 15,
  "exactGroupSize": null,
  "venue": "Studio",
  "workshops": ["Pottery Wheel classes"],
  "dates": ["2024-12-15"],
  "flexibleDates": null,
  "contact": {
    "name": "John Smith",
    "phone": "(555) 123-4567",
    "email": "john@example.com",
    "notes": "Looking for a team building event"
  },
  "workshopEstimates": [
    {
      "workshop": "Pottery Wheel classes",
      "perPerson": 45,
      "total": 675,
      "readinessNote": "Ready in ~3 weeks (single color glazing)"
    }
  ],
  "totalEstimate": 675,
  "submittedAt": "2024-12-15T14:30:00.000Z"
}
```

### 3. API Gateway Receives Request
- Validates CORS (if preflight OPTIONS request)
- Routes to Lambda function: `pottery-booking-handler`

### 4. Lambda Function Processes Request

**What Lambda Does:**
1. Parses JSON body
2. Generates unique booking ID: `BK-1734282600000-abc123xyz`
3. Stores in DynamoDB table `PotteryBookings`
4. Formats email (HTML + text)
5. Sends email via SES to `PotteryChicago@gmail.com`
6. Returns success response

### 5. Lambda Response

**Success Response (200):**
```json
{
  "success": true,
  "message": "Booking submitted successfully",
  "bookingId": "BK-1734282600000-abc123xyz"
}
```

**Error Response (500):**
```json
{
  "success": false,
  "message": "Failed to process booking",
  "error": "Error message here"
}
```

### 6. Frontend Receives Response
- Logs success to console
- Shows success screen to user
- Clears form state

### 7. Email Sent to PotteryChicago@gmail.com

**Email Subject:** `New Booking Request: John Smith - Corporate`

**Email Content:** HTML formatted email with:
- Booking ID
- Contact information
- Event details
- Workshop selections with pricing
- Preferred dates
- Total estimate

## Verification Steps

After submission, verify:

1. **DynamoDB:**
   - Go to AWS Console → DynamoDB → Tables → PotteryBookings
   - Find item with bookingId starting with "BK-"
   - Verify all data is stored correctly

2. **Email:**
   - Check PotteryChicago@gmail.com inbox
   - Look for email with subject "New Booking Request: [Name] - [Event Type]"
   - Verify all booking details are in the email

3. **CloudWatch Logs:**
   - Go to AWS Console → CloudWatch → Log Groups
   - Find `/aws/lambda/pottery-booking-handler`
   - Check latest log stream for execution details

## Current Status

✅ **Frontend:** Ready to send requests  
✅ **Lambda Code:** Ready to deploy  
✅ **Environment:** Configured with API Gateway URL  
❌ **API Gateway:** `/booking` endpoint needs to be created

## Next Steps

1. Create `/booking` resource in API Gateway
2. Connect it to your Lambda function
3. Deploy to `/prod` stage
4. Run `node test-aws-connection.js` to verify
