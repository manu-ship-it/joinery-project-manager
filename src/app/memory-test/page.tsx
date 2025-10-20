'use client'

import { useState } from 'react'

export default function MemoryTestPage() {
  const [conversation, setConversation] = useState<Array<{role: string, content: string}>>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return
    
    setLoading(true)
    const userMessage = input.trim()
    setInput('')
    
    // Add user message to conversation
    const newConversation = [...conversation, { role: 'user', content: userMessage }]
    setConversation(newConversation)
    
    try {
      const response = await fetch('/api/voice/test-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ speech: userMessage }),
      })
      
      const data = await response.json()
      
      // Add AI response to conversation
      setConversation([...newConversation, { role: 'assistant', content: data.response }])
      
    } catch (error) {
      console.error('Error:', error)
      setConversation([...newConversation, { role: 'assistant', content: 'Sorry, there was an error processing your request.' }])
    } finally {
      setLoading(false)
    }
  }

  const clearConversation = () => {
    setConversation([])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Memory Test - Voice Assistant</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Conversation Memory</h2>
          
          <div className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message here..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send'}
              </button>
              <button
                onClick={clearConversation}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Conversation</h2>
          
          {conversation.length === 0 ? (
            <p className="text-gray-500">Start a conversation to test memory...</p>
          ) : (
            <div className="space-y-4">
              {conversation.map((msg, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    msg.role === 'user' 
                      ? 'bg-blue-50 ml-8' 
                      : 'bg-gray-50 mr-8'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    <span className={`text-sm font-medium ${
                      msg.role === 'user' ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      {msg.role === 'user' ? 'You' : 'Assistant'}:
                    </span>
                    <span className="text-gray-800">{msg.content}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-800 mb-2">Test Memory with These Examples:</h3>
          <div className="space-y-2 text-sm text-yellow-700">
            <p><strong>Step 1:</strong> "Create a new project for ABC Construction"</p>
            <p><strong>Step 2:</strong> "The project name is Kitchen Renovation"</p>
            <p><strong>Step 3:</strong> "Add a task to order timber"</p>
            <p><strong>Step 4:</strong> "What's the status of that project?"</p>
            <p className="mt-2 text-xs text-yellow-600">
              The assistant should remember the client and project from previous messages.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
