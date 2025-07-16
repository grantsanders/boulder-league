'use client'

import Link from 'next/link'
import { ReactNode } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'


export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log('Dashboard - Loading:', loading, 'User:', user ? 'authenticated' : 'not authenticated')
    if (!loading && !user) {
      console.log('Dashboard - Redirecting to home page')
      router.push('/')
    }
  }, [user, loading, router])

  const handleSignOut = async () => {
    await signOut()
  }

  // Show loading while checking auth status
  if (loading) {
    return (
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start max-w-4xl w-full">
          <div className="text-center">
            <div className="text-lg">Loading...</div>
          </div>
        </main>
      </div>
    )
  }

  // Don't render anything if not authenticated (will redirect)
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex items-center space-x-4 p-4 bg-gray-900 text-white">
        <Link href="/dashboard" className="hover:underline">Dashboard</Link>
        <Link href="/dashboard/leaderboard" className="hover:underline">Leaderboard</Link>
        <Link href="/dashboard/profiles" className="hover:underline">Profiles</Link>
        {/* Add more links as needed */}
      </nav>
      <nav className="absolute top-4 right-4 flex items-center space-x-4">
        {user ? (
          <>
            <span className="text-sm text-gray-600">
              Welcome, {user.user_metadata?.display_name || user.email}
            </span>
            <button
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors mb-2"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link
              href="/auth/login"
              className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Sign Up
            </Link>
          </>
        )}
      </nav>
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
