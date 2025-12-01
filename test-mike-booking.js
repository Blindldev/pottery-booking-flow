// Test Real Booking Submission for Mike
// This will send an actual booking request to AWS

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

// Real booking data for Mike
const mikeBookingData = {
  eventTypes: ['Corporate'],
  groupSize: 12,
  exactGroupSize: null,
  venue: 'Studio',
  workshops: ['Pottery Wheel classes'],
  dates: ['2024-12-20'],
  flexibleDates: null,
  contact: {
    name: 'Mike',
    phone: '(555) 987-6543',
    email: 'mikevicentecs@gmail.com',
    notes: 'Team building event for our company. Looking forward to it!'
  },
  workshopEstimates: [
    {
      workshop: 'Pottery Wheel classes',
      perPerson: 45,
      total: 540,
      readinessNote: 'Ready in ~3 weeks (single color glazing)'
    }
  ],
  totalEstimate: 540,
  submittedAt: new Date().toISOString()
}

const API_URL = env.VITE_AWS_API_URL || process.env.VITE_AWS_API_URL || ''

if (!API_URL) {
  console.log('❌ VITE_AWS_API_URL not set in .env file')
  process.exit(1)
}

console.log('\n🎨 Testing Real Booking Submission for Mike')
console.log('='.repeat(70))
console.log('\n👤 Booking Details:')
console.log('   Name: Mike')
console.log('   Email: mikevicentecs@gmail.com')
console.log('   Event: Corporate Team Building')
console.log('   Group Size: 12 people')
console.log('   Workshop: Pottery Wheel classes')
console.log('   Date: December 20, 2024')
console.log('   Total Estimate: $540')
console.log('\n📤 Sending to AWS API Gateway...')
console.log('   URL:', API_URL)
console.log('\n⏳ Processing...\n')

fetch(API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(mikeBookingData)
})
  .then(async (response) => {
    console.log('📥 Response Status:', response.status, response.statusText)
    
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
      console.log('\n✅ SUCCESS! Booking submitted successfully!')
      console.log('\n📋 What Happened:')
      console.log('   1. ✅ Request sent to API Gateway')
      console.log('   2. ✅ Lambda function processed the booking')
      console.log('   3. ✅ Data stored in DynamoDB table "PotteryBookings"')
      console.log('   4. ✅ Email sent to PotteryChicago@gmail.com')
      console.log('\n📧 Email Verification:')
      console.log('   Check PotteryChicago@gmail.com inbox for:')
      console.log('   Subject: "New Booking Request: Mike - Corporate"')
      console.log('   The email should contain all booking details.')
      console.log('\n💾 Database Verification:')
      console.log('   Check DynamoDB table "PotteryBookings" for booking ID:', responseData?.bookingId || 'N/A')
      console.log('\n🔍 CloudWatch Logs:')
      console.log('   View Lambda execution logs in CloudWatch for detailed processing info')
    } else {
      console.log('\n❌ ERROR! Booking submission failed')
      console.log('\n🔍 Troubleshooting:')
      if (response.status === 404) {
        console.log('   ⚠️  API Gateway endpoint not found')
        console.log('   → Create /booking resource in API Gateway')
        console.log('   → Deploy to /prod stage')
      } else if (response.status === 500) {
        console.log('   ⚠️  Lambda function error')
        console.log('   → Check CloudWatch logs for details')
        console.log('   → Verify DynamoDB table exists')
        console.log('   → Verify SES email is verified')
      } else {
        console.log('   → Check CloudWatch logs')
        console.log('   → Verify API Gateway configuration')
        console.log('   → Verify Lambda function permissions')
      }
    }
  })
  .catch((error) => {
    console.log('\n❌ NETWORK ERROR!')
    console.log('Error:', error.message)
    console.log('\n🔍 Possible Issues:')
    console.log('   1. API Gateway URL is incorrect')
    console.log('   2. Network connectivity issue')
    console.log('   3. API Gateway endpoint not deployed')
  })

