'use client'

import { useState } from 'react'

export default function TimezoneTestPage() {
  const [testDate, setTestDate] = useState('2024-10-19') // Today's date
  const [result, setResult] = useState<number | null>(null)

  const getDaysUntilInstall = (installDate: string) => {
    // Get current date in Sydney timezone
    const now = new Date()
    const sydneyTime = new Date(now.toLocaleString("en-US", {timeZone: "Australia/Sydney"}))
    
    // Get install date in Sydney timezone (start of day)
    const installDateObj = new Date(installDate + 'T00:00:00')
    const sydneyInstallDate = new Date(installDateObj.toLocaleString("en-US", {timeZone: "Australia/Sydney"}))
    
    // Set both dates to start of day for accurate comparison
    const todayStart = new Date(sydneyTime.getFullYear(), sydneyTime.getMonth(), sydneyTime.getDate())
    const installStart = new Date(sydneyInstallDate.getFullYear(), sydneyInstallDate.getMonth(), sydneyInstallDate.getDate())
    
    const diffTime = installStart.getTime() - todayStart.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const testCalculation = () => {
    const days = getDaysUntilInstall(testDate)
    setResult(days)
  }

  const getCurrentSydneyDate = () => {
    const now = new Date()
    const sydneyTime = new Date(now.toLocaleString("en-US", {timeZone: "Australia/Sydney"}))
    return sydneyTime.toISOString().split('T')[0]
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#d4c68e' }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Timezone Test - Sydney Australia</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Date Calculation</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Sydney Date: {getCurrentSydneyDate()}
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Install Date:
              </label>
              <input
                type="date"
                value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={testCalculation}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Calculate Days Until Install
            </button>
            
            {result !== null && (
              <div className="p-4 bg-gray-100 rounded-lg">
                <h3 className="font-semibold mb-2">Result:</h3>
                <p className="text-lg">
                  <strong>{result} days until install</strong>
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {result === 0 ? 'Install today!' : 
                   result < 0 ? 'Install overdue!' : 
                   `Install in ${result} day${result !== 1 ? 's' : ''}`}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-800 mb-2">Test Cases:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Set install date to today → Should show 0 days</li>
            <li>• Set install date to tomorrow → Should show 1 day</li>
            <li>• Set install date to yesterday → Should show -1 days (overdue)</li>
            <li>• Set install date to next week → Should show 7 days</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
