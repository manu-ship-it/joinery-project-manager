// Setup script for Twilio voice assistant
// Run this to configure your Twilio phone number

const twilio = require('twilio')
require('dotenv').config()

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN

if (!accountSid || !authToken) {
  console.error('❌ Missing Twilio credentials!')
  console.error('Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in your .env file')
  process.exit(1)
}

const client = twilio(accountSid, authToken)

async function setupTwilio() {
  try {
    console.log('Setting up Twilio voice assistant...')
    
    // Get your phone number from environment or use default
    const phoneNumber = process.env.TWILIO_PHONE_NUMBER || '+61340527417'
    
    // You need to configure the webhook URL in Twilio Console
    // Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/incoming
    // Click on your phone number
    // Set the webhook URL to: https://your-domain.com/api/voice/webhook
    // For local development, use ngrok: https://your-ngrok-url.ngrok.io/api/voice/webhook
    
    console.log('✅ Twilio credentials configured')
    console.log('📞 Phone number:', phoneNumber)
    console.log('🔗 Webhook URL needed:', 'https://your-domain.com/api/voice/webhook')
    console.log('')
    console.log('Next steps:')
    console.log('1. Deploy your app to get a public URL')
    console.log('2. Or use ngrok for local development: npx ngrok http 3000')
    console.log('3. Configure the webhook URL in Twilio Console')
    console.log('4. Test by calling your Twilio number!')
    
  } catch (error) {
    console.error('Error setting up Twilio:', error)
  }
}

setupTwilio()
