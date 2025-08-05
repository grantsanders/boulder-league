'use client'

import { useEffect, useState } from 'react'
import { Climber } from '@/lib/interfaces/user-info'
import Link from 'next/link'

const podiumColors = [
  'bg-yellow-400', // Gold
  'bg-gray-300',   // Silver
  'bg-orange-500', // Bronze
]

const podiumShadow = [
  'shadow-yellow-400/60',
  'shadow-gray-300/60',
  'shadow-orange-500/60',
]

export default function LeaderboardPage() {
  const [climbers, setClimbers] = useState<Climber[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchClimbers = async () => {
      try {
        const response = await fetch('/api/climbers')
        const data = await response.json()
        
        if (data.success) {
          // Sort climbers by running_score from high to low
          const sortedClimbers = data.climbers.sort((a: Climber, b: Climber) => b.running_score - a.running_score)
          setClimbers(sortedClimbers)
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
        <div className="text-lg">Loading leaderboard...</div>
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

  const podium = climbers.slice(0, 3)

  return (
    <>
      <section className="flex flex-col items-center gap-4 text-center text-sm/6 font-[family-name:var(--font-geist-mono)] sm:text-left sm:items-start">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-center sm:text-left">
          🏆 Boulder League Leaderboard
        </h1>
        <p className="text-gray-400 max-w-xl text-center sm:text-left">
          See how you rank against other climbers in the Boulder League.
        </p>
      </section>

      {/* Podium */}
      {podium.length > 0 && (
        <section className="flex flex-col gap-2 text-sm/6 font-[family-name:var(--font-geist-mono)] text-left">
          <h2 className="text-base sm:text-lg font-semibold">🏅 Top 3 Climbers</h2>
          <div className="flex justify-center items-end gap-4 mb-10">
            {/* 2nd Place */}
            {podium[1] && (
              <div className="flex flex-col items-center">
                <div className={`w-20 h-20 rounded-full border-4 border-white -mb-4 z-10 bg-gray-100 flex items-center justify-center shadow-lg ${podiumShadow[1]}`}>
                  <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-2xl font-bold text-gray-600">
                    {podium[1].first_name.charAt(0)}{podium[1].last_name.charAt(0)}
                  </div>
                </div>
                <div className={`w-20 h-24 flex flex-col items-center justify-end ${podiumColors[1]} rounded-t-md`}>
                  <span className="text-lg font-bold mb-1">2</span>
                  <span className="font-semibold text-sm text-center px-1">{podium[1].first_name} {podium[1].last_name}</span>
                  <span className="text-xs">{podium[1].running_score} pts</span>
                </div>
              </div>
            )}
            {/* 1st Place */}
            {podium[0] && (
              <div className="flex flex-col items-center">
                <div className={`w-24 h-24 rounded-full border-4 border-white -mb-6 z-20 bg-gray-100 flex items-center justify-center shadow-xl ${podiumShadow[0]}`}>
                  <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-3xl font-bold text-gray-600">
                    {podium[0].first_name.charAt(0)}{podium[0].last_name.charAt(0)}
                  </div>
                </div>
                <div className={`w-24 h-32 flex flex-col items-center justify-end ${podiumColors[0]} rounded-t-md`}>
                  <span className="text-xl font-bold mb-1">1</span>
                  <span className="font-semibold text-sm text-center px-1">{podium[0].first_name} {podium[0].last_name}</span>
                  <span className="text-sm">{podium[0].running_score} pts</span>
                </div>
              </div>
            )}
            {/* 3rd Place */}
            {podium[2] && (
              <div className="flex flex-col items-center">
                <div className={`w-20 h-20 rounded-full border-4 border-white -mb-4 z-10 bg-gray-100 flex items-center justify-center shadow-lg ${podiumShadow[2]}`}>
                  <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-2xl font-bold text-gray-600">
                    {podium[2].first_name.charAt(0)}{podium[2].last_name.charAt(0)}
                  </div>
                </div>
                <div className={`w-20 h-20 flex flex-col items-center justify-end ${podiumColors[2]} rounded-t-md`}>
                  <span className="text-lg font-bold mb-1">3</span>
                  <span className="font-semibold text-sm text-center px-1">{podium[2].first_name} {podium[2].last_name}</span>
                  <span className="text-xs">{podium[2].running_score} pts</span>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Full Leaderboard Table */}
      <section className="flex flex-col gap-2 text-sm/6 font-[family-name:var(--font-geist-mono)] text-left w-full">
        <h2 className="text-base sm:text-lg font-semibold">📊 Complete Leaderboard</h2>
        <div className="border border-black/[0.08] dark:border-white/[0.12] rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-white/[0.06]">
              <thead className="bg-black/[0.05] dark:bg-white/[0.06]">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 dark:border-white/[0.06]">
                    Place
                  </th>
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
                    Score
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ascents of Next Grade
                  </th>
                </tr>
              </thead>
                              <tbody className="bg-white dark:bg-black divide-y divide-gray-200 dark:divide-white/[0.06]">
                  {climbers.map((climber, index) => (
                    <tr key={climber.uuid} className="odd:bg-black/[0.02] dark:odd:bg-white/[0.08] even:bg-white dark:even:bg-black">
                    <td className="px-3 py-1.5 border-r border-gray-200 dark:border-white/[0.06]">
                      <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {index + 1}
                      </div>
                    </td>
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

      <section className="flex flex-col gap-2 text-sm/6 font-[family-name:var(--font-geist-mono)] text-left">
        <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-500 text-sm font-medium">
          ← Back to Dashboard
        </Link>
      </section>
    </>
  )
}