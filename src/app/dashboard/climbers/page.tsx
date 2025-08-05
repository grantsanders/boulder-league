'use client'

import { useEffect, useState } from 'react'
import { Climber } from '@/lib/interfaces/user-info'

export default function ClimbersPage() {
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
        <div className="text-lg">Loading climbers...</div>
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
          👥 Boulder League Climbers
        </h1>
        <p className="text-gray-400 max-w-xl text-center sm:text-left">
          All registered climbers in the Boulder League competition.
        </p>
      </section>

      <section className="flex flex-col gap-2 text-sm/6 font-[family-name:var(--font-geist-mono)] text-left w-full">
        <h2 className="text-base sm:text-lg font-semibold">📋 Climbers Directory</h2>
        <div className="border border-black/[0.08] dark:border-white/[0.12] rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-white/[0.06]">
              <thead className="bg-black/[0.05] dark:bg-white/[0.06]">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 dark:border-white/[0.06]">
                    Name
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 dark:border-white/[0.06]">
                    Nickname
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 dark:border-white/[0.06]">
                    Working Grade
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 dark:border-white/[0.06]">
                    Running Score
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ascents of Next Grade
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-black divide-y divide-gray-200 dark:divide-white/[0.06]">
                {climbers.map((climber) => (
                  <tr key={climber.uuid} className="odd:bg-black/[0.02] dark:odd:bg-white/[0.08] even:bg-white dark:even:bg-black">
                    <td className="px-3 py-1.5 border-r border-gray-200 dark:border-white/[0.06]">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {climber.first_name} {climber.last_name}
                      </div>
                    </td>
                    <td className="px-3 py-1.5 border-r border-gray-200 dark:border-white/[0.06]">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {/* {climber.nickname || '—'} */}
                      </div>
                    </td>
                    <td className="px-3 py-1.5 border-r border-gray-200 dark:border-white/[0.06]">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        V{climber.working_grade}
                      </div>
                    </td>
                    <td className="px-3 py-1.5 border-r border-gray-200 dark:border-white/[0.06]">
                      <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {climber.running_score}
                      </div>
                    </td>
                    <td className="px-3 py-1.5">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {climber.ascents_of_next_grade}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {climbers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">No climbers found</div>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-500 mt-2">
          Total climbers: {climbers.length}
        </p>
      </section>
    </>
  )
} 