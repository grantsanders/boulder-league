'use client'

import { useEffect, useState } from 'react'
import { Climber } from '@/lib/interfaces/user-info'
import { Ascent } from '@/lib/interfaces/scoring'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Trophy, Award } from 'lucide-react'
import Image from 'next/image'

export default function LeaderboardPage() {
  const [climbers, setClimbers] = useState<Climber[]>([])
  const [userAscents, setUserAscents] = useState<Record<string, Ascent[]>>({})
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
          
          // Fetch ascents for each climber
          const ascentsData: Record<string, Ascent[]> = {}
          for (const climber of sortedClimbers) {
            try {
              const ascentsResponse = await fetch(`/api/ascents?userId=${climber.id}`)
              const ascentsResult = await ascentsResponse.json()
              if (ascentsResult.success) {
                ascentsData[climber.id] = ascentsResult.ascents
              } else {
                ascentsData[climber.id] = []
              }
            } catch (err) {
              console.error(`Error fetching ascents for climber ${climber.id}:`, err)
              ascentsData[climber.id] = []
            }
          }
          setUserAscents(ascentsData)
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

  // Calculate total ascents of next grade for a climber
  const getTotalAscentsOfNextGrade = (climber: Climber) => {
    const nextGrade = climber.working_grade + 1
    const userAscentsList = userAscents[climber.id] || []

    const filteredAscents = userAscentsList.filter(ascent => ascent.user_id === climber.id)
    // console.log('Calculating ascents for climber:', climber.first_name, climber.last_name)
    // console.log('User ascents:', filteredAscents)

    // Count ascents of the next grade from their logbook
    const ascentsOfNextGrade = filteredAscents.filter(ascent => ascent.absolute_grade === nextGrade).length

    // Add the stored ascents_of_next_grade value
    const total = climber.ascents_of_next_grade + ascentsOfNextGrade

    return total
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          Leaderboard
        </h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          See how you rank against other climbers in the Boulder League.
        </p>
      </div>

      {/* Podium */}
      {podium.length > 0 && (
        <Card className="mb-6 md:mb-8">
          <CardHeader className="pb-4 md:pb-6">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Trophy className="h-5 w-5" />
              Top 3 Climbers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="flex justify-center items-end gap-2 md:gap-4">
              {/* 2nd Place */}
              {podium[1] && (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 md:w-28 md:h-28 rounded-full border-2 md:border-4 border-background bg-muted flex items-center justify-center shadow-lg -mb-3 md:-mb-6 z-10 overflow-hidden">
                    {podium[1].profile_photo_url ? (
                      <Image 
                        src={podium[1].profile_photo_url} 
                        alt={`${podium[1].first_name} ${podium[1].last_name}`}
                        width={96}
                        height={96}
                        className="w-12 h-12 md:w-24 md:h-24 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 md:w-24 md:h-24 rounded-full bg-gray-400/20 flex items-center justify-center text-lg md:text-3xl font-bold text-gray-600">
                        {podium[1].first_name.charAt(0)}{podium[1].last_name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="w-16 h-20 md:w-28 md:h-32 flex flex-col items-center justify-end bg-gray-400 rounded-t-md text-center pb-2">
                    <span className="font-semibold text-xs md:text-sm text-black px-1 break-words leading-tight">{podium[1].first_name} {podium[1].last_name}</span>
                    <span className="text-xs md:text-sm text-black">{podium[1].running_score} pts</span>
                  </div>
                </div>
              )}
              {/* 1st Place */}
              {podium[0] && (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 md:w-32 md:h-32 rounded-full border-2 md:border-4 border-background bg-muted flex items-center justify-center shadow-xl -mb-4 md:-mb-8 z-20 overflow-hidden">
                    {podium[0].profile_photo_url ? (
                      <Image 
                        src={podium[0].profile_photo_url} 
                        alt={`${podium[0].first_name} ${podium[0].last_name}`}
                        width={112}
                        height={112}
                        className="w-16 h-16 md:w-28 md:h-28 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 md:w-28 md:h-28 rounded-full bg-yellow-500/20 flex items-center justify-center text-xl md:text-4xl font-bold text-yellow-600">
                        {podium[0].first_name.charAt(0)}{podium[0].last_name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="w-20 h-24 md:w-32 md:h-40 flex flex-col items-center justify-end bg-yellow-500 rounded-t-md pb-2">
                    <span className="font-semibold text-xs md:text-sm text-center px-1 text-black break-words leading-tight">{podium[0].first_name} {podium[0].last_name}</span>
                    <span className="text-xs md:text-sm text-black">{podium[0].running_score} pts</span>
                  </div>
                </div>
              )}
              {/* 3rd Place */}
              {podium[2] && (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 md:w-28 md:h-28 rounded-full border-2 md:border-4 border-background bg-muted flex items-center justify-center shadow-lg -mb-3 md:-mb-6 z-10 overflow-hidden">
                    {podium[2].profile_photo_url ? (
                      <Image 
                        src={podium[2].profile_photo_url} 
                        alt={`${podium[2].first_name} ${podium[2].last_name}`}
                        width={96}
                        height={96}
                        className="w-12 h-12 md:w-24 md:h-24 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 md:w-24 md:h-24 rounded-full bg-amber-600/20 flex items-center justify-center text-lg md:text-3xl font-bold text-amber-600">
                        {podium[2].first_name.charAt(0)}{podium[2].last_name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="w-16 h-16 md:w-28 md:h-28 flex flex-col items-center justify-end bg-amber-600 rounded-t-md pb-2">
                    <span className="font-semibold text-xs md:text-sm text-center px-1 text-black break-words leading-tight">{podium[2].first_name} {podium[2].last_name}</span>
                    <span className="text-xs md:text-sm text-black">{podium[2].running_score} pts</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Leaderboard Table */}
      <Card>
        <CardHeader className="pb-4 md:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Award className="h-5 w-5" />
            Complete Leaderboard
          </CardTitle>
          <CardDescription className="text-sm">
            Total climbers: {climbers.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 md:p-6">
          {climbers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No climbers found</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block">
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
                            {getTotalAscentsOfNextGrade(climber)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Mobile Card Layout */}
              <div className="md:hidden space-y-2 p-3">
                {climbers.map((climber, index) => {
                  const getRankStyle = (rank: number) => {
                    switch (rank) {
                      case 0: return "bg-yellow-500 text-white"; // Gold
                      case 1: return "bg-gray-400 text-white"; // Silver
                      case 2: return "bg-amber-600 text-white"; // Bronze
                      default: return "bg-primary/10 text-primary"; // Normal
                    }
                  };
                  
                  return (
                    <Card key={climber.id} className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankStyle(index)}`}>
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm">
                              {climber.first_name} {climber.last_name}
                            </h3>
                            {climber.nickname && (
                              <Badge variant="secondary" className="text-xs mt-1">
                                {climber.nickname}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">{climber.running_score}</div>
                          <div className="text-xs text-muted-foreground">Points</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          Working Grade: <Badge variant="outline" className="text-xs px-1 py-0">V{climber.working_grade}</Badge>
                        </span>
                        <span>
                          {getTotalAscentsOfNextGrade(climber)} V{climber.working_grade + 1} ascents
                        </span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 md:mt-8">
        <Button asChild variant="outline">
          <Link href="/dashboard">← Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}