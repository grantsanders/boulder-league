'use client'
import { useState } from 'react'
import Link from 'next/link'

// Mock nicknames for a user
const mockNicknames = [
  { id: 'a', name: 'Crusher', votes: 4 },
  { id: 'b', name: 'Spider', votes: 2 },
  { id: 'c', name: 'The Flash', votes: 1 },
]

export default function NicknameVotePage({ }: { params: { userId: string } }) {
  const [nicknames, setNicknames] = useState(mockNicknames)
  const [newNickname, setNewNickname] = useState('')

  const handleVote = (nicknameId: string) => {
    setNicknames(prev =>
      prev.map(n =>
        n.id === nicknameId ? { ...n, votes: n.votes + 1 } : n
      )
    )
    alert(`Voted for nickname (mock)`)
  }

  const handleSuggest = () => {
    if (newNickname.trim()) {
      setNicknames(prev => [
        ...prev,
        { id: Math.random().toString(36).slice(2), name: newNickname, votes: 1 },
      ])
      setNewNickname('')
      alert('Nickname suggested (mock)')
    }
  }

  return (
    <main className="max-w-xl mx-auto py-8">
      <Link href="/dashboard/nicknames" className="text-indigo-400 hover:underline mb-4 block">
        ← Back to Nicknames
      </Link>
      <h1 className="text-2xl font-bold mb-6">Vote & Suggest Nicknames</h1>
      <ul className="space-y-4 mb-8">
        {nicknames.map(nickname => (
          <li key={nickname.id} className="flex items-center gap-4 bg-gray-800 rounded p-3">
            <span className="font-semibold">{nickname.name}</span>
            <span className="font-mono">{nickname.votes} votes</span>
            <button
              className="ml-auto bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded"
              onClick={() => handleVote(nickname.id)}
            >
              Vote
            </button>
          </li>
        ))}
      </ul>
      <div className="bg-gray-700 rounded p-4">
        <h2 className="font-semibold mb-2">Suggest a New Nickname</h2>
        <input
          type="text"
          value={newNickname}
          onChange={e => setNewNickname(e.target.value)}
          className="mb-2 px-2 py-1 rounded w-full"
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