// Test Instructor Application Submission

const fs = require('fs')
const path = require('path')

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
const BASE_URL = env.VITE_AWS_API_URL?.replace('/booking', '') || 'https://mg9brncx39.execute-api.us-east-2.amazonaws.com/prod'
const API_URL = `${BASE_URL}/instructor`

const instructorData = {
  name: 'Mike',
  email: 'mikevicentecs@gmail.com',
  phone: '(555) 987-6543',
  phoneCountry: '+1',
  experience: 'Both',
  experienceDescription: 'I have 5 years of experience teaching pottery wheel classes and hand-building techniques. I love working with students of all skill levels.',
  howFoundOut: 'Found you through Instagram',
  awarePartTime: true,
  startDate: '2024-12-15',
  submittedAt: new Date().toISOString()
}

console.log('\n👨‍🏫 Testing Instructor Application Submission')
console.log('='.repeat(70))
console.log('\n📋 Application Data:')
console.log('   Name:', instructorData.name)
console.log('   Email:', instructorData.email)
console.log('   Experience:', instructorData.experience)
console.log('\n📤 Sending to:', API_URL)
console.log('\n⏳ Processing...\n')

fetch(API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(instructorData)
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
      console.log('\n✅ SUCCESS! Instructor application submitted!')
      console.log('   Application ID:', responseData?.applicationId || 'N/A')
      console.log('\n📧 Email sent to PotteryChicago@gmail.com')
      console.log('💾 Stored in DynamoDB table: InstructorApplications')
    } else {
      console.log('\n❌ ERROR! Submission failed')
    }
  })
  .catch((error) => {
    console.log('\n❌ NETWORK ERROR!')
    console.log('Error:', error.message)
  })

