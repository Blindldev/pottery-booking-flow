// Test AWS Connection - Shows exact request/response flow
// Run: node test-aws-connection.js

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

// Sample booking data matching the form structure
const sampleBookingData = {
  eventTypes: ['Corporate'],
  groupSize: 15,
  exactGroupSize: null,
  venue: 'Studio',
  workshops: ['Pottery Wheel classes'],
  dates: ['2024-12-15'],
  flexibleDates: null,
  contact: {
    name: 'Test User',
    phone: '(555) 123-4567',
    email: 'test@example.com',
    notes: 'Test booking to verify AWS connection'
  },
  workshopEstimates: [
    {
      workshop: 'Pottery Wheel classes',
      perPerson: 45,
      total: 675,
      readinessNote: 'Ready in ~3 weeks (single color glazing)'
    }
  ],
  totalEstimate: 675,
  submittedAt: new Date().toISOString()
}

const API_URL = env.VITE_AWS_API_URL || process.env.VITE_AWS_API_URL || ''

if (!API_URL) {
  console.log('❌ VITE_AWS_API_URL not set')
  console.log('\n📋 To test AWS connection:')
  console.log('   1. Make sure .env file exists with VITE_AWS_API_URL')
  console.log('   2. Or set environment variable:')
  console.log('      export VITE_AWS_API_URL=https://your-api-url')
  console.log('   3. Then run: node test-aws-connection.js')
  process.exit(1)
}

console.log('\n🔗 Testing AWS API Connection')
console.log('='.repeat(60))
console.log('\n📤 Request Details:')
console.log('   URL:', API_URL)
console.log('   Method: POST')
console.log('   Headers: Content-Type: application/json')
console.log('\n📦 Request Body:')
console.log(JSON.stringify(sampleBookingData, null, 2))

console.log('\n⏳ Sending request...\n')

fetch(API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(sampleBookingData)
})
  .then(async (response) => {
    console.log('📥 Response Status:', response.status, response.statusText)
    console.log('📥 Response Headers:', Object.fromEntries(response.headers.entries()))
    
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
      console.log('\n✅ SUCCESS! Request completed successfully')
      console.log('\n📋 Next Steps:')
      console.log('   1. Check DynamoDB table "PotteryBookings" for the new booking')
      console.log('   2. Check PotteryChicago@gmail.com inbox for the email')
      console.log('   3. Check CloudWatch logs for Lambda execution details')
    } else {
      console.log('\n❌ ERROR! Request failed')
      console.log('\n🔍 Troubleshooting:')
      console.log('   1. Check CloudWatch logs for Lambda errors')
      console.log('   2. Verify API Gateway endpoint is correct')
      console.log('   3. Verify Lambda function is deployed and has correct permissions')
      console.log('   4. Check CORS configuration if you see CORS errors')
    }
  })
  .catch((error) => {
    console.log('\n❌ NETWORK ERROR!')
    console.log('Error:', error.message)
    console.log('\n🔍 Troubleshooting:')
    console.log('   1. Verify the API Gateway URL is correct')
    console.log('   2. Check your internet connection')
    console.log('   3. Verify API Gateway is deployed and accessible')
  })
