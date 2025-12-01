// Test Contact Form Submission

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
const API_URL = `${BASE_URL}/contact`

const contactData = {
  name: 'Mike',
  email: 'mikevicentecs@gmail.com',
  message: 'Hello! I would like to learn more about your pottery classes. Do you offer beginner workshops?',
  submittedAt: new Date().toISOString()
}

console.log('\n📧 Testing Contact Form Submission')
console.log('='.repeat(70))
console.log('\n📋 Contact Data:')
console.log('   Name:', contactData.name)
console.log('   Email:', contactData.email)
console.log('   Message:', contactData.message.substring(0, 50) + '...')
console.log('\n📤 Sending to:', API_URL)
console.log('\n⏳ Processing...\n')

fetch(API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(contactData)
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
      console.log('\n✅ SUCCESS! Contact message sent!')
      console.log('   Message ID:', responseData?.messageId || 'N/A')
      console.log('\n📧 Email sent to PotteryChicago@gmail.com')
      console.log('💾 Stored in DynamoDB table: ContactMessages')
    } else {
      console.log('\n❌ ERROR! Submission failed')
    }
  })
  .catch((error) => {
    console.log('\n❌ NETWORK ERROR!')
    console.log('Error:', error.message)
  })

