import { useState, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useAuth } from '@/lib/auth-context'
import { ProfilePhotoCandidate } from '@/lib/interfaces/voting'

// Type for API response
interface ApiResponse {
  success: boolean
  candidates?: ProfilePhotoCandidate
  error?: string
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

async function uploadProfilePhoto(file: File, userId: string, submittedBy: string) {
  const filePath = `${userId}/${Date.now()}_${file.name}`
  const { error } = await supabase.storage
    .from('profile-photos')
    .upload(filePath, file)

  if (error) throw new Error(error.message)

  const { data: urlData } = supabase.storage
    .from('profile-photos')
    .getPublicUrl(filePath)

  if (!urlData || !urlData.publicUrl) throw new Error('Failed to get public URL')

  // Save to database
  const response = await fetch('/api/profile-photo-candidates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      image_url: urlData.publicUrl,
      submitted_by: submittedBy
    })
  })

  const dbResult: ApiResponse = await response.json()
  if (!dbResult.success) {
    throw new Error(dbResult.error || 'Failed to save to database')
  }

  return { imageUrl: urlData.publicUrl, candidate: dbResult.candidates }
}

export default function ProfilePhotoIUpload({ 
  userId, 
  submittedBy,
  disabled,
  onUploadSuccess 
}: { 
  userId: string; 
  submittedBy?: string;
  disabled?: boolean;
  onUploadSuccess?: (candidate: ProfilePhotoCandidate) => void;
}) {
  const { user } = useAuth()
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (file: File) => {
    const currentSubmittedBy = submittedBy || user?.id;
    if (!currentSubmittedBy) {
      setUploadError('User not authenticated')
      return
    }

    setUploadError(null)
    setUploading(true)
    
    try {
      const result = await uploadProfilePhoto(file, userId, currentSubmittedBy)
      if (result.candidate) {
        onUploadSuccess?.(result.candidate)
      }
    } catch (err: unknown) {
      console.error('Upload error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      setUploadError(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || uploading) return
    const file = e.target.files?.[0]
    if (!file) return
    await handleFileUpload(file)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = () => setDragActive(false)

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)
    if (disabled || uploading) return
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    await handleFileUpload(file)
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors cursor-pointer ${
        dragActive 
          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10' 
          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
      } ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && !uploading && inputRef.current?.click()}
      style={{ minHeight: 120 }}
    >
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={handleFileChange}
        disabled={disabled || uploading}
        style={{ display: 'none' }}
      />
      <div className="flex flex-col items-center">
        <svg className="w-8 h-8 text-indigo-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4a1 1 0 011-1h8a1 1 0 011 1v12m-4 4h-4a1 1 0 01-1-1v-4h6v4a1 1 0 01-1 1z" />
        </svg>
        <span className="font-medium text-gray-700 dark:text-gray-200 mb-1">
          {uploading ? 'Uploading...' : 'Drag & drop or click to select a photo'}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          PNG, JPG, GIF up to 5MB
        </span>
        {disabled && (
          <span className="text-xs text-red-500 mt-2">
            You have reached your suggestion limit.
          </span>
        )}
        {uploadError && (
          <span className="text-xs text-red-500 mt-2">
            {uploadError}
          </span>
        )}
      </div>
    </div>
  )
}