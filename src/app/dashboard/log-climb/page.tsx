'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

export default function LogClimbPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [climbName, setClimbName] = useState('')
  const [absoluteGrade, setAbsoluteGrade] = useState('')
  const [isFlash, setIsFlash] = useState(false)
  const [sendNotes, setSendNotes] = useState('')
  const [climbDate, setClimbDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [userWorkingGrade, setUserWorkingGrade] = useState(0)
  const [userLoading, setUserLoading] = useState(true)

  // Initialize climb date to today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setClimbDate(today)
  }, [])

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) {
        setUserLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/climbers?id=${user.id}`)
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
        sent_date: climbDate, // Use selected date in YYYY-MM-DD format
        create_date: new Date().toISOString(),
        climber_id: user?.id
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
        // Check if working grade has been updated and promotion input is needed
        try {
          // Fetch current climber data from database
          const climberResponse = await fetch(`/api/climbers?id=${user?.id}`)
          const climberData = await climberResponse.json()
          
          if (climberData.success && climberData.climbers && climberData.climbers.length > 0) {
            const climber = climberData.climbers[0]
            
            // Check if promotion input is needed
            if (climber.promotion_input_needed) {
              // Redirect to dashboard where the promotion modal will be shown
              router.push('/dashboard')
              return
            }
          }
        } catch (error) {
          console.error('Error checking climber data:', error)
          // Don't fail the climb logging if this check fails
        }
        
        setSuccess(true)
        setClimbName('')
        setAbsoluteGrade('')
        setIsFlash(false)
        setSendNotes('')
        setClimbDate(new Date().toISOString().split('T')[0]) // Reset to today
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
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading your climbing profile...</div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            ✅ Climb Logged Successfully!
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm md:text-base">
            Your climb has been recorded. Keep pushing your limits!
          </p>
        </div>

        <Card className="w-full max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center space-y-3 md:space-y-4">
              <div className="space-y-3 md:space-y-4">
                <Button asChild variant="outline" className="text-blue-600 dark:text-blue-400 w-full">
                  <Link href="/dashboard/log-climb" onClick={() => setSuccess(false)}>
                    Log Another Climb
                  </Link>
                </Button>
                <Button asChild variant="outline" className="text-purple-600 dark:text-purple-400 w-full">
                  <Link href="/dashboard/logbook">
                    View Logbook
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/dashboard">
                    ← Back to Dashboard
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
          🧗‍♂️ Log New Climb
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm md:text-base">
          Record your latest climbing achievement and track your progress.
        </p>
      </div>

      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="pb-4 md:pb-6">
          <CardTitle className="text-lg md:text-xl">📝 Climb Details</CardTitle>
          <CardDescription className="text-sm">
            Fill in the details of your latest send
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="climbName" className="text-sm md:text-base">Climb Name *</Label>
              <Input
                type="text"
                id="climbName"
                value={climbName}
                onChange={(e) => setClimbName(e.target.value)}
                required
                placeholder="what was the proj???"
                className="text-sm md:text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="climbDate" className="text-sm md:text-base">Date Climbed *</Label>
              <Input
                type="date"
                id="climbDate"
                value={climbDate}
                onChange={(e) => setClimbDate(e.target.value)}
                min="2025-09-01"
                required
                className="text-sm md:text-base"
              />
              <p className="text-xs text-muted-foreground">
                Select the date you completed this climb (must be after September 1, 2025)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sendNotes" className="text-sm md:text-base">Send Notes (Optional)</Label>
              <textarea
                id="sendNotes"
                value={sendNotes}
                onChange={(e) => setSendNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring bg-background text-foreground resize-none text-sm md:text-base"
                placeholder="tell us about it gang"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm md:text-base">Absolute Grade (V-grade) *</Label>
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
                      className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-secondary hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg border border-input transition-colors"
                    >
                      <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    
                    <div className="px-4 md:px-6 py-2 bg-background border-t border-b border-input min-w-[60px] md:min-w-[80px] text-center">
                      <span className="text-base md:text-lg font-bold">
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
                      className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-secondary hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-lg border border-input transition-colors"
                    >
                      <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    Your working grade: V{userWorkingGrade} • Use + and - buttons to adjust
                  </p>
                </>
              ) : (
                <div className="flex items-center justify-center py-4">
                  <div className="text-sm text-muted-foreground">
                    Loading your working grade...
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isFlash"
                checked={isFlash}
                onChange={(e) => setIsFlash(e.target.checked)}
                className="w-4 h-4 text-primary bg-background border-input rounded focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
              <Label htmlFor="isFlash" className="text-sm font-medium">
                Did you flash?
              </Label>
              {isFlash && (
                <span className="text-xs text-muted-foreground ml-2">
                  dude nice
                </span>
              )}
            </div>

            {error && (
              <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            <Separator />

            <div className="flex flex-col gap-3 md:gap-4">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-600 hover:bg-gray-700 dark:bg-gray-400 dark:hover:bg-gray-500"
              >
                {loading ? 'Logging...' : 'Log Climb'}
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard">
                  Cancel
                </Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 