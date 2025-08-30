'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { calculatePersonalPoints } from '@/lib/utils/score-calculator'
import { Climber } from '@/lib/interfaces/user-info'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ChevronUp, ChevronDown, Trash2 } from 'lucide-react'

interface AscentWithId {
  id: string
  uuid: string
  name?: string
  description: string
  working_grade_when_sent: number
  absolute_grade: number
  is_flash: boolean
  sent_date: string
  create_date: string
  [key: string]: unknown
}

type SortKey = 'absolute_grade' | 'name' | 'created_at';
type SortDirection = 'asc' | 'desc';

export default function LogbookPage() {
  const { user, loading } = useAuth()
  const [ascents, setAscents] = useState<AscentWithId[]>([])
  const [climber, setClimber] = useState<Climber | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setDataLoading(false)
        return
      }
      
      try {
        // Fetch climber data
        const climberRes = await fetch(`/api/climbers?id=${user.id}`)
        const climberResult = await climberRes.json()
        if (climberResult.success && climberResult.climbers?.length > 0) {
          setClimber(climberResult.climbers[0])
        }

        // Fetch ascents
        const ascentsRes = await fetch(`/api/ascents?user_id=${user.id}`)
        const ascentsResult = await ascentsRes.json()
        if (ascentsResult.success) {
          setAscents(ascentsResult.ascents || [])
        } else {
          setDataError('Failed to load ascents')
        }
      } catch {
        setDataError('Failed to load data')
      }
      setDataLoading(false)
    }
    fetchData()
  }, [user?.id])

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  function getSortedAscents() {
    const sorted = [...ascents]
    sorted.sort((a, b) => {
      let aValue: unknown = a[sortKey]
      let bValue: unknown = b[sortKey]
      if (sortKey === 'name') {
        aValue = (aValue as string)?.toLowerCase() || ''
        bValue = (bValue as string)?.toLowerCase() || ''
      }
      if ((aValue as number) < (bValue as number)) return sortDirection === 'asc' ? -1 : 1
      if ((aValue as number) > (bValue as number)) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }

  async function handleRemove(ascentId: string) {
    if (!window.confirm('Are you sure you want to remove this ascent?')) return;
    try {
      const res = await fetch(`/api/ascents/${ascentId}`, { method: 'DELETE' })
      if (res.ok) {
        setAscents(prev => prev.filter(a => a.id !== ascentId))
      } else {
        alert('Failed to remove ascent.')
      }
    } catch {
      alert('Failed to remove ascent.')
    }
  }

  if (loading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading your logbook...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const sortedAscents = getSortedAscents()

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          📝 Logbook
        </h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          Track all your climbing achievements and manage your ascents.
        </p>
      </div>

      {dataError ? (
        <Alert variant="destructive">
          <AlertDescription>{dataError}</AlertDescription>
        </Alert>
      ) : ascents.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">No ascents logged yet.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-4 md:pb-6">
            <CardTitle className="text-lg md:text-xl">Your Ascents</CardTitle>
            <CardDescription className="text-sm">
              {ascents.length} total ascents logged
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 md:p-6">
            {/* Desktop Table */}
            <div className="hidden md:block">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer select-none"
                        onClick={() => handleSort('created_at')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Date</span>
                          {sortKey === 'created_at' && (
                            sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer select-none"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Problem</span>
                          {sortKey === 'name' && (
                            sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead 
                        className="cursor-pointer select-none"
                        onClick={() => handleSort('absolute_grade')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Grade</span>
                          {sortKey === 'absolute_grade' && (
                            sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead>Working Grade When Sent</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Flash?</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedAscents.map((ascent) => (
                      <TableRow key={ascent.id}>
                        <TableCell className="font-medium">
                          {new Date(ascent.sent_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{ascent.name || '-'}</TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate" title={ascent.description}>
                            {ascent.description || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">V{ascent.absolute_grade}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">V{ascent.working_grade_when_sent}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {climber ? calculatePersonalPoints(climber, {
                            id: ascent.id,
                            name: ascent.name || '',
                            description: ascent.description,
                            working_grade_when_sent: ascent.working_grade_when_sent,
                            absolute_grade: ascent.absolute_grade,
                            is_flash: ascent.is_flash,
                            sent_date: ascent.sent_date,
                            create_date: ascent.create_date
                          }) : '—'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={ascent.is_flash ? "default" : "secondary"}>
                            {ascent.is_flash ? 'Yes' : 'No'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemove(ascent.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Mobile Card Layout */}
            <div className="md:hidden space-y-2 p-3">
              {sortedAscents.map((ascent) => (
                <Card key={ascent.id} className="p-3">
                  <div className="space-y-2">
                    {/* First row: Problem name with absolute grade, flash, and delete button */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm truncate">
                          {ascent.name || 'Unnamed Problem'}
                        </h3>
                        <Badge variant="outline" className="text-xs px-1 py-0">V{ascent.absolute_grade}</Badge>
                        <Badge variant={ascent.is_flash ? "default" : "secondary"} className="text-xs px-1 py-0">
                          {ascent.is_flash ? 'Flash' : 'No'}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(ascent.id)}
                        className="text-destructive hover:text-destructive h-6 w-6 p-0 flex-shrink-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    {/* Second row: Description */}
                    {ascent.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {ascent.description}
                      </p>
                    )}
                    
                    {/* Third row: Date, working grade, and points */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        logged {new Date(ascent.sent_date).toLocaleDateString()} at{' '}
                        <Badge variant="secondary" className="text-xs px-1 py-0">V{ascent.working_grade_when_sent}</Badge>
                      </span>
                      <span className="font-semibold text-foreground">
                        {climber ? calculatePersonalPoints(climber, {
                          id: ascent.id,
                          name: ascent.name || '',
                          description: ascent.description,
                          working_grade_when_sent: ascent.working_grade_when_sent,
                          absolute_grade: ascent.absolute_grade,
                          is_flash: ascent.is_flash,
                          sent_date: ascent.sent_date,
                          create_date: ascent.create_date
                        }) : '—'} pts
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 