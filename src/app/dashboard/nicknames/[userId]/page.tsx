'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { NicknameCandidate } from '@/lib/interfaces/voting'
import { useAuth } from '@/lib/auth-context'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Bars3Icon } from '@heroicons/react/24/solid'

export default function NicknameVotePage() {
  const { user } = useAuth()
  const params = useParams<{ userId: string }>()
  const userId = params?.userId
  

  const [nicknames, setNicknames] = useState<NicknameCandidate[]>([])
  const [newNickname, setNewNickname] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const fetchNicknamesAndRanking = async () => {
      try {
        // Fetch nickname candidates
        const response = await fetch(`/api/nickname_candidates?user_id=${userId}`)
  const data = await response.json()
  const candidates = data.success ? data.candidates : [];

        // Fetch the current user's last vote for this user
        let rankedNicknames = candidates;
        if (user?.id && candidates.length > 0) {
          const voteRes = await fetch(`/api/votes?voter_id=${user.id}`);
          const voteData = await voteRes.json();
          if (voteData.success && Array.isArray(voteData.votes)) {
            // Define types for votes and candidates
            type Vote = { table_type: string; table_id: string; ranks: number };
            type Candidate = { id: string };
            const userVotes = (voteData.votes as Vote[]).filter((v: Vote) => v.table_type === 'nickname' && (candidates as Candidate[]).some((c: Candidate) => c.id === v.table_id));
            if (userVotes.length > 0) {
              // Sort by rank
              const idToRank: Record<string, number> = {};
              userVotes.forEach((v: Vote) => { idToRank[v.table_id] = v.ranks; });
              rankedNicknames = [...candidates].sort((a: Candidate, b: Candidate) => {
                const rankA = idToRank[a.id] ?? 999;
                const rankB = idToRank[b.id] ?? 999;
                return rankA - rankB;
              });
            }
          }
        }
        setNicknames(rankedNicknames);
        if (!data.success) setError(data.error || 'Failed to fetch nicknames');
      } catch (err) {
        console.error('Error fetching nicknames:', err);
        setError('Failed to fetch nicknames');
      } finally {
        setLoading(false);
      }
    };
    fetchNicknamesAndRanking();
  }, [userId, user?.id]);

  // Drag-and-drop handler
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return
    const items = Array.from(nicknames)
    const [reordered] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reordered)
    setNicknames(items)
  }

  // Handle nickname suggestion
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

  const handleDelete = async (nicknameId: string) => {
  const response = await fetch(`/api/nickname_candidates/${nicknameId}`, {
        method: 'DELETE',
    });
    const data = await response.json();
    if (data.success) {
        setNicknames(prev => prev.filter(n => n.id !== nicknameId));
    } else {
        alert(data.error || 'Failed to delete nickname');
    }
  };


  // Save ranking
  const handleSaveRanking = async () => {
    setSaving(true)
    setSuccess(null)
    try {
        const ranks = nicknames.map((n, i) => ({ id: n.id, rank: i + 1 }))
        const response = await fetch('/api/votes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            table_type: 'nickname',
            table_id: nicknames.map(n => n.id),
            ranks: ranks,
            voter_id: user?.id,
        }),
        })
        const data = await response.json()
        if (data.success) {
        setSuccess('Your ranking has been saved!')
        } else {
        setError(data.error || 'Failed to save ranking')
        }
    } catch (err) {
      console.error('Error saving ranking:', err)
      setError('Failed to save ranking')
    } finally {
      setSaving(false)
    }
  }

  // Count how many suggestions the current user has made
  const userSuggestions = nicknames.filter(n => n.submitted_by === user?.id);

  if (loading) return <div className="text-center py-8">Loading...</div>
  if (error) return <div className="text-center text-red-600 py-8">{error}</div>


  return (
    <main className="max-w-xl mx-auto py-8">
      <Link href="/dashboard/nicknames" className="text-indigo-600 dark:text-indigo-400 hover:underline mb-4 block">
        ← Back to Nicknames
      </Link>
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Rank & Suggest Nicknames</h1>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="nicknames">
          {(provided) => (
            <ul
              className="space-y-4 mb-8"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {nicknames.map((nickname, idx) => (
                <Draggable key={nickname.id} draggableId={String(nickname.id)} index={idx}>
                  {(provided, snapshot) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`flex items-center gap-4 rounded p-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 ${
                        snapshot.isDragging ? 'ring-2 ring-indigo-400' : ''
                      }`}
                    >
                      <span className="font-semibold text-gray-800 dark:text-gray-100">
                        {nickname.nickname}
                      </span>
                      {nickname.submitted_by === user?.id && (
                      <button
                          className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"
                          onClick={() => handleDelete(nickname.id)}
                          title="Delete suggestion"
                      >
                          ✕
                      </button>
                      )}
                      <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                        Rank: {idx + 1}
                      </span>
                      <span {...provided.dragHandleProps} className="cursor-grab mr-2">
                        <Bars3Icon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                      </span>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
      <button
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded mb-4"
        onClick={handleSaveRanking}
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save Ranking'}
      </button>
      {success && <div className="text-green-600 mb-4">{success}</div>}
      <div className="rounded p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-700">
        <h2 className="font-semibold mb-2 text-gray-900 dark:text-white">Suggest a New Nickname</h2>
        <input
        type="text"
        value={newNickname}
        onChange={e => setNewNickname(e.target.value)}
        className="mb-2 px-2 py-1 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
        placeholder={userSuggestions.length >= 2 ? "Limit reached (2 suggestions)" : "Enter nickname"}
        disabled={userSuggestions.length >= 2}
        />
        <button
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        onClick={handleSuggest}
        disabled={!newNickname.trim() || userSuggestions.length >= 2}
        >
          Suggest
        </button>
      </div>
    </main>
  )
}