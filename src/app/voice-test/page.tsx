'use client'

import { useState } from 'react'
import { Phone, Mic, Volume2 } from 'lucide-react'

export default function VoiceTestPage() {
  const [isCalling, setIsCalling] = useState(false)
  const [testResults, setTestResults] = useState<string[]>([])

  const testVoiceAssistant = async () => {
    setIsCalling(true)
    setTestResults(['Testing voice assistant...'])
    
    try {
      // Test the webhook endpoint
      const response = await fetch('/api/voice/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          SpeechResult: 'Hello, I want to create a new project for ABC Construction',
          CallSid: 'test-call-123'
        })
      })
      
      const result = await response.text()
      setTestResults(prev => [...prev, '✅ Webhook response received', result])
      
    } catch (error) {
      setTestResults(prev => [...prev, '❌ Error:', error.message])
    } finally {
      setIsCalling(false)
    }
  }

  const testAIProcessing = async () => {
    setTestResults(prev => [...prev, 'Testing AI processing...'])
    
    try {
      const response = await fetch('/api/voice/test-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          speech: 'Create a new project for XYZ Company called Kitchen Renovation'
        })
      })
      
      const result = await response.json()
      setTestResults(prev => [...prev, '✅ AI Response:', result.response])
      
    } catch (error) {
      setTestResults(prev => [...prev, '❌ AI Error:', error.message])
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Voice Assistant Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Test Controls */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
            
            <div className="space-y-4">
              <button
                onClick={testVoiceAssistant}
                disabled={isCalling}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Phone className="h-5 w-5" />
                <span>Test Webhook</span>
              </button>
              
              <button
                onClick={testAIProcessing}
                className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                <Mic className="h-5 w-5" />
                <span>Test AI Processing</span>
              </button>
            </div>
          </div>

          {/* Phone Number Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Voice Assistant Info</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Twilio Phone Number</label>
                <p className="text-lg font-mono bg-gray-100 p-2 rounded">+61 3 4052 7417</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Webhook URL</label>
                <p className="text-sm text-gray-600 break-all">
                  https://your-domain.com/api/voice/webhook
                </p>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-medium text-yellow-800">Setup Required</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Configure the webhook URL in your Twilio Console to enable voice calls.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500">No tests run yet. Click a test button above.</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="mb-1">{result}</div>
              ))
            )}
          </div>
        </div>

        {/* Voice Commands Help */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Voice Commands</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Project Management</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• "Create a new project for [client]"</li>
                <li>• "What's the status of project [number]?"</li>
                <li>• "Show me all projects"</li>
                <li>• "List projects in progress"</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Task Management</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• "Add a task to project [number]"</li>
                <li>• "Mark material [name] as ordered"</li>
                <li>• "Update the budget for project [number]"</li>
              </ul>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
              <h3 className="font-medium text-green-800 mb-2">🧠 Memory Features</h3>
              <p className="text-sm text-green-700 mb-2">
                The voice assistant now has conversation memory! You can have multi-turn conversations:
              </p>
              <ul className="text-sm text-green-600 space-y-1">
                <li>• "Create a new project for ABC Construction"</li>
                <li>• "The project name is Kitchen Renovation" (remembers the project)</li>
                <li>• "Add a task to order timber" (knows which project you're talking about)</li>
                <li>• "What's the status?" (remembers the project context)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
