import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'
import { processVoiceCommand } from '@/lib/voiceAssistant'

const VoiceResponse = twilio.twiml.VoiceResponse

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const twiml = new VoiceResponse()
    
    // Get the speech result from Twilio
    const speechResult = formData.get('SpeechResult') as string
    const callSid = formData.get('CallSid') as string
    
    console.log('Received speech:', speechResult)
    console.log('Call SID:', callSid)
    
        if (speechResult) {
          // Process the speech with AI (pass callSid for session memory)
          const aiResponse = await processVoiceCommand(speechResult, callSid)
          
          // Convert AI response to speech
          twiml.say(aiResponse)
      
      // Ask for next command
      twiml.gather({
        input: 'speech',
        timeout: 10,
        speechTimeout: 'auto',
        action: '/api/voice/webhook',
        method: 'POST'
      })
    } else {
      // Initial greeting
      twiml.say('Hello! I am your joinery project assistant. I can help you create projects, add tasks, check status, and manage materials. How can I help you today?')
      twiml.gather({
        input: 'speech',
        timeout: 10,
        speechTimeout: 'auto',
        action: '/api/voice/webhook',
        method: 'POST'
      })
    }
    
    // If no speech detected, say goodbye
    twiml.say('Thank you for calling. Goodbye!')
    twiml.hangup()
    
    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' }
    })
    
  } catch (error) {
    console.error('Voice webhook error:', error)
    const twiml = new VoiceResponse()
    twiml.say('Sorry, I encountered an error. Please try again later.')
    twiml.hangup()
    
    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' }
    })
  }
}
