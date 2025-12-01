// Test Collaborations Form Submission

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
const API_URL = `${BASE_URL}/collaborations`

const collaborationData = {
  name: 'Mike',
  email: 'mikevicentecs@gmail.com',
  phone: '(555) 987-6543',
  phoneCountry: '+1',
  organization: 'Chicago Art Collective',
  socialMedia: {
    instagram: '@chicagoartcollective',
    facebook: 'Chicago Art Collective',
    twitter: '@chicagoart',
    tiktok: '',
    website: 'https://chicagoartcollective.com',
    other: ''
  },
  communityGoals: 'We want to bring pottery workshops to underserved communities in Chicago and create a space for artistic expression.',
  eventVision: 'A collaborative pottery event where community members can create pieces together, learn new techniques, and build connections.',
  eventType: 'Community workshop and collaborative art event',
  expectedAttendance: '50-75 people',
  submittedAt: new Date().toISOString()
}

console.log('\n🤝 Testing Collaborations Form Submission')
console.log('='.repeat(70))
console.log('\n📋 Collaboration Data:')
console.log('   Name:', collaborationData.name)
console.log('   Organization:', collaborationData.organization)
console.log('   Email:', collaborationData.email)
console.log('\n📤 Sending to:', API_URL)
console.log('\n⏳ Processing...\n')

fetch(API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(collaborationData)
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
      console.log('\n✅ SUCCESS! Collaboration inquiry submitted!')
      console.log('   Collaboration ID:', responseData?.collaborationId || 'N/A')
      console.log('\n📧 Email sent to PotteryChicago@gmail.com')
      console.log('💾 Stored in DynamoDB table: Collaborations')
    } else {
      console.log('\n❌ ERROR! Submission failed')
    }
  })
  .catch((error) => {
    console.log('\n❌ NETWORK ERROR!')
    console.log('Error:', error.message)
  })

