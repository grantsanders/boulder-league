'use client'

import { useEffect, useState } from 'react'
import { Climber } from '@/lib/interfaces/user-info'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Users } from 'lucide-react'

export default function ClimbersPage() {
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
        <div className="text-lg">Loading climbers...</div>
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

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Climbers
        </h1>
        <p className="text-muted-foreground mt-2">
          All registered climbers in the Boulder League competition.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Climbers Directory
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
                    <TableHead>Name</TableHead>
                    <TableHead>Nickname</TableHead>
                    <TableHead>Working Grade</TableHead>
                    <TableHead>Running Score</TableHead>
                    <TableHead>Ascents of Next Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {climbers.map((climber) => (
                    <TableRow key={climber.id}>
                      <TableCell className="font-medium">
                        <a
                          href={`/dashboard/climbers/${climber.id}`}
                          className="text-primary underline hover:text-primary/80 transition-colors"
                        >
                          {climber.first_name} {climber.last_name}
                        </a>
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
    </div>
  )
} 