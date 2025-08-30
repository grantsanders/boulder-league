'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Climber } from '@/lib/interfaces/user-info'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { User, ArrowRight, Search } from 'lucide-react'
import ImageModal from '@/components/ui/image-modal'
import { formatNameWithNickname } from '@/lib/utils/name-formatter'

export default function ProfilesPage() {
  const { user } = useAuth()
  const [climbers, setClimbers] = useState<Climber[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedImage, setSelectedImage] = useState<{ url: string; alt: string; title: string } | null>(null)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

  useEffect(() => {
    const fetchClimbers = async () => {
      try {
        const response = await fetch('/api/climbers')
        const data = await response.json()
        if (data.success) {
          setClimbers(data.climbers)
        } else {
          setError(data.error || 'Failed to fetch climbers')
        }
      } catch (err) {
        console.error('Error fetching climbers:', err)
        setError('Failed to fetch climbers')
      } finally {
        setLoading(false)
      }
    }
    fetchClimbers()
  }, [])

  const filteredClimbers = climbers
    .filter(climber => climber.id !== user?.id) // Exclude current user
    .filter(climber =>
      climber.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      climber.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (climber.nickname && climber.nickname.toLowerCase().includes(searchTerm.toLowerCase()))
    )

  const handleImageClick = (imageUrl: string, climber: Climber) => {
    const title = climber.nickname 
      ? formatNameWithNickname(climber.first_name, climber.last_name, climber.nickname)
      : `${climber.first_name} ${climber.last_name}`
    
    setSelectedImage({
      url: imageUrl,
      alt: `${climber.first_name} ${climber.last_name}`,
      title
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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Climber Profiles
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          View and vote on profile photos for all climbers
        </p>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search climbers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredClimbers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClimbers.map(climber => (
            <Card key={climber.id} className="flex flex-col items-center text-center">
              <CardContent className="pt-6 w-full">
                {climber.profile_photo_url ? (
                  <button
                    onClick={() => handleImageClick(climber.profile_photo_url!, climber)}
                    className="hover:opacity-80 transition-opacity cursor-pointer mb-4 mx-auto"
                  >
                    <Image 
                      src={climber.profile_photo_url} 
                      alt={`${climber.first_name} ${climber.last_name}`}
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  </button>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-3xl font-bold text-muted-foreground mb-4 mx-auto">
                    {climber.first_name.charAt(0)}{climber.last_name.charAt(0)}
                  </div>
                )}
                <h3 className="font-semibold text-foreground mb-1">
                  {climber.first_name} {climber.last_name}
                </h3>
                {climber.nickname && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {formatNameWithNickname(climber.first_name, climber.last_name, climber.nickname)}
                  </p>
                )}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="outline">V{climber.working_grade}</Badge>
                    <Badge variant="secondary">{climber.running_score} pts</Badge>
                    </div>
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/dashboard/profiles/${climber.id}`}>
                    View & Vote
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No climbers found</h3>
          <p className="text-muted-foreground">
            {searchTerm ? 'Try adjusting your search terms.' : 'No climbers have been added yet.'}
          </p>
        </div>
      )}

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