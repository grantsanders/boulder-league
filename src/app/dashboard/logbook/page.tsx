'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { calculatePersonalPoints } from '@/lib/utils/score-calculator'
import { Climber } from '@/lib/interfaces/user-info'

interface AscentWithId {
  id: string
  uuid: string
  name?: string
  description: string
  working_grade_when_sent: number
  absolute_grade: number
  is_flash: boolean
  sent_date: string
  create_date: string
  [key: string]: unknown
}

type SortKey = 'absolute_grade' | 'name' | 'created_at';
type SortDirection = 'asc' | 'desc';

export default function LogbookPage() {
  const { user, loading } = useAuth()
  const [ascents, setAscents] = useState<AscentWithId[]>([])
  const [climber, setClimber] = useState<Climber | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setDataLoading(false)
        return
      }
      
      try {
        // Fetch climber data
        const climberRes = await fetch(`/api/climbers?uuid=${user.id}`)
        const climberResult = await climberRes.json()
        if (climberResult.success && climberResult.climbers?.length > 0) {
          setClimber(climberResult.climbers[0])
        }

        // Fetch ascents
        const ascentsRes = await fetch(`/api/ascents?user_id=${user.id}`)
        const ascentsResult = await ascentsRes.json()
        if (ascentsResult.success) {
          setAscents(ascentsResult.ascents || [])
        } else {
          setDataError('Failed to load ascents')
        }
      } catch {
        setDataError('Failed to load data')
      }
      setDataLoading(false)
    }
    fetchData()
  }, [user?.id])

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  function getSortedAscents() {
    const sorted = [...ascents]
    sorted.sort((a, b) => {
      let aValue: unknown = a[sortKey]
      let bValue: unknown = b[sortKey]
      if (sortKey === 'name') {
        aValue = (aValue as string)?.toLowerCase() || ''
        bValue = (bValue as string)?.toLowerCase() || ''
      }
      if ((aValue as number) < (bValue as number)) return sortDirection === 'asc' ? -1 : 1
      if ((aValue as number) > (bValue as number)) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }

  async function handleRemove(ascentId: string) {
    if (!window.confirm('Are you sure you want to remove this ascent?')) return;
    try {
      const res = await fetch(`/api/ascents/${ascentId}`, { method: 'DELETE' })
      if (res.ok) {
        setAscents(prev => prev.filter(a => a.id !== ascentId))
      } else {
        alert('Failed to remove ascent.')
      }
    } catch {
      alert('Failed to remove ascent.')
    }
  }

  if (loading || dataLoading) {
    return <div className="text-center py-8 text-lg">Loading your logbook...</div>
  }

  if (!user) {
    return null
  }

  const sortedAscents = getSortedAscents()

  return (
    <main className="max-w-3xl mx-auto py-8 w-full">
      <h1 className="text-2xl font-bold mb-6">📝 Logbook</h1>
      {dataError ? (
        <div className="text-red-600 mb-4">{dataError}</div>
      ) : ascents.length === 0 ? (
        <div className="text-gray-400">No ascents logged yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-black/[0.08] dark:border-white/[0.12] rounded-md overflow-hidden text-left">
            <thead className="bg-black/[0.05] dark:bg-white/[0.06]">
              <tr>
                <th
                  className="px-3 py-2 border-r border-black/[0.08] dark:border-white/[0.06] text-xs font-semibold text-gray-700 dark:text-gray-200 cursor-pointer select-none"
                  onClick={() => handleSort('created_at')}
                >
                  Date
                  {sortKey === 'created_at' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                </th>
                <th
                  className="px-3 py-2 border-r border-black/[0.08] dark:border-white/[0.06] text-xs font-semibold text-gray-700 dark:text-gray-200 cursor-pointer select-none"
                  onClick={() => handleSort('name')}
                >
                  Problem
                  {sortKey === 'name' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                </th>
                <th
                  className="px-3 py-2 border-r border-black/[0.08] dark:border-white/[0.06] text-xs font-semibold text-gray-700 dark:text-gray-200 cursor-pointer select-none"
                  onClick={() => handleSort('absolute_grade')}
                >
                  Grade
                  {sortKey === 'absolute_grade' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                </th>
                <th className="px-3 py-2 border-r border-black/[0.08] dark:border-white/[0.06] text-xs font-semibold text-gray-700 dark:text-gray-200">
                  Working Grade When Sent
                </th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200">Points</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200">Flash?</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200">Remove</th>
              </tr>
            </thead>
            <tbody>
              {sortedAscents.map((ascent, idx) => (
                <tr key={ascent.id} className={idx % 2 === 0 ? 'bg-white dark:bg-black/[0.02]' : 'bg-black/[0.02] dark:bg-white/[0.03]'}>
                  <td className="px-3 py-1.5 border-r border-black/[0.08] dark:border-white/[0.06] text-gray-900 dark:text-gray-100 whitespace-nowrap">{new Date(ascent.sent_date).toLocaleDateString()}</td>
                  <td className="px-3 py-1.5 border-r border-black/[0.08] dark:border-white/[0.06] text-gray-900 dark:text-gray-100">{ascent.name || '-'}</td>
                  <td className="px-3 py-1.5 border-r border-black/[0.08] dark:border-white/[0.06] text-indigo-600 dark:text-indigo-400">V{ascent.absolute_grade}</td>
                  <td className="px-3 py-1.5 border-r border-black/[0.08] dark:border-white/[0.06] text-blue-600 dark:text-blue-400">V{ascent.working_grade_when_sent}</td>
                  <td className="px-3 py-1.5 text-yellow-700 dark:text-yellow-400 text-center font-semibold">
                    {climber ? calculatePersonalPoints(climber, {
                      uuid: ascent.uuid,
                      name: ascent.name || '',
                      description: ascent.description,
                      working_grade_when_sent: ascent.working_grade_when_sent,
                      absolute_grade: ascent.absolute_grade,
                      is_flash: ascent.is_flash,
                      sent_date: ascent.sent_date,
                      create_date: ascent.create_date
                    }) : '—'}
                  </td>
                  <td className="px-3 py-1.5 text-green-700 dark:text-green-400 text-center">{ascent.is_flash ? '⚡' : '-'}</td>
                  <td className="px-3 py-1.5 text-center">
                    <button
                      onClick={() => handleRemove(ascent.id)}
                      className="text-red-600 hover:text-red-800 text-xs font-medium underline"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
} 