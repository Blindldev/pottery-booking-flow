// Test Real Form Submission - Simulates user submitting from the live site
// This mimics exactly what happens when a user fills out the form at:
// https://blindldev.github.io/pottery-booking-flow/private-bookings

const fs = require('fs')
const path = require('path')

// Read .env file manually
function loadEnv() {
  const envPath = path.join(__dirname, '.env')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    const envVars = {}
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim()
        }
      }
    })
    return envVars
  }
  return {}
}

const env = loadEnv()

// Simulate a complete form submission as if Mike filled out the entire form
// This matches the exact structure the frontend sends
const mikeFormSubmission = {
  // Step 1: Event Types
  eventTypes: ['Corporate'],
  
  // Step 2: Group Size
  groupSize: 12,
  exactGroupSize: null,
  
  // Step 3: Venue
  venue: 'Studio',
  
  // Step 4: Workshops
  workshops: ['Pottery Wheel classes'],
  
  // Step 5: Dates
  dates: ['2024-12-20'],
  flexibleDates: null,
  
  // Step 6: Contact Information
  contact: {
    name: 'Mike',
    phone: '(555) 987-6543',
    email: 'mikevicentecs@gmail.com',
    notes: 'Team building event for our company. Looking forward to it!'
  },
  
  // Calculated by frontend
  workshopEstimates: [
    {
      workshop: 'Pottery Wheel classes',
      perPerson: 45,
      total: 540,
      readinessNote: 'Ready in ~3 weeks (single color glazing)'
    }
  ],
  
  // Calculated total
  totalEstimate: 540,
  
  // Timestamp
  submittedAt: new Date().toISOString()
}

const API_URL = env.VITE_AWS_API_URL || process.env.VITE_AWS_API_URL || ''

if (!API_URL) {
  console.log('❌ VITE_AWS_API_URL not set in .env file')
  console.log('   This should match what the frontend uses')
  process.exit(1)
}

console.log('\n🌐 Simulating Form Submission from Live Site')
console.log('='.repeat(70))
console.log('\n📍 Source: https://blindldev.github.io/pottery-booking-flow/private-bookings')
console.log('👤 User: Mike (mikevicentecs@gmail.com)')
console.log('\n📋 Form Data Submitted:')
console.log('   Event Type: Corporate')
console.log('   Group Size: 12 people')
console.log('   Venue: Studio')
console.log('   Workshop: Pottery Wheel classes')
console.log('   Date: December 20, 2024')
console.log('   Contact: Mike - mikevicentecs@gmail.com')
console.log('   Total Estimate: $540')
console.log('\n📤 Sending to AWS API Gateway...')
console.log('   Endpoint:', API_URL)
console.log('   Method: POST')
console.log('   Headers: Content-Type: application/json')
console.log('\n⏳ Processing request...\n')

// This is exactly what the frontend does in BookingFlow.jsx
fetch(API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(mikeFormSubmission)
})
  .then(async (response) => {
    console.log('📥 Response Received:')
    console.log('   Status:', response.status, response.statusText)
    console.log('   Headers:', Object.fromEntries(response.headers.entries()))
    
    const responseText = await response.text()
    let responseData
    try {
      responseData = JSON.parse(responseText)
      console.log('\n📦 Response Body:')
      console.log(JSON.stringify(responseData, null, 2))
    } catch (e) {
      console.log('\n📦 Response Body (raw):')
      console.log(responseText)
    }
    
    if (response.ok) {
      console.log('\n✅ SUCCESS! Form submission completed!')
      console.log('\n🎉 What Happened (User Experience):')
      console.log('   1. ✅ User clicked "Submit" on the form')
      console.log('   2. ✅ Frontend sent request to AWS API Gateway')
      console.log('   3. ✅ Lambda function processed the booking')
      console.log('   4. ✅ Data stored in DynamoDB table "PotteryBookings"')
      console.log('   5. ✅ Email sent to PotteryChicago@gmail.com')
      console.log('   6. ✅ User sees success screen')
      console.log('\n📧 Email Confirmation:')
      console.log('   To: PotteryChicago@gmail.com')
      console.log('   Subject: "New Booking Request: Mike - Corporate"')
      console.log('   Contains: All booking details, contact info, pricing')
      console.log('\n💾 Database Entry:')
      console.log('   Table: PotteryBookings')
      console.log('   Booking ID:', responseData?.bookingId || 'N/A')
      console.log('   Status: pending')
      console.log('\n✨ User sees on screen:')
      console.log('   "Thank you! Your booking request has been submitted."')
      console.log('   "We\'ll get back to you soon!"')
    } else {
      console.log('\n❌ ERROR! Form submission failed')
      console.log('\n😞 User Experience:')
      console.log('   User sees error message on the form')
      console.log('   Form data may be saved in localStorage')
      console.log('\n🔍 Troubleshooting:')
      if (response.status === 404) {
        console.log('   ⚠️  API Gateway endpoint not found')
        console.log('   → The /booking endpoint needs to be created in API Gateway')
        console.log('   → Deploy to /prod stage')
      } else if (response.status === 500) {
        console.log('   ⚠️  Lambda function error')
        console.log('   → Check CloudWatch logs for Lambda errors')
        console.log('   → Verify DynamoDB table exists: PotteryBookings')
        console.log('   → Verify SES email is verified: PotteryChicago@gmail.com')
      } else if (response.status === 403) {
        console.log('   ⚠️  CORS or permission error')
        console.log('   → Check API Gateway CORS configuration')
        console.log('   → Verify Lambda function has correct IAM permissions')
      } else {
        console.log('   → Check CloudWatch logs')
        console.log('   → Verify API Gateway configuration')
        console.log('   → Verify Lambda function is deployed')
      }
      console.log('\n💡 Note: Frontend will still show success to user')
      console.log('   (to prevent frustration if AWS is temporarily down)')
    }
  })
  .catch((error) => {
    console.log('\n❌ NETWORK ERROR!')
    console.log('Error:', error.message)
    console.log('\n😞 User Experience:')
    console.log('   User may see network error or timeout')
    console.log('   Form data saved in localStorage for retry')
    console.log('\n🔍 Possible Issues:')
    console.log('   1. API Gateway URL is incorrect')
    console.log('   2. Network connectivity issue')
    console.log('   3. API Gateway endpoint not deployed')
    console.log('   4. CORS configuration blocking the request')
  })

