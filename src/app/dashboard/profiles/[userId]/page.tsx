'use client'
import { useState } from 'react'
import Link from 'next/link'

// Mock photos for a user
const mockPhotos = [
  { id: 'a', url: '/default1.png', votes: 3 },
  { id: 'b', url: '/default2.png', votes: 5 },
  { id: 'c', url: '/default3.png', votes: 1 },
]

export default function ProfilePhotoPage() {
  const [photos] = useState(mockPhotos)
  const [newPhoto, setNewPhoto] = useState<File | null>(null)

  // Placeholder upload handler
  const handleUpload = () => {
    if (newPhoto) {
      // TODO: Upload logic
      alert('Photo uploaded (mock)')
    }
  }

  // Placeholder voting handler
  const handleVote = (photoId: string) => {
    // TODO: Voting logic
    alert(`Voted for photo ${photoId} (mock)`)
  }

  return (
    <main className="max-w-xl mx-auto py-8">
      <Link href="/dashboard/profiles" className="text-indigo-400 hover:underline mb-4 block">
        ← Back to Profiles
      </Link>
      <h1 className="text-2xl font-bold mb-6">Vote & Upload Profile Photos</h1>
      <ul className="space-y-4 mb-8">
        {photos.map(photo => (
          <li key={photo.id} className="flex items-center gap-4 bg-gray-800 rounded p-3">
            <img src={photo.url} alt="Profile option" className="w-16 h-16 rounded-full" />
            <span className="font-mono">{photo.votes} votes</span>
            <button
              className="ml-auto bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded"
              onClick={() => handleVote(photo.id)}
            >
              Vote
            </button>
          </li>
        ))}
      </ul>
      <div className="bg-gray-700 rounded p-4">
        <h2 className="font-semibold mb-2">Upload a New Photo</h2>
        <input
          type="file"
          accept="image/*"
          onChange={e => setNewPhoto(e.target.files?.[0] || null)}
          className="mb-2"
        />
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          onClick={handleUpload}
          disabled={!newPhoto}
        >
          Upload
        </button>
      </div>
      {/* Ranked choice voting UI can be added here later */}
    </main>
  )
}