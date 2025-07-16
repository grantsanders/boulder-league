'use client'

import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Climber } from '@/lib/interfaces/user-info'
import { Ascent } from '@/lib/interfaces/scoring'

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [climberData, setClimberData] = useState<Climber | null>(null)
  const [ascentsData, setAscentsData] = useState<Ascent[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)

  useEffect(() => {
    console.log('Dashboard - Loading:', loading, 'User:', user ? 'authenticated' : 'not authenticated')
    if (!loading && !user) {
      console.log('Dashboard - Redirecting to home page')
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) {
        setDataLoading(false)
        return
      }

      try {
        // Fetch climber data
        const climberResponse = await fetch(`/api/climbers?uuid=${user.id}`)
        const climberResult = await climberResponse.json()
        
        if (climberResult.success && climberResult.climbers && climberResult.climbers.length > 0) {
          setClimberData(climberResult.climbers[0])
        }

        // Fetch user's ascents
        const ascentsResponse = await fetch(`/api/ascents?user_id=${user.id}`)
        const ascentsResult = await ascentsResponse.json()
        
        if (ascentsResult.success) {
          setAscentsData(ascentsResult.ascents || [])
        }
      } catch (err) {
        console.error('Error fetching user data:', err)
        setDataError('Failed to load your climbing data')
      } finally {
        setDataLoading(false)
      }
    }

    fetchUserData()
  }, [user?.id])

  const handleSignOut = async () => {
    await signOut()
  }

  // Show loading while checking auth status or fetching user data
  if (loading || dataLoading) {
    return (
      <div className="text-center">
        <div className="text-lg">Loading your dashboard...</div>
      </div>
    )
  }

  // Don't render anything if not authenticated (will redirect)
  if (!user) {
    return null
  }

  return (
    <>
      {/* User info and sign out */}
      <div className="absolute top-4 left-4 flex items-center space-x-4">
        <span className="text-sm text-gray-600">
          Welcome, {user?.user_metadata?.display_name || user?.email}
        </span>
        <button
          onClick={handleSignOut}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Sign Out
        </button>
      </div>

      <section className="flex flex-col items-center gap-4 text-center text-sm/6 font-[family-name:var(--font-geist-mono)] sm:text-left sm:items-start">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-center sm:text-left">
          🧗‍♂️ Boulder League Dashboard
        </h1>
        <p className="text-gray-400 max-w-xl text-center sm:text-left">
          Track your climbing progress, view your working grade, and see your scores.
        </p>
      </section>

      <section className="flex flex-col gap-2 text-sm/6 font-[family-name:var(--font-geist-mono)] text-left w-full">
        {dataError ? (
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">{dataError}</div>
            <button 
              onClick={() => window.location.reload()} 
              className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto w-full">
            <div className="bg-white dark:bg-black p-6 rounded-lg border border-black/[0.08] dark:border-white/[0.12]">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Working Grade
              </h3>
              <p className="text-3xl font-bold text-indigo-600">
                V{climberData?.current_working_grade || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {climberData?.current_working_grade ? 'Your current working grade' : 'Start climbing to see your grade!'}
              </p>
            </div>

            <div className="bg-white dark:bg-black p-6 rounded-lg border border-black/[0.08] dark:border-white/[0.12]">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Total Points
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {climberData?.running_score || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Points earned this season
              </p>
            </div>

            <div className="bg-white dark:bg-black p-6 rounded-lg border border-black/[0.08] dark:border-white/[0.12]">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Problems Sent
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {ascentsData.length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                New problems completed
              </p>
            </div>
          </div>
        )}

                  <div className="text-center mt-8 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              View Rules
            </Link>
            <div className="block">
              <Link
                href="/dashboard/log-climb"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
              >
                🧗‍♂️ Log Climb
              </Link>
            </div>
          </div>
      </section>
    </>
  )
} 