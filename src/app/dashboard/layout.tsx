import Link from 'next/link'
import { ReactNode } from 'react'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {/* Navigation */}
      <nav className="absolute top-4 right-4 flex items-center space-x-4">
        <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-500 text-sm font-medium">Dashboard</Link>
        <Link href="/dashboard/leaderboard" className="text-indigo-600 hover:text-indigo-500 text-sm font-medium">Leaderboard</Link>
        <Link href="/dashboard/climbers" className="text-indigo-600 hover:text-indigo-500 text-sm font-medium">Climbers</Link>
        <Link href="/dashboard/profiles" className="text-indigo-600 hover:text-indigo-500 text-sm font-medium">Profiles</Link>
      </nav>
      
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start max-w-4xl w-full">
        {children}
      </main>
    </div>
  )
}
