// Test script to verify AWS integration
// Run with: node test-aws-integration.js

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
    notes: 'Test booking submission'
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

// Check if API URL is configured
const API_URL = process.env.VITE_AWS_API_URL || ''

console.log('=== AWS Integration Test ===\n')

if (!API_URL) {
  console.log('❌ API URL not configured')
  console.log('   Set VITE_AWS_API_URL environment variable or add to .env file')
  console.log('   Example: VITE_AWS_API_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/booking\n')
  console.log('📋 Sample booking data that would be sent:')
  console.log(JSON.stringify(sampleBookingData, null, 2))
  console.log('\n⚠️  To test AWS integration:')
  console.log('   1. Set up AWS services (see aws-setup-instructions.md)')
  console.log('   2. Add VITE_AWS_API_URL to .env file')
  console.log('   3. Restart dev server')
  console.log('   4. Submit a booking through the form')
  process.exit(0)
}

console.log('✅ API URL configured:', API_URL)
console.log('\n📤 Testing API endpoint...\n')

// Test the API endpoint
fetch(API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(sampleBookingData)
})
  .then(async (response) => {
    console.log('📥 Response Status:', response.status, response.statusText)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.log('❌ Error Response:', errorText)
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }
    
    const result = await response.json()
    console.log('✅ Success! Response:', JSON.stringify(result, null, 2))
    console.log('\n🎉 AWS integration is working!')
    console.log('   - Check DynamoDB for the stored booking')
    console.log('   - Check PotteryChicago@gmail.com for the confirmation email')
  })
  .catch((error) => {
    console.error('❌ Test failed:', error.message)
    console.log('\n🔍 Troubleshooting:')
    console.log('   1. Verify API Gateway is deployed')
    console.log('   2. Check Lambda function has correct permissions')
    console.log('   3. Verify SES email is verified')
    console.log('   4. Check CloudWatch logs for Lambda errors')
    process.exit(1)
  })

