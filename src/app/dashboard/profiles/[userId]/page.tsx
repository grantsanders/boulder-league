'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import ProfilePhotoIUpload from '../ProfilePhotoIUpload'
import { ProfilePhotoCandidate } from '@/lib/interfaces/voting'

export default function ProfilePhotoPage() {
  const { user } = useAuth()
  const params = useParams<{ userId: string }>()
  const userId = params.userId

  const [photos, setPhotos] = useState<ProfilePhotoCandidate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        console.log('Fetching photos for userId:', userId)
        console.log('Current auth user ID:', user?.id)
        const response = await fetch(`/api/profile-photo-candidates?user_id=${userId}`)
        const data = await response.json()
        if (data.success) {
          setPhotos(data.candidates)
        } else {
          setError(data.error || 'Failed to fetch profile photos')
        }
      } catch (err) {
        console.error('Fetch error:', err)
        setError('Failed to fetch profile photos')
      } finally {
        setLoading(false)
      }
    }
    fetchPhotos()
  }, [userId, user?.id])

  // Drag-and-drop handler
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return
    const items = Array.from(photos)
    const [reordered] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reordered)
    setPhotos(items)
  }

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
      setError('Failed to save ranking')
    } finally {
      setSaving(false)
    }
  }

  // Allow user to delete their own photo suggestion
  const handleDelete = async (photoId: string) => {
    const response = await fetch(`/api/profile-photo-candidates/${photoId}`, {
      method: 'DELETE',
    })
    const data = await response.json()
    if (data.success) {
      setPhotos(prev => prev.filter(p => p.id !== photoId))
    } else {
      alert(data.error || 'Failed to delete photo')
    }
  }

  // Count how many suggestions the current user has made
  const userSuggestions = photos.filter(p => p.submitted_by === user?.id)

  // Handle successful upload by adding to local state
  const handleUploadSuccess = (newCandidate: ProfilePhotoCandidate) => {
    setPhotos(prev => [...prev, newCandidate])
  }

  if (loading) return <div className="text-center py-8">Loading...</div>
  if (error) return <div className="text-center text-red-600 py-8">{error}</div>

  return (
    <main className="max-w-xl mx-auto py-8">
      <Link href="/dashboard/profiles" className="text-indigo-600 dark:text-indigo-400 hover:underline mb-4 block">
        ← Back to Profiles
      </Link>
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Rank & Upload Profile Photos</h1>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="photos">
          {(provided) => (
            <ul
              className="space-y-4 mb-8"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {photos.map((photo, idx) => (
                <Draggable key={photo.id} draggableId={String(photo.id)} index={idx}>
                  {(provided, snapshot) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`flex items-center gap-4 rounded p-4 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all ${
                        snapshot.isDragging ? 'ring-2 ring-indigo-400 shadow-lg' : 'hover:shadow-md'
                      }`}
                    >
                      <span {...provided.dragHandleProps} className="cursor-grab hover:cursor-grabbing mr-2 flex items-center hover:opacity-80 transition-opacity">
                        {/* Hamburger Icon */}
                        <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                        </svg>
                        <Image
                          src={photo.image_url}
                          alt="Profile option"
                          width={100}
                          height={100}
                          className="rounded-lg object-cover shadow-sm"
                        />
                      </span>
                      {photo.submitted_by === user?.id && (
                        <button
                          className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"
                          onClick={() => handleDelete(photo.id)}
                          title="Delete suggestion"
                        >
                          ✕
                        </button>
                      )}
                      <span className="ml-auto flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                          #{idx + 1}
                        </span>
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
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded mb-4 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        onClick={handleSaveRanking}
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save Ranking'}
      </button>
      {success && <div className="text-green-600 mb-4">{success}</div>}
      <div className="rounded p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-700">
        <h2 className="font-semibold mb-2 text-gray-900 dark:text-white">Upload a New Photo</h2>
        {/* Limit to 2 suggestions per user */}
        {user?.id && (
          <ProfilePhotoIUpload 
            userId={userId} 
            submittedBy={user.id}
            disabled={userSuggestions.length >= 2}
            onUploadSuccess={handleUploadSuccess}
          />
        )}
        {userSuggestions.length >= 2 && (
          <div className="text-xs text-red-500 mt-2">
            You can only suggest 2 photos at a time. Delete one to upload another.
          </div>
        )}
      </div>
    </main>
  )
}