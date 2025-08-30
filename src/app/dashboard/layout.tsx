'use client'

import Link from 'next/link'
import { ReactNode, useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { Climber } from '@/lib/interfaces/user-info'
import Image from 'next/image'
import ImageModal from '@/components/ui/image-modal'
import { formatNameWithNickname } from '@/lib/utils/name-formatter'
import { Menu, X, LogOut } from 'lucide-react'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [climberData, setClimberData] = useState<Climber | null>(null)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
      return formatNameWithNickname(first_name, last_name, nickname)
    }
    return `${first_name} ${last_name}`
  }

  const navigationItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/leaderboard', label: 'Leaderboard' },
    { href: '/dashboard/climbers', label: 'Climbers' },
    { href: '/dashboard/profiles', label: 'Profiles' },
    { href: '/dashboard/nicknames', label: 'Nicknames' },
  ]

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
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {navigationItems.map((item) => (
                <Link 
                  key={item.href}
                  href={item.href} 
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
            
            {/* User Info, Theme Toggle, and Sign Out - Always Visible */}
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="hidden sm:flex items-center space-x-3">
                {climberData?.profile_photo_url ? (
                  <button
                    onClick={() => setIsImageModalOpen(true)}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <Image 
                      src={climberData.profile_photo_url} 
                      alt="Profile" 
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  </button>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                    {climberData ? `${climberData.first_name.charAt(0)}${climberData.last_name.charAt(0)}` : 'U'}
                  </div>
                )}
                <span className="text-sm text-muted-foreground">
                  {formatDisplayName()}
                </span>
              </div>
              
              {/* Mobile: Just show initials and name */}
              <div className="sm:hidden flex items-center space-x-2">
                {climberData?.profile_photo_url ? (
                  <button
                    onClick={() => setIsImageModalOpen(true)}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <Image 
                      src={climberData.profile_photo_url} 
                      alt="Profile" 
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  </button>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                    {climberData ? `${climberData.first_name.charAt(0)}${climberData.last_name.charAt(0)}` : 'U'}
                  </div>
                )}
                <span className="text-xs text-muted-foreground truncate max-w-20">
                  {climberData ? `${climberData.first_name}` : 'User'}
                </span>
              </div>
              
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="text-destructive hover:text-destructive text-xs md:text-sm"
              >
                <span className="hidden sm:inline">Sign Out</span>
                <LogOut className="h-4 w-4 sm:hidden" />
              </Button>
            </div>
          </div>

          {/* Mobile Navigation Drawer */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t bg-background/95 backdrop-blur">
              <div className="py-4 space-y-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Image Modal */}
      {climberData?.profile_photo_url && (
        <ImageModal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          imageUrl={climberData.profile_photo_url}
          alt={`${climberData.first_name} ${climberData.last_name}`}
          title={formatDisplayName()}
        />
      )}
    </div>
  )
}
