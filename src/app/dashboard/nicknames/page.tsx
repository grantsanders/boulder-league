'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Climber } from '@/lib/interfaces/user-info'
import { useAuth } from '@/lib/auth-context'

export default function NicknamesPage() {
  const { user } = useAuth()
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
        console.error('Error fetching climbers:', err)
        setError('Failed to fetch climbers')
      } finally {
        setLoading(false)
      }
    }
    fetchClimbers()
  }, [])

  if (loading) return <div className="text-center py-8">Loading...</div>
  if (error) return <div className="text-center text-red-600 py-8">{error}</div>

  // Filter out the current user
  const filteredClimbers = climbers.filter(c => c.id !== user?.id)

  return (
    <main className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Vote/Submit Nicknames</h1>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {filteredClimbers.map(climber => (
          <li
            key={climber.id}
            className="rounded-lg p-4 flex flex-col items-center bg-white dark:bg-gray-800 shadow border border-gray-200 dark:border-gray-700"
          >
            <span className="font-semibold text-gray-800 dark:text-gray-100">
              {climber.first_name} {climber.last_name}
            </span>
            <Link
              href={`/dashboard/nicknames/${climber.id}`}
              className="mt-2 text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Vote & Suggest
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}