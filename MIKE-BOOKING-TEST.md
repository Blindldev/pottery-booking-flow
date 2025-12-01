# Mike's Booking Test - Sample Request & Flow

## 📋 Test Booking Details

**Customer:** Mike  
**Email:** mikevicentecs@gmail.com  
**Event Type:** Corporate Team Building  
**Group Size:** 12 people  
**Workshop:** Pottery Wheel classes  
**Date:** December 20, 2024  
**Total Estimate:** $540

## 📤 Exact Request That Will Be Sent

**Endpoint:** `POST https://3za8u5fmv6.execute-api.us-east-2.amazonaws.com/prod/booking`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "eventTypes": ["Corporate"],
  "groupSize": 12,
  "exactGroupSize": null,
  "venue": "Studio",
  "workshops": ["Pottery Wheel classes"],
  "dates": ["2024-12-20"],
  "flexibleDates": null,
  "contact": {
    "name": "Mike",
    "phone": "(555) 987-6543",
    "email": "mikevicentecs@gmail.com",
    "notes": "Team building event for our company. Looking forward to it!"
  },
  "workshopEstimates": [
    {
      "workshop": "Pottery Wheel classes",
      "perPerson": 45,
      "total": 540,
      "readinessNote": "Ready in ~3 weeks (single color glazing)"
    }
  ],
  "totalEstimate": 540,
  "submittedAt": "2024-12-20T14:30:00.000Z"
}
```

## ✅ Expected Response (Success)

**Status:** `200 OK`

**Response Body:**
```json
{
  "success": true,
  "message": "Booking submitted successfully",
  "bookingId": "BK-1734282600000-abc123xyz"
}
```

## 📧 Email That Will Be Sent

**To:** PotteryChicago@gmail.com  
**Subject:** `New Booking Request: Mike - Corporate`

**Email Content:**
- Booking ID
- Contact: Mike (mikevicentecs@gmail.com)
- Phone: (555) 987-6543
- Event: Corporate Team Building
- Group Size: 12 people
- Workshop: Pottery Wheel classes
- Date: December 20, 2024
- Total Estimate: $540
- Notes: Team building event for our company. Looking forward to it!

## 💾 DynamoDB Entry

**Table:** `PotteryBookings`  
**Primary Key:** `bookingId` (e.g., `BK-1734282600000-abc123xyz`)

**Stored Data:**
- All booking details
- Contact information
- Workshop estimates
- Timestamp

## 🔧 Current Status

❌ **API Gateway endpoint `/booking` not created yet**

**To enable this test:**
1. Create `/booking` resource in API Gateway
2. Connect to Lambda function
3. Deploy to `/prod` stage
4. Run: `node test-mike-booking.js`

## 🚀 Once Endpoint is Ready

Run the test:
```bash
node test-mike-booking.js
```

This will:
1. ✅ Send Mike's booking request
2. ✅ Show the response
3. ✅ Confirm email was sent
4. ✅ Verify DynamoDB entry

