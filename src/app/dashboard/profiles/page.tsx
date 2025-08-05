'use client'

import { useEffect, useState } from 'react'
import { Climber } from '@/lib/interfaces/user-info'
import Link from 'next/link'

export default function ProfilesPage() {
  const [climbers, setClimbers] = useState<Climber[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchClimbers = async () => {
      try {
        const response = await fetch('/api/climbers')
        const data = await response.json()
        
        if (data.success) {
          setClimbers(data.climbers)
        } else {
          setError(data.error || 'Failed to fetch climbers')
        }
      } catch (err) {
        setError('Failed to fetch climbers')
        console.error('Error fetching climbers:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchClimbers()
  }, [])

  if (loading) {
    return (
      <div className="text-center">
        <div className="text-lg">Loading profiles...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    )
  }

  return (
    <>
      <section className="flex flex-col items-center gap-4 text-center text-sm/6 font-[family-name:var(--font-geist-mono)] sm:text-left sm:items-start">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-center sm:text-left">
          👤 Climber Profiles
        </h1>
        <p className="text-gray-400 max-w-xl text-center sm:text-left">
          View and vote on climber profiles, nicknames, and photos.
        </p>
      </section>

      <section className="flex flex-col gap-2 text-sm/6 font-[family-name:var(--font-geist-mono)] text-left w-full">
        <h2 className="text-base sm:text-lg font-semibold">🎯 Choose a Profile to Vote/Upload</h2>
        
        {climbers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {climbers.map(climber => (
              <div key={climber.id} className="bg-white dark:bg-black p-6 rounded-lg border border-black/[0.08] dark:border-white/[0.12] flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-2xl font-bold text-gray-600 mb-4">
                  {climber.first_name.charAt(0)}{climber.last_name.charAt(0)}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {climber.first_name} {climber.last_name}
                </h3>
                {climber.nickname && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    &ldquo;{climber.nickname}&rdquo;
                  </p>
                )}
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-4 space-y-1">
                  <div>Working Grade: V{climber.working_grade}</div>
                  <div>Score: {climber.running_score} pts</div>
                </div>
                <Link
                  href={`/dashboard/profiles/${climber.id}`}
                  className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                >
                  View & Vote →
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500">No climbers found</div>
          </div>
        )}

        <p className="text-xs text-gray-500 mt-4">
          Total climbers: {climbers.length}
        </p>
      </section>

      <section className="flex flex-col gap-2 text-sm/6 font-[family-name:var(--font-geist-mono)] text-left">
        <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-500 text-sm font-medium">
          ← Back to Dashboard
        </Link>
      </section>
    </>
  )
}