import Link from 'next/link'
import { ReactNode } from 'react'
import { useAuth } from '@/lib/auth-context'


export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

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
            <Link
              href="/dashboard"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Dashboard
            </Link>
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
