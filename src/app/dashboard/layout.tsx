import Link from 'next/link'
import { ReactNode } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'



export default function DashboardLayout({ children }: { children: ReactNode }) {
    const { user, loading, signOut } = useAuth()
    const router = useRouter()
    const handleSignOut = async () => {
        await signOut()
    }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex items-center space-x-4 p-4 bg-gray-900 text-white">
        <Link href="/dashboard" className="hover:underline">Dashboard</Link>
        <Link href="/dashboard/leaderboard" className="hover:underline">Leaderboard</Link>
        {/* Add more links as needed */}
        <span className="text-sm text-gray-600">
          Welcome, {user?.user_metadata?.display_name || user?.email}
        </span>
        <button
          onClick={handleSignOut}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Sign Out
        </button>
      </nav>
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
