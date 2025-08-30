'use client'

import { useEffect, useState } from 'react'
import { Climber } from '@/lib/interfaces/user-info'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Trophy, Award } from 'lucide-react'

export default function LeaderboardPage() {
  const [climbers, setClimbers] = useState<Climber[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchClimbers = async () => {
      try {
        const response = await fetch('/api/climbers')
        const data = await response.json()
        
        if (data.success) {
          // Sort climbers by running_score from high to low
          const sortedClimbers = data.climbers.sort((a: Climber, b: Climber) => b.running_score - a.running_score)
          setClimbers(sortedClimbers)
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
        <div className="text-lg">Loading leaderboard...</div>
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

  const podium = climbers.slice(0, 3)

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Leaderboard
        </h1>
        <p className="text-muted-foreground mt-2">
          See how you rank against other climbers in the Boulder League.
        </p>
      </div>

      {/* Podium */}
      {podium.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Top 3 Climbers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-end gap-4">
              {/* 2nd Place */}
              {podium[1] && (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full border-4 border-background bg-muted flex items-center justify-center shadow-lg -mb-4 z-10 overflow-hidden">
                    {podium[1].profile_photo_url ? (
                      <img 
                        src={podium[1].profile_photo_url} 
                        alt={`${podium[1].first_name} ${podium[1].last_name}`}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-muted-foreground/20 flex items-center justify-center text-2xl font-bold text-muted-foreground">
                        {podium[1].first_name.charAt(0)}{podium[1].last_name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="w-20 h-24 flex flex-col items-center justify-end bg-muted rounded-t-md">
                    <span className="text-lg font-bold mb-1">2</span>
                    <span className="font-semibold text-sm text-center px-1">{podium[1].first_name} {podium[1].last_name}</span>
                    <span className="text-xs">{podium[1].running_score} pts</span>
                  </div>
                </div>
              )}
              {/* 1st Place */}
              {podium[0] && (
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full border-4 border-background bg-muted flex items-center justify-center shadow-xl -mb-6 z-20 overflow-hidden">
                    {podium[0].profile_photo_url ? (
                      <img 
                        src={podium[0].profile_photo_url} 
                        alt={`${podium[0].first_name} ${podium[0].last_name}`}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-3xl font-bold text-primary">
                        {podium[0].first_name.charAt(0)}{podium[0].last_name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="w-24 h-32 flex flex-col items-center justify-end bg-primary rounded-t-md">
                    <span className="text-xl font-bold mb-1 text-primary-foreground">1</span>
                    <span className="font-semibold text-sm text-center px-1 text-primary-foreground">{podium[0].first_name} {podium[0].last_name}</span>
                    <span className="text-sm text-primary-foreground">{podium[0].running_score} pts</span>
                  </div>
                </div>
              )}
              {/* 3rd Place */}
              {podium[2] && (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full border-4 border-background bg-muted flex items-center justify-center shadow-lg -mb-4 z-10 overflow-hidden">
                    {podium[2].profile_photo_url ? (
                      <img 
                        src={podium[2].profile_photo_url} 
                        alt={`${podium[2].first_name} ${podium[2].last_name}`}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-muted-foreground/20 flex items-center justify-center text-2xl font-bold text-muted-foreground">
                        {podium[2].first_name.charAt(0)}{podium[2].last_name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="w-20 h-20 flex flex-col items-center justify-end bg-muted rounded-t-md">
                    <span className="text-lg font-bold mb-1">3</span>
                    <span className="font-semibold text-sm text-center px-1">{podium[2].first_name} {podium[2].last_name}</span>
                    <span className="text-xs">{podium[2].running_score} pts</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Leaderboard Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Complete Leaderboard
          </CardTitle>
          <CardDescription>
            Total climbers: {climbers.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {climbers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No climbers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Place</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Nickname</TableHead>
                    <TableHead>Working Grade</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Ascents of Next Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {climbers.map((climber, index) => (
                    <TableRow key={climber.id}>
                      <TableCell className="font-bold">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {climber.first_name} {climber.last_name}
                      </TableCell>
                      <TableCell>
                        {climber.nickname ? (
                          <Badge variant="secondary">{climber.nickname}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">V{climber.working_grade}</Badge>
                      </TableCell>
                      <TableCell className="font-bold">
                        {climber.running_score}
                      </TableCell>
                      <TableCell>
                        {climber.ascents_of_next_grade}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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