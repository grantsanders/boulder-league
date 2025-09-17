'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { NicknameCandidate } from '@/lib/interfaces/voting'
import { useAuth } from '@/lib/auth-context'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, GripVertical, X, Tag, Plus } from 'lucide-react'

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/dashboard/nicknames">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Nicknames
          </Link>
        </Button>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Rank & Suggest Nicknames
        </h1>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="nicknames">
          {(provided) => (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Nickname Rankings
                </CardTitle>
                <CardDescription>
                  Drag and drop to reorder your preferred nicknames
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul
                  className="space-y-4"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {nicknames.map((nickname, idx) => (
                    <Draggable key={nickname.id} draggableId={String(nickname.id)} index={idx}>
                      {(provided, snapshot) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex items-center gap-4 rounded-lg p-4 bg-card border transition-all ${
                            snapshot.isDragging ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
                          }`}
                        >
                          <span {...provided.dragHandleProps} className="cursor-grab hover:cursor-grabbing">
                            <GripVertical className="w-5 h-5 text-muted-foreground" />
                          </span>
                          <span className="font-semibold text-foreground">
                            {nickname.nickname}
                          </span>
                          {nickname.submitted_by === user?.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(nickname.id)}
                              className="text-destructive hover:text-destructive"
                              title="Delete suggestion"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                          <span className="ml-auto">
                            <Badge variant="secondary">
                              Rank: {idx + 1}
                            </Badge>
                          </span>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              </CardContent>
            </Card>
          )}
        </Droppable>
      </DragDropContext>

      <div className="space-y-4">
        <Button
          onClick={handleSaveRanking}
          disabled={saving}
          className="w-full sm:w-auto"
        >
          {saving ? 'Saving...' : 'Save Ranking'}
        </Button>

        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Suggest a New Nickname
            </CardTitle>
            <CardDescription>
              Add a new nickname suggestion for this climber
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="text"
                value={newNickname}
                onChange={e => setNewNickname(e.target.value)}
                placeholder={userSuggestions.length >= 2 ? "Limit reached (2 suggestions)" : "Enter nickname"}
                disabled={userSuggestions.length >= 2}
                className="flex-1"
              />
              <Button
                onClick={handleSuggest}
                disabled={!newNickname.trim() || userSuggestions.length >= 2}
              >
                Suggest
              </Button>
            </div>
            {userSuggestions.length >= 2 && (
              <Alert variant="destructive">
                <AlertDescription>
                  You can only suggest 2 nicknames at a time. Delete one to suggest another.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}