'use client'

import Link from 'next/link'
import { ReactNode, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  const handleSignOut = async () => {
    await signOut()
  }

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

  if (!user) {
    return null
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {/* Navigation */}
      <nav className="absolute top-4 right-4 flex items-center space-x-4">
        <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-500 text-sm font-medium">Dashboard</Link>
        <Link href="/dashboard/leaderboard" className="text-indigo-600 hover:text-indigo-500 text-sm font-medium">Leaderboard</Link>
        <Link href="/dashboard/climbers" className="text-indigo-600 hover:text-indigo-500 text-sm font-medium">Climbers</Link>
        <Link href="/dashboard/profiles" className="text-indigo-600 hover:text-indigo-500 text-sm font-medium">Profiles</Link>
        <span className="text-sm text-gray-600 ml-4">
          Welcome, {user.user_metadata?.display_name || user.email}
        </span>
        <button
          onClick={handleSignOut}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Sign Out
        </button>
      </nav>
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start max-w-4xl w-full">
        {children}
      </main>
    </div>
  )
}
