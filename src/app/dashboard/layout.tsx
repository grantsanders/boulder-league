'use client'

import Link from 'next/link'
import { ReactNode, useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { Climber } from '@/lib/interfaces/user-info'
import Image from 'next/image'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [climberData, setClimberData] = useState<Climber | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchClimberData = async () => {
      if (!user?.id) {
        return
      }

      try {
        const response = await fetch(`/api/climbers?id=${user.id}`)
        const data = await response.json()
        
        if (data.success && data.climbers && data.climbers.length > 0) {
          setClimberData(data.climbers[0])
        }
      } catch (err) {
        console.error('Error fetching climber data:', err)
      }
    }

    fetchClimberData()
  }, [user?.id])

  const handleSignOut = async () => {
    await signOut()
  }

  const formatDisplayName = () => {
    if (!climberData) {
      return user?.user_metadata?.display_name || user?.email || 'User'
    }

    const { first_name, last_name, nickname } = climberData
    if (nickname) {
      return `${first_name} "${nickname}" ${last_name}`
    }
    return `${first_name} ${last_name}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-sm font-medium text-foreground hover:text-foreground/80 transition-colors">
                Dashboard
              </Link>
              <Link href="/dashboard/leaderboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Leaderboard
              </Link>
              <Link href="/dashboard/climbers" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Climbers
              </Link>
              <Link href="/dashboard/profiles" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Profiles
              </Link>
              <Link href="/dashboard/nicknames" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Nicknames
              </Link>
            </div>
            
            {/* User Info, Theme Toggle, and Sign Out */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                {climberData?.profile_photo_url ? (
                  <Image 
                    src={climberData.profile_photo_url} 
                    alt="Profile" 
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                    {climberData ? `${climberData.first_name.charAt(0)}${climberData.last_name.charAt(0)}` : 'U'}
                  </div>
                )}
                <span className="text-sm text-muted-foreground">
                  Logged in as {formatDisplayName()}
                </span>
              </div>
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="text-destructive hover:text-destructive"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
