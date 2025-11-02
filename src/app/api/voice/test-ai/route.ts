import { NextRequest, NextResponse } from 'next/server'
import { processVoiceCommand } from '@/lib/voiceAssistant'

export async function POST(request: NextRequest) {
  try {
    const { speech } = await request.json()
    
    if (!speech) {
      return NextResponse.json({ error: 'No speech provided' }, { status: 400 })
    }
    
    console.log('Testing AI with speech:', speech)
    
    const response = await processVoiceCommand(speech, 'test-session')
    
    return NextResponse.json({ 
      speech,
      response,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Test AI error:', error)
    return NextResponse.json({ 
      error: 'Failed to process speech',
      details: error.message 
    }, { status: 500 })
  }
}
