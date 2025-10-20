// Setup script for Twilio voice assistant
// Run this to configure your Twilio phone number

const twilio = require('twilio')

const accountSid = 'AC39196d44d80507cb020bda95e7bbdb1a'
const authToken = '2d816aebc32da6884a70f08cef5149f1'
const client = twilio(accountSid, authToken)

async function setupTwilio() {
  try {
    console.log('Setting up Twilio voice assistant...')
    
    // Get your phone number
    const phoneNumber = '+61340527417'
    
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
