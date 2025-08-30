'use client'

import { useEffect, useState } from 'react'
import { Climber } from '@/lib/interfaces/user-info'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { User, ArrowRight } from 'lucide-react'

export default function ProfilesPage() {
  const { user } = useAuth()
  const [climbers, setClimbers] = useState<Climber[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        setError('Failed to fetch climbers')
        console.error('Error fetching climbers:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchClimbers()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading profiles...</div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Error: {error}</AlertDescription>
      </Alert>
    )
  }

  // Filter out the current user
  const filteredClimbers = climbers.filter(climber => climber.id !== user?.id)

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Profile Photos
        </h1>
        <p className="text-muted-foreground mt-2">
          Choose the worst photo you can think of for your friends!
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Choose a Profile to Vote/Upload
          </CardTitle>
          <CardDescription>
            Total climbers: {filteredClimbers.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredClimbers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClimbers.map(climber => (
                <Card key={climber.id} className="flex flex-col items-center text-center">
                  <CardContent className="pt-6 w-full">
                    {climber.profile_photo_url ? (
                      <img 
                        src={climber.profile_photo_url} 
                        alt={`${climber.first_name} ${climber.last_name}`}
                        className="w-20 h-20 rounded-full object-cover mb-4 mx-auto"
                      />
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
                        &ldquo;{climber.nickname}&rdquo;
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
              <p className="text-muted-foreground">No climbers found</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-8">
        <Button asChild variant="outline">
          <Link href="/dashboard">← Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}