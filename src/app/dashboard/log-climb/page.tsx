'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { calculatePersonalPoints } from '@/lib/utils/score-calculator'
import { Ascent } from '@/lib/interfaces/scoring'

export default function LogClimbPage() {
  const { user } = useAuth()
  const [climbName, setClimbName] = useState('')
  const [absoluteGrade, setAbsoluteGrade] = useState('')
  const [isFlash, setIsFlash] = useState(false)
  const [sendNotes, setSendNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [userWorkingGrade, setUserWorkingGrade] = useState(0)
  const [userLoading, setUserLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) {
        setUserLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/climbers?uuid=${user.id}`)
        const data = await response.json()
        
        if (data.success && data.climbers && data.climbers.length > 0) {
          const climber = data.climbers[0]
          setUserWorkingGrade(climber.working_grade || 0)
          setAbsoluteGrade((climber.working_grade || 0).toString())
        } else {
          // If no climber found, default to V0
          setUserWorkingGrade(0)
          setAbsoluteGrade('0')
        }
      } catch (err) {
        console.error('Error fetching user data:', err)
        setUserWorkingGrade(0)
        setAbsoluteGrade('0')
      } finally {
        setUserLoading(false)
      }
    }

    fetchUserData()
  }, [user?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const ascentData = {
        name: climbName,
        description: sendNotes, // Map send notes to description
        working_grade_when_sent: userWorkingGrade,
        absolute_grade: parseInt(absoluteGrade),
        is_flash: isFlash,
        sent_date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
        create_date: new Date().toISOString(),
        climber_uuid: user?.id
      }

      const response = await fetch('/api/ascents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ascentData),
      })

      const result = await response.json()

      if (result.success) {
        // Recalculate and update the climber's score
        try {
          // Fetch current climber data
          const climberResponse = await fetch(`/api/climbers?uuid=${user?.id}`)
          const climberData = await climberResponse.json()
          
          if (climberData.success && climberData.climbers && climberData.climbers.length > 0) {
            const climber = climberData.climbers[0]
            
            // Calculate new points from this ascent
            const newPoints = calculatePersonalPoints(climber, {
              absolute_grade: parseInt(absoluteGrade),
              working_grade_when_sent: userWorkingGrade,
              is_flash: isFlash
            } as Ascent)
            
            // Calculate new running score
            // const newRunningScore = climber.running_score + newPoints
            
            // Update the climber's score
            // const updateResponse = await fetch('/api/climbers', {
            //   method: 'PUT',
            //   headers: {
            //     'Content-Type': 'application/json',
            //   },
            //   body: JSON.stringify({
            //     climber_uuid: user?.id,
            //     new_score: newRunningScore
            //   }),
            // })
            
            // const updateResult = await updateResponse.json()
            // if (!updateResult.success) {
            //   console.error('Failed to update score:', updateResult.error)
            // }
          }
        } catch (scoreError) {
          console.error('Error updating score:', scoreError)
          // Don't fail the climb logging if score update fails
        }
        
        setSuccess(true)
        setClimbName('')
        setAbsoluteGrade('')
        setIsFlash(false)
        setSendNotes('')
      } else {
        setError(result.error || 'Failed to log climb. Please try again.')
      }
    } catch (err) {
      setError('Failed to log climb. Please try again.')
      console.error('Error logging climb:', err)
    } finally {
      setLoading(false)
    }
  }

  if (userLoading) {
    return (
      <div className="text-center">
        <div className="text-lg">Loading your climbing profile...</div>
      </div>
    )
  }

  if (success) {
    return (
      <>
        <section className="flex flex-col items-center gap-4 text-center text-sm/6 font-[family-name:var(--font-geist-mono)] sm:text-left sm:items-start">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-center sm:text-left">
            ✅ Climb Logged Successfully!
          </h1>
          <p className="text-gray-400 max-w-xl text-center sm:text-left">
            Your climb has been recorded. Keep pushing your limits!
          </p>
        </section>

        <section className="flex flex-col gap-2 text-sm/6 font-[family-name:var(--font-geist-mono)] text-left">
          <div className="text-center space-y-4">
            <Link
              href="/dashboard/log-climb"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              onClick={() => setSuccess(false)}
            >
              Log Another Climb
            </Link>
            <div className="block">
              <Link
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <section className="flex flex-col items-center gap-4 text-center text-sm/6 font-[family-name:var(--font-geist-mono)] sm:text-left sm:items-start">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-center sm:text-left">
          🧗‍♂️ Log New Climb
        </h1>
        <p className="text-gray-400 max-w-xl text-center sm:text-left">
          Record your latest climbing achievement and track your progress.
        </p>
      </section>

      <section className="flex flex-col gap-2 text-sm/6 font-[family-name:var(--font-geist-mono)] text-left w-full max-w-md mx-auto">
        <h2 className="text-base sm:text-lg font-semibold">📝 Climb Details</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="climbName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Climb Name *
            </label>
            <input
              type="text"
              id="climbName"
              value={climbName}
              onChange={(e) => setClimbName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
              placeholder="what was the proj???"
            />
          </div>

          <div>
            <label htmlFor="sendNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Send Notes (Optional)
            </label>
            <textarea
              id="sendNotes"
              value={sendNotes}
              onChange={(e) => setSendNotes(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white resize-none"
              placeholder="tell us about it gang"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Absolute Grade (V-grade) *
            </label>
            {!userLoading ? (
              <>
                <div className="flex items-center justify-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      const currentGrade = parseInt(absoluteGrade) || 0
                      if (currentGrade > 0) {
                        setAbsoluteGrade((currentGrade - 1).toString())
                      }
                    }}
                    disabled={parseInt(absoluteGrade) <= 0}
                    className="w-10 h-10 flex items-center justify-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg border border-gray-300 dark:border-gray-600 transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  
                  <div className="px-6 py-2 bg-white dark:bg-gray-800 border-t border-b border-gray-300 dark:border-gray-600 min-w-[80px] text-center">
                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {absoluteGrade ? `V${absoluteGrade}` : 'V0'}
                    </span>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => {
                      const currentGrade = parseInt(absoluteGrade) || 0
                      if (currentGrade < 16) {
                        setAbsoluteGrade((currentGrade + 1).toString())
                      }
                    }}
                    disabled={parseInt(absoluteGrade) >= 16}
                    className="w-10 h-10 flex items-center justify-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-lg border border-gray-300 dark:border-gray-600 transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  Your working grade: V{userWorkingGrade} • Use + and - buttons to adjust
                </p>
              </>
            ) : (
              <div className="flex items-center justify-center py-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Loading your working grade...
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isFlash"
                checked={isFlash}
                onChange={(e) => setIsFlash(e.target.checked)}
                className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Did you flash?
              </span>
              {isFlash && (
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  dude nice
                </span>
              )}
            </label>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Logging...' : 'Log Climb'}
            </button>
            <Link
              href="/dashboard"
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </>
  )
} 