'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import ProfilePhotoIUpload from '../ProfilePhotoIUpload'
import { ProfilePhotoCandidate } from '@/lib/interfaces/voting'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, GripVertical, X, Upload } from 'lucide-react'
import ImageModal from '@/components/ui/image-modal'

export default function ProfilePhotoPage() {
  const { user } = useAuth()
  const params = useParams<{ userId: string }>()
  const userId = params.userId

  const [photos, setPhotos] = useState<ProfilePhotoCandidate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<{ url: string; alt: string; title: string } | null>(null)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

  useEffect(() => {
    const fetchPhotosAndRanking = async () => {
      try {
        // Fetch profile photo candidates
        const response = await fetch(`/api/profile-photo-candidates?user_id=${userId}`)
        const data = await response.json()
        const candidates = data.success ? data.candidates : [];

        // Fetch the current user's last vote for this user
        let rankedPhotos = candidates;
        if (user?.id && candidates.length > 0) {
          const voteRes = await fetch(`/api/votes?voter_id=${user.id}`);
          const voteData = await voteRes.json();
          if (voteData.success && Array.isArray(voteData.votes)) {
            // Define types for votes and candidates
            type Vote = { table_type: string; table_id: string; ranks: number };
            type Candidate = { id: string };
            const userVotes = (voteData.votes as Vote[]).filter((v: Vote) => v.table_type === 'profile_photo' && (candidates as Candidate[]).some((c: Candidate) => c.id === v.table_id));
            if (userVotes.length > 0) {
              // Sort by rank
              const idToRank: Record<string, number> = {};
              userVotes.forEach((v: Vote) => { idToRank[v.table_id] = v.ranks; });
              rankedPhotos = [...candidates].sort((a: Candidate, b: Candidate) => {
                const rankA = idToRank[a.id] ?? 999;
                const rankB = idToRank[b.id] ?? 999;
                return rankA - rankB;
              });
            }
          }
        }
        setPhotos(rankedPhotos);
        if (!data.success) setError(data.error || 'Failed to fetch photos');
      } catch (err) {
        console.error('Error fetching photos:', err);
        setError('Failed to fetch photos');
      } finally {
        setLoading(false);
      }
    };
    fetchPhotosAndRanking();
  }, [userId, user?.id]);

  // Drag-and-drop handler
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return
    const items = Array.from(photos)
    const [reordered] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reordered)
    setPhotos(items)
  }

  const handleDelete = async (photoId: string) => {
    const response = await fetch(`/api/profile-photo-candidates/${photoId}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (data.success) {
      setPhotos(prev => prev.filter(p => p.id !== photoId));
    } else {
      alert(data.error || 'Failed to delete photo');
    }
  };

  // Save ranking
  const handleSaveRanking = async () => {
    setSaving(true)
    setSuccess(null)
    try {
      const ranks = photos.map((p, i) => ({ id: p.id, rank: i + 1 }))
      const response = await fetch('/api/votes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table_type: 'profile_photo',
          table_id: photos.map(p => p.id),
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

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage({
      url: imageUrl,
      alt: "Profile photo option",
      title: `Profile Photo Option`
    })
    setIsImageModalOpen(true)
  }

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
          <Link href="/dashboard/profiles">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profiles
          </Link>
        </Button>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Profile Photo Rankings
        </h1>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="photos">
          {(provided) => (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Photo Rankings
                </CardTitle>
                <CardDescription>
                  Drag and drop to reorder your preferred profile photos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul
                  className="space-y-4"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {photos.map((photo, idx) => (
                    <Draggable key={photo.id} draggableId={String(photo.id)} index={idx}>
                      {(provided, snapshot) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex items-center gap-4 rounded-lg p-4 bg-card border transition-all ${
                            snapshot.isDragging ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
                          }`}
                        >
                          <span {...provided.dragHandleProps} className="cursor-grab hover:cursor-grabbing mr-2 flex items-center hover:opacity-80 transition-opacity">
                            <GripVertical className="w-4 h-4 text-muted-foreground mr-2" />
                            <button
                              onClick={() => handleImageClick(photo.image_url)}
                              className="hover:opacity-80 transition-opacity"
                            >
                              <Image
                                src={photo.image_url}
                                alt="Profile option"
                                width={100}
                                height={100}
                                className="rounded-lg object-cover shadow-sm"
                              />
                            </button>
                          </span>
                          {photo.submitted_by === user?.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(photo.id)}
                              className="text-destructive hover:text-destructive"
                              title="Delete suggestion"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                          <span className="ml-auto">
                            <Badge variant="secondary">
                              #{idx + 1}
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
              <Upload className="h-5 w-5" />
              Upload New Photo
            </CardTitle>
            <CardDescription>
              Add a new profile photo suggestion for this climber
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfilePhotoIUpload
              userId={userId}
              submittedBy={user?.id}
              onUploadSuccess={(candidate) => {
                setPhotos(prev => [...prev, candidate])
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          imageUrl={selectedImage.url}
          alt={selectedImage.alt}
          title={selectedImage.title}
        />
      )}
    </div>
  )
}