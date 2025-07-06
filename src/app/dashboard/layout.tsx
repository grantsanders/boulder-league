import Link from 'next/link'
import { ReactNode } from 'react'


export default function DashboardLayout({ children }: { children: ReactNode }) {

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex items-center space-x-4 p-4 bg-gray-900 text-white">
        <Link href="/dashboard" className="hover:underline">Dashboard</Link>
        <Link href="/dashboard/leaderboard" className="hover:underline">Leaderboard</Link>
        <Link href="/dashboard/profiles" className="hover:underline">Profiles</Link>
        {/* Add more links as needed */}
      </nav>
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
