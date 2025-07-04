'use client'

import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
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
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {/* Navigation */}
      <nav className="absolute top-4 right-4 flex items-center space-x-4">
        <span className="text-sm text-gray-600">
          Welcome, {user?.email}
        </span>
        <button
          onClick={handleSignOut}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Sign Out
        </button>
      </nav>

      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start max-w-4xl w-full">
        <section className="flex flex-col items-center gap-4 text-center text-sm/6 font-[family-name:var(--font-geist-mono)] sm:text-left sm:items-start">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-center sm:text-left">
            🧗‍♂️ Boulder League Dashboard
          </h1>
          <p className="text-gray-400 max-w-xl text-center sm:text-left">
            Track your climbing progress, view your working grade, and see your scores.
          </p>
        </section>

        <section className="flex flex-col gap-2 text-sm/6 font-[family-name:var(--font-geist-mono)] text-left w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto w-full">
            <div className="bg-white dark:bg-black p-6 rounded-lg border border-black/[0.08] dark:border-white/[0.12]">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Working Grade
              </h3>
              <p className="text-3xl font-bold text-indigo-600">V0</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Start climbing to see your grade!
              </p>
            </div>
            
            <div className="bg-white dark:bg-black p-6 rounded-lg border border-black/[0.08] dark:border-white/[0.12]">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Total Points
              </h3>
              <p className="text-3xl font-bold text-green-600">0</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Points earned this season
              </p>
            </div>
            
            <div className="bg-white dark:bg-black p-6 rounded-lg border border-black/[0.08] dark:border-white/[0.12]">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Problems Sent
              </h3>
              <p className="text-3xl font-bold text-blue-600">0</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                New problems completed
              </p>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              View Rules
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
} 