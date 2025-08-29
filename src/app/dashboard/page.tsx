'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Climber } from '@/lib/interfaces/user-info'
import { Ascent } from '@/lib/interfaces/scoring'
import Modal from '@/lib/components/Modal'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [climberData, setClimberData] = useState<Climber | null>(null)
  const [ascentsData, setAscentsData] = useState<Ascent[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false)
  const [nextGradeAscents, setNextGradeAscents] = useState<string>('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (climberData) {
      if (climberData.promotion_input_needed) {
        console.log(climberData)
        setIsPromotionModalOpen(true);
      }
    }
  }, [climberData])
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) {
        setDataLoading(false)
        return
      }

      try {
        // Check for pending climber creation
        const pendingWorkingGrade = localStorage.getItem('pendingWorkingGrade')
        const pendingAscentsOfNextGrade = localStorage.getItem('pendingAscentsOfNextGrade')
        const pendingDisplayName = localStorage.getItem('pendingDisplayName')

        console.log('🔍 Checking for pending climber creation...')
        console.log('📦 Pending data:', { pendingWorkingGrade, pendingAscentsOfNextGrade, pendingDisplayName })

        if (pendingWorkingGrade && pendingDisplayName && pendingAscentsOfNextGrade) {
          console.log('👤 Creating climber record for new email user...')
          // Create climber record for new user
          const [firstName, ...lastNameParts] = pendingDisplayName.split(' ')
          const lastName = lastNameParts.join(' ') || 'User'

          console.log('📝 Climber data:', {
            id: user.id,
            first_name: firstName,
            last_name: lastName,
            working_grade: parseInt(pendingWorkingGrade),
            ascents_of_next_grade: parseInt(pendingAscentsOfNextGrade)
          })

          const climberResponse = await fetch('/api/climbers', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: user.id,
              first_name: firstName,
              last_name: lastName,
              working_grade: parseInt(pendingWorkingGrade),
              ascents_of_next_grade: parseInt(pendingAscentsOfNextGrade)
            }),
          })
          
          const climberResult = await climberResponse.json()

          console.log('👤 Climber creation result:', climberResult)
            
          if (climberResult.success) {
            console.log('✅ Climber created successfully, clearing pending data...')
            // Clear pending data
            localStorage.removeItem('pendingWorkingGrade')
            localStorage.removeItem('pendingAscentsOfNextGrade')
            localStorage.removeItem('pendingDisplayName')
            console.log('🧹 Pending data cleared')
          } else {
            console.log('❌ Climber creation failed:', climberResult.error)
          }
        } else {
          console.log('🔍 No pending climber data found, checking if user exists...')
          // Check if user exists but has no climbing data (OAuth user)
          const climberResponse = await fetch(`/api/climbers?id=${user.id}`)
          const climberResult = await climberResponse.json()

          if (climberResult.success && (!climberResult.climbers || climberResult.climbers.length === 0)) {
            // OAuth user without climbing data - they'll need to set it up later
            console.log('🔍 OAuth user detected without climbing data')
          }
        }

        // Fetch climber data
        const climberResponse = await fetch(`/api/climbers?id=${user.id}`)
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
      <Modal isOpen={isPromotionModalOpen} onClose={() => setIsPromotionModalOpen(false)}>
        <h2 className="text-lg font-semibold mb-4">{'You\'ve been promoted!'}</h2>
        <p className="mb-4">
          As of your last tick, you are officially a V{climberData!.working_grade} climber. <br/> <br/>
          congrats big dawg. <br/> <br/>
          How many boulders of the next grade (V{(climberData!.working_grade + 1)}) had you sent BEFORE September 22?
        </p>
        <div className="flex flex-col space-y-2">
          <input
            type="number"
            min={0}
            max={climberData!.working_grade + 1}
            className={`w-full p-2 border-2 border-color:gray rounded ${
              nextGradeAscents !== '' &&
              (isNaN(parseInt(nextGradeAscents)) ||
                parseInt(nextGradeAscents) < 0 ||
                parseInt(nextGradeAscents) > climberData!.working_grade + 1)
                ? 'border-red-500'
                : 'border-gray-300'
            }`}
            placeholder="Number of ascents"
            value={nextGradeAscents}
            onChange={(e) => setNextGradeAscents(e.target.value)}
          />
          {(nextGradeAscents !== '' && (parseInt(nextGradeAscents) < 0 || parseInt(nextGradeAscents) > climberData!.working_grade + 1)) && (
            <p className="text-sm text-red-500 mt-1">
              Must be between 0 and {climberData!.working_grade + 1}
            </p>
          )}
          <div className="flex justify-end">
            <button
              disabled={
                nextGradeAscents === '' ||
                isNaN(parseInt(nextGradeAscents)) ||
                parseInt(nextGradeAscents) < 0 ||
                parseInt(nextGradeAscents) > climberData!.working_grade + 1
              }
              onClick={async () => {
                if (user?.id && climberData) {
                  const response = await fetch('/api/climbers', {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      id: user.id,
                      ascents_of_next_grade: parseInt(nextGradeAscents),
                      promotion_input_needed: false
                    }),
                  });

                  const result = await response.json();
                  if (result.success) {
                    // Update local state
                    setClimberData({
                      ...climberData,
                      ascents_of_next_grade: parseInt(nextGradeAscents),
                      promotion_input_needed: false
                    });
                  }
                }
                setIsPromotionModalOpen(false);
              }}
              className={`bg-blue-500 text-white px-4 py-2 rounded ${
                (nextGradeAscents === '' ||
                isNaN(parseInt(nextGradeAscents)) ||
                parseInt(nextGradeAscents) < 0 ||
                parseInt(nextGradeAscents) > climberData!.working_grade + 1)
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
            >
              Submit
            </button>
          </div>
        </div>
      </Modal>

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
                V{climberData?.working_grade || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {climberData?.working_grade ? 'Your current working grade' : 'Start climbing to see your grade!'}
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
          <div className="block">
            <Link
              href="/dashboard/logbook"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              📒 Logbook
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}