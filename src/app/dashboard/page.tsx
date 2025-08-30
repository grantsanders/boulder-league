'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Climber } from '@/lib/interfaces/user-info'
import { Ascent } from '@/lib/interfaces/scoring'

interface AscentWithClimber extends Ascent {
  climber_id: string;
  climber?: Climber;
}
import Modal from '@/lib/components/Modal'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import Image from 'next/image'
import ImageModal from '@/components/ui/image-modal'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [climberData, setClimberData] = useState<Climber | null>(null)
  const [ascentsData, setAscentsData] = useState<Ascent[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false)
  const [nextGradeAscents, setNextGradeAscents] = useState<string>('')
  const [allAscents, setAllAscents] = useState<AscentWithClimber[]>([])
  const [climbers, setClimbers] = useState<Climber[]>([])
  const [descriptionModal, setDescriptionModal] = useState<{isOpen: boolean, description: string, climberName: string, climbName: string, absoluteGrade: number}>({
    isOpen: false,
    description: '',
    climberName: '',
    climbName: '',
    absoluteGrade: 0
  })
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<{url: string, alt: string, title: string} | null>(null)

  // Compute recent ascents (latest by sent_date) for table
  const recentAscents = allAscents.slice().sort((a, b) => new Date(b.sent_date).getTime() - new Date(a.sent_date).getTime()).slice(0, 10)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (climberData) {
      if (climberData.promotion_input_needed) {
        console.log(climberData)
        setIsPromotionModalOpen(true);
      }
    }
  }, [climberData])

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) {
        setDataLoading(false)
        return
      }

      try {
        // Check for pending climber creation
        const pendingWorkingGrade = localStorage.getItem('pendingWorkingGrade')
        const pendingAscentsOfNextGrade = localStorage.getItem('pendingAscentsOfNextGrade')
        const pendingDisplayName = localStorage.getItem('pendingDisplayName')

        console.log('Checking for pending climber creation...')
        console.log('Pending data:', { pendingWorkingGrade, pendingAscentsOfNextGrade, pendingDisplayName })

        if (pendingWorkingGrade && pendingDisplayName && pendingAscentsOfNextGrade) {
          console.log('Creating climber record for new email user...')
          // Create climber record for new user
          const [firstName, ...lastNameParts] = pendingDisplayName.split(' ')
          const lastName = lastNameParts.join(' ') || 'User'

          console.log('Climber data:', {
            id: user.id,
            first_name: firstName,
            last_name: lastName,
            working_grade: parseInt(pendingWorkingGrade),
            ascents_of_next_grade: parseInt(pendingAscentsOfNextGrade)
          })

          const climberResponse = await fetch('/api/climbers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: user.id,
              first_name: firstName,
              last_name: lastName,
              working_grade: parseInt(pendingWorkingGrade),
              ascents_of_next_grade: parseInt(pendingAscentsOfNextGrade)
            })
          })

          const climberResult = await climberResponse.json()
          console.log('Climber creation result:', climberResult)

          if (climberResult.success) {
            console.log('Climber created successfully, clearing pending data...')
            localStorage.removeItem('pendingWorkingGrade')
            localStorage.removeItem('pendingAscentsOfNextGrade')
            localStorage.removeItem('pendingDisplayName')
            console.log('Pending data cleared')
          } else {
            console.log('Climber creation failed:', climberResult.error)
          }
        } else {
          console.log('No pending climber data found, checking if user exists...')
          const climberResponse = await fetch(`/api/climbers?id=${user.id}`)
          const climberResult = await climberResponse.json()

          if (climberResult.success && (!climberResult.climbers || climberResult.climbers.length === 0)) {
            console.log('OAuth user detected without climbing data')
          }
        }

        // Fetch climber data
        const climberResponse = await fetch(`/api/climbers?id=${user.id}`)
        const climberResult = await climberResponse.json()

        if (climberResult.success && climberResult.climbers && climberResult.climbers.length > 0) {
          setClimberData(climberResult.climbers[0])
        }

        // Fetch all ascents
        const ascentsResponse = await fetch('/api/ascents/all')
        const ascentsResult = await ascentsResponse.json()

        if (ascentsResult.success) {
          setAllAscents(ascentsResult.ascents || [])
        }

        // Fetch user's ascents for personal stats
        const userAscentsResponse = await fetch(`/api/ascents?user_id=${user.id}`)
        const userAscentsResult = await userAscentsResponse.json()

        if (userAscentsResult.success) {
          setAscentsData(userAscentsResult.ascents || [])
        }

        // Fetch all climbers
        const climbersResponse = await fetch('/api/climbers')
        const climbersResult = await climbersResponse.json()

        if (climbersResult.success) {
          setClimbers(climbersResult.climbers || [])
        }
      } catch (err) {
        console.error('Error fetching user data:', err)
        setDataError('Failed to load your climbing data')
      } finally {
        setDataLoading(false)
      }
    }

    fetchUserData()
  }, [user?.id])

  if (loading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading your dashboard...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const getClimberName = (climberId: string) => {
    const climber = climbers.find(c => c.id === climberId)
    if (!climber) return 'Unknown'
    return climber.nickname ? `${climber.first_name} "${climber.nickname}" ${climber.last_name}` : `${climber.first_name} ${climber.last_name}`
  }

  const openDescriptionModal = (description: string, climberName: string, climbName: string, absoluteGrade: number) => {
    setDescriptionModal({
      isOpen: true,
      description,
      climberName,
      climbName,
      absoluteGrade
    })
  }

  const handleImageClick = (url: string, climber: Climber) => {
    setSelectedImage({
      url,
      alt: `${climber.first_name} ${climber.last_name}`,
      title: `${climber.first_name} "${climber.nickname}" ${climber.last_name}`
    });
    setIsImageModalOpen(true);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Modal isOpen={isPromotionModalOpen} onClose={() => setIsPromotionModalOpen(false)}>
        <h2 className="text-lg font-semibold mb-4">{'You\'ve been promoted!'}</h2>
        <p className="mb-4">
          As of your last tick, you are officially a V{climberData!.working_grade} climber. <br /> <br />
          congrats big dawg. <br /> <br />
          How many boulders of the next grade (V{(climberData!.working_grade + 1)}) had you sent BEFORE September 22?
        </p>
        <div className="flex flex-col space-y-2">
          <input
            type="number"
            min={0}
            max={climberData!.working_grade + 1}
            className={`w-full p-2 border-2 border-color:gray rounded ${nextGradeAscents !== '' &&
                (isNaN(parseInt(nextGradeAscents)) ||
                  parseInt(nextGradeAscents) < 0 ||
                  parseInt(nextGradeAscents) > climberData!.working_grade + 1)
                ? 'border-red-500'
                : 'border-gray-300'
              }`}
            placeholder="Number of ascents"
            value={nextGradeAscents}
            onChange={(e) => setNextGradeAscents(e.target.value)}
          />
          {(nextGradeAscents !== '' && (parseInt(nextGradeAscents) < 0 || parseInt(nextGradeAscents) > climberData!.working_grade + 1)) && (
            <p className="text-sm text-red-500 mt-1">
              Must be between 0 and {climberData!.working_grade + 1}
            </p>
          )}
          <div className="flex justify-end">
            <button
              disabled={
                nextGradeAscents === '' ||
                isNaN(parseInt(nextGradeAscents)) ||
                parseInt(nextGradeAscents) < 0 ||
                parseInt(nextGradeAscents) > climberData!.working_grade + 1
              }
              onClick={async () => {
                if (user?.id && climberData) {
                  const response = await fetch('/api/climbers', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      id: user.id,
                      ascents_of_next_grade: parseInt(nextGradeAscents),
                      promotion_input_needed: false
                    })
                  })

                  const result = await response.json()
                  if (result.success) {
                    setClimberData({
                      ...climberData,
                      ascents_of_next_grade: parseInt(nextGradeAscents),
                      promotion_input_needed: false
                    })
                  }
                }
                setIsPromotionModalOpen(false)
              }}
              className={`bg-blue-500 text-white px-4 py-2 rounded ${(nextGradeAscents === '' ||
                  isNaN(parseInt(nextGradeAscents)) ||
                  parseInt(nextGradeAscents) < 0 ||
                  parseInt(nextGradeAscents) > climberData!.working_grade + 1)
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
                }`}
            >
              Submit
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={descriptionModal.isOpen} onClose={() => setDescriptionModal({...descriptionModal, isOpen: false})}>
        <h2 className="text-lg font-semibold mb-4">
          {descriptionModal.climbName} <span className="font-bold">(V{descriptionModal.absoluteGrade})</span>
        </h2>
        <p className="text-sm text-muted-foreground mb-4">by {descriptionModal.climberName}</p>
        <p className="mb-4">{descriptionModal.description || 'No description provided.'}</p>
      </Modal>

      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        imageUrl={selectedImage?.url || ''}
        alt={selectedImage?.alt || ''}
        title={selectedImage?.title || ''}
      />

      {/* Header Section - Anchored to top left */}
      <div className="mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Track your climbing progress, view your working grade, and see your scores.
        </p>
      </div>

      {dataError ? (
        <Card className="w-full">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="text-destructive mb-4">{dataError}</div>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* User Info Cards - Anchored below header */}
          <div className="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-6 md:mb-8">
            <Card className="p-2 md:p-4">
              <CardContent className="p-0 text-center flex items-center justify-center h-full">
                <div>
                  <div className="text-xs md:text-sm font-medium text-muted-foreground mb-1 md:mb-2">Working Grade</div>
                  <div className="text-sm md:text-2xl font-bold text-primary">V{climberData?.working_grade || 0}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-2 md:p-4">
              <CardContent className="p-0 text-center flex items-center justify-center h-full">
                <div>
                  <div className="text-xs md:text-sm font-medium text-muted-foreground mb-1 md:mb-2">Total Points</div>
                  <div className="text-sm md:text-2xl font-bold text-blue-600">{climberData?.running_score || 0}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-2 md:p-4">
              <CardContent className="p-0 text-center flex items-center justify-center h-full">
                <div>
                  <div className="text-xs md:text-sm font-medium text-muted-foreground mb-1 md:mb-2">Problems Sent</div>
                  <div className="text-sm md:text-2xl font-bold text-purple-600">{ascentsData.length}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-2 md:p-4">
              <CardContent className="p-0 text-center flex items-center justify-center h-full">
                <div>
                  <div className="text-xs md:text-sm font-medium text-muted-foreground mb-1 md:mb-2">
                    V{climberData?.working_grade ? climberData.working_grade + 1 : 1} Sends
                  </div>
                  <div className="text-sm md:text-2xl font-bold text-pink-600">
                    {climberData?.working_grade ? 
                      (climberData.working_grade + 1) -
                      (climberData.ascents_of_next_grade +
                        ascentsData?.filter(x => x.absolute_grade == (climberData.working_grade + 1)).length) : 0}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator className="my-6 md:my-8" />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6 md:mb-8 justify-center">
            <Button asChild variant="outline" className="h-10 md:h-9">
              <Link href="/">View Rules</Link>
            </Button>
            <Button asChild variant="outline" className="text-blue-600 dark:text-blue-400 h-10 md:h-9">
              <Link href="/dashboard/log-climb">Log Climb</Link>
            </Button>
            <Button asChild variant="outline" className="text-purple-600 dark:text-purple-400 h-10 md:h-9">
              <Link href="/dashboard/logbook">Logbook</Link>
            </Button>
          </div>

          {/* Recent Ascents Table - Mobile Responsive */}
          <Card>
            <CardHeader className="pb-4 md:pb-6">
              <CardTitle className="text-lg md:text-xl">Recent Ascents</CardTitle>
              <CardDescription className="text-sm">Latest climbing achievements from all climbers</CardDescription>
            </CardHeader>
            <CardContent className="p-0 md:p-6">
              {/* Desktop Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Climber</TableHead>
                      <TableHead>Problem</TableHead>
                      <TableHead>Grade Sent</TableHead>
                      <TableHead>Absolute Grade</TableHead>
                      <TableHead>Flash?</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentAscents.map((ascent) => (
                      <TableRow key={ascent.id}>
                        <TableCell className="w-12">
                          {ascent.climber?.profile_photo_url ? (
                            <button
                              onClick={() => ascent.climber && handleImageClick(ascent.climber.profile_photo_url!, ascent.climber)}
                              className="hover:opacity-80 transition-opacity cursor-pointer"
                            >
                              <Image
                                src={ascent.climber.profile_photo_url}
                                alt={`${ascent.climber.first_name} ${ascent.climber.last_name}`}
                                width={32}
                                height={32}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            </button>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                              {ascent.climber ? `${ascent.climber.first_name.charAt(0)}${ascent.climber.last_name.charAt(0)}` : 'U'}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {getClimberName(ascent.climber_id)}
                        </TableCell>
                        <TableCell className="font-medium">{ascent.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">V{ascent.working_grade_when_sent}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">V{ascent.absolute_grade}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={ascent.is_flash ? "default" : "secondary"}>
                            {ascent.is_flash ? 'Yes' : 'No'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(ascent.sent_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {ascent.description && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDescriptionModal(ascent.description, getClimberName(ascent.climber_id), ascent.name || 'Unknown Problem', ascent.absolute_grade)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              View
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {recentAscents.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          No ascents logged yet. Start climbing to see achievements here!
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card Layout */}
              <div className="md:hidden space-y-2 p-3">
                {recentAscents.map((ascent) => (
                  <Card key={ascent.id} className="p-3">
                    <div className="flex items-center gap-2">
                      {/* Profile Photo */}
                      <div className="flex-shrink-0">
                        {ascent.climber?.profile_photo_url ? (
                          <button
                            onClick={() => ascent.climber && handleImageClick(ascent.climber.profile_photo_url!, ascent.climber)}
                            className="hover:opacity-80 transition-opacity cursor-pointer"
                          >
                            <Image
                              src={ascent.climber.profile_photo_url}
                              alt={`${ascent.climber.first_name} ${ascent.climber.last_name}`}
                              width={32}
                              height={32}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          </button>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                            {ascent.climber ? `${ascent.climber.first_name.charAt(0)}${ascent.climber.last_name.charAt(0)}` : 'U'}
                          </div>
                        )}
                      </div>

                      {/* Content - Compact Layout */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center mb-2">
                          <h3 className="font-semibold text-sm truncate">
                            {getClimberName(ascent.climber_id)}
                          </h3>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-foreground truncate">
                            {ascent.name} -
                          </p>
                          <Badge variant="default" className="text-xs px-1 py-0">V{ascent.absolute_grade}</Badge>
                          {ascent.is_flash && (
                            <Badge variant="default" className="text-xs px-1 py-0">
                              Flash
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {new Date(ascent.sent_date).toLocaleDateString()} at{' '}
                            <Badge variant="secondary" className="text-xs px-1 py-0">V{ascent.working_grade_when_sent}</Badge>
                          </span>
                          {ascent.description && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDescriptionModal(ascent.description, getClimberName(ascent.climber_id), ascent.name || 'Unknown Problem', ascent.absolute_grade)}
                              className="text-blue-600 hover:text-blue-700 text-xs h-6 px-2"
                            >
                              Details
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                {recentAscents.length === 0 && (
                  <div className="text-center text-muted-foreground py-6">
                    No ascents logged yet. Start climbing to see achievements here!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
