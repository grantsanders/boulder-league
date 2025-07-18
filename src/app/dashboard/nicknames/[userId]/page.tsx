'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { NicknameCandidate } from '@/lib/interfaces/voting'
import { useAuth } from '@/lib/auth-context'

export default function NicknameVotePage() {
  const { user } = useAuth()
  const params = useParams<{ userId: string }>()
  const userId = params.userId

  const [nicknames, setNicknames] = useState<NicknameCandidate[]>([])
  const [newNickname, setNewNickname] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNicknames = async () => {
      try {
        const response = await fetch(`/api/nickname_candidates?user_id=${userId}`)
        const data = await response.json()
        if (data.success) {
          setNicknames(data.candidates)
          console.log('Fetched nicknames:', data.candidates)
        } else {
          setError(data.error || 'Failed to fetch nicknames')
        }
      } catch (err) {
        console.error('Error fetching nicknames:', err)
        setError('Failed to fetch nicknames')
      } finally {
        setLoading(false)
      }
    }
    fetchNicknames()
  }, [userId])

  const handleSuggest = async () => {
    if (!newNickname.trim()) return
    const response = await fetch('/api/nickname_candidates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        nickname: newNickname,
        submitted_by: user?.id,
      }),
    })
    const data = await response.json()
    if (data.success) {
      setNicknames(prev => [...prev, data.candidates])
      setNewNickname('')
    } else {
      alert(data.error || 'Failed to suggest nickname')
    }
  }

  if (loading) return <div className="text-center py-8">Loading...</div>
  if (error) return <div className="text-center text-red-600 py-8">{error}</div>

  return (
    <main className="max-w-xl mx-auto py-8">
      <Link
        href="/dashboard/nicknames"
        className="text-indigo-600 dark:text-indigo-400 hover:underline mb-4 block"
      >
        ← Back to Nicknames
      </Link>
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Vote & Suggest Nicknames</h1>
      <ul className="space-y-4 mb-8">
        {(nicknames || []).map(nickname => (
          <li
            key={nickname.id}
            className="flex items-center gap-4 rounded p-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
          >
            <span className="font-semibold text-gray-800 dark:text-gray-100">{nickname.nickname}</span>
            {/* Add voting UI here */}
          </li>
        ))}
      </ul>
      <div className="rounded p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-700">
        <h2 className="font-semibold mb-2 text-gray-900 dark:text-white">Suggest a New Nickname</h2>
        <input
          type="text"
          value={newNickname}
          onChange={e => setNewNickname(e.target.value)}
          className="mb-2 px-2 py-1 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
          placeholder="Enter nickname"
        />
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          onClick={handleSuggest}
          disabled={!newNickname.trim()}
        >
          Suggest
        </button>
      </div>
    </main>
  )
}