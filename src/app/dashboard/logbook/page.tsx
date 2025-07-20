'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { calculatePersonalPoints } from '@/lib/utils/score-calculator'

interface Ascent {
  id: string
  absolute_grade: number
  working_grade_when_sent: number
  is_flash: boolean
  created_at: string
  name?: string
  [key: string]: any
}

type SortKey = 'absolute_grade' | 'name' | 'created_at';
type SortDirection = 'asc' | 'desc';

export default function LogbookPage() {
  const { user, loading } = useAuth()
  const [ascents, setAscents] = useState<Ascent[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  useEffect(() => {
    const fetchAscents = async () => {
      if (!user?.id) {
        setDataLoading(false)
        return
      }
      try {
        const res = await fetch(`/api/ascents?user_id=${user.id}`)
        const result = await res.json()
        if (result.success) {
          setAscents(result.ascents || [])
        } else {
          setDataError('Failed to load ascents')
        }
      } catch (err: any) {
        setDataError('Failed to load ascents')
      }
      setDataLoading(false)
    }
    fetchAscents()
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
      let aValue: any = a[sortKey]
      let bValue: any = b[sortKey]
      if (sortKey === 'name') {
        aValue = aValue?.toLowerCase() || ''
        bValue = bValue?.toLowerCase() || ''
      }
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
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
  const climber = null; // If you have the climber object, use it here

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
                    {calculatePersonalPoints(climber as any, ascent as any)}
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