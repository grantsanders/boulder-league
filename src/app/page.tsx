
'use client'

import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {/* Navigation */}
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

      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start max-w-4xl w-full">

        <section className="flex flex-col items-center gap-4 text-center text-sm/6 font-[family-name:var(--font-geist-mono)] sm:text-left sm:items-start">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-center sm:text-left w">
            🧗‍♂️ Boulder League Rule Proposal
          </h1>
          <p className="text-gray-400 max-w-xl text-center sm:text-left">
            {"Here's our current working plan for boulder league scoring."} <br/>
            {"Please speak now, or forever hold your peace."}
          </p>
        </section>

        <section className="flex flex-col gap-2 text-sm/6 font-[family-name:var(--font-geist-mono)] text-left">
          <h2 className="text-base sm:text-lg font-semibold">🔹 Working Grade</h2>
          <p className="text-gray-400">
            {"Your "}
            <strong>Working Grade</strong>
            {" is the highest V-grade where you've sent at least "}
            <em>that number</em>
            {" of problems. Example:"}
          </p>

          <table className="text-left text-xs sm:text-sm mt-2 border border-black/[0.08] dark:border-white/[0.12] rounded-md overflow-hidden">
            <thead className="bg-black/[0.05] dark:bg-white/[0.06]">
              <tr>
                <th className="px-3 py-2 border-r border-gray-200 dark:border-white/[0.06]">Grade</th>
                <th className="px-3 py-2">Sends Needed</th>
              </tr>
            </thead>
            <tbody>
              {[
                [1, 1], [2, 2], [3, 3], [4, 4], [5, 5],
                [6, 6], [7, 7], [8, 8], [9, 9], [10, 10],
                [11, 11], [12, 12],
              ].map(([grade, sends]) => (
                <tr key={grade} className="odd:bg-black even:bg-black/[0.02] dark:even:bg-white/[0.03]">
                  <td className="px-3 py-1.5 border-r border-gray-200 dark:border-white/[0.06]">V{grade}</td>
                  <td className="px-3 py-1.5">{sends}</td>
                </tr>
              ))}
            </tbody>
          </table>

        </section>

        <section className="flex flex-col gap-2 text-sm/6 font-[family-name:var(--font-geist-mono)] text-left">
          <h2 className="text-base sm:text-lg font-semibold">🔹 Scoring System</h2>
          <p className="text-gray-400">
            Points are based on how a problem compares to your Working Grade:
          </p>

          <table className="text-left text-xs sm:text-sm mt-2 border border-black/[0.08] dark:border-white/[0.12] rounded-md overflow-hidden">
            <thead className="bg-black/[0.05] dark:bg-white/[0.06]">
              <tr>
                <th className="px-3 py-2 border-r border-gray-200 dark:border-white/[0.06]">Relative Grade</th>
                <th className="px-3 py-2">Points</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Working Grade + 3', 175],
                ['Working Grade + 2', 150],
                ['Working Grade + 1', 125],
                ['Working Grade', 100],
                ['Working Grade - 1', 75],
                ['Working Grade - 2', 50],
                ['Working Grade - 3 or lower', 0],
              ].map(([label, score]) => (
                <tr key={label} className="odd:bg-black even:bg-black/[0.02] dark:even:bg-white/[0.03]">
                  <td className="px-3 py-1.5 border-r border-gray-200 dark:border-white/[0.06]">{label}</td>
                  <td className="px-3 py-1.5">{score}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="text-xs text-gray-500 mt-2">
            <strong>Formula:</strong>{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded">
              100 + 25 × (Problem Grade – Working Grade)
            </code>
          </p>
        </section>

        <section className="flex flex-col gap-2 text-sm/6 font-[family-name:var(--font-geist-mono)] text-left">
          <h2 className="text-base sm:text-lg font-semibold">🔹 Flash Bonus</h2>


          <ul className="list-disc list-inside text-gray-400">
            <li><strong>If you flash, you get an additional 20% point bonus</strong></li>
            <strong>Examples:</strong>
            <li>If your working grade is 10, and you flash a 10, you would get 120 points (base 100 + 20) rather than 100.</li> 
            <li>If your working grade is 10 and you flash a 9, you would get 90 points (base 75 + 15) </li>
          </ul>
        </section>

        <section className="flex flex-col gap-2 text-sm/6 font-[family-name:var(--font-geist-mono)] text-left">
          <h2 className="text-base sm:text-lg font-semibold">🔹 Working Grade Behavior</h2>
          <ul className="list-disc list-inside text-gray-400">
            <li><strong>Working Grade updates as soon as you hit the required send count.</strong></li>
            <li>Only new climbs use the updated Working Grade.</li>
            <li>Past sends keep the grade you had at the time of sending.</li>
            <li>(this way, you are incentivized to keep pushing difficulty- as holding back would kneecap you anyway)</li>
          </ul>
        </section>

        <section className="flex flex-col gap-2 text-sm/6 font-[family-name:var(--font-geist-mono)] text-left">
          <h2 className="text-base sm:text-lg font-semibold">🔹 Boulder Qualifications</h2>
          <ul className="list-disc list-inside text-gray-400">
            <li><strong>New Boulders Only!!!</strong></li>
            <li>You cannot get points for repeats, or boulders that overlap significantly (&gt;= 50% of moves)</li>
            <li>You cannot get points for a climb and its low start- you must pick one </li>
            <li>If you do the low start to a stand you have already done, the low will replace the stand in your scoring</li>
            <li>Low starts to stands you have already done are fair game. e.g. if you did Cyclops years ago, you can do Blacksmith this year and get points.</li>
          </ul>
        </section>

        <section className="flex flex-col gap-2 text-sm/6 font-[family-name:var(--font-geist-mono)] text-left">
          <h2 className="text-base sm:text-lg font-semibold">✅ Point Accrual Summary</h2>
          <ul className="list-disc list-inside text-gray-400">
            <li><strong>Working Grade</strong> = highest V-grade with ≥ half that number of sends (rounded up).</li>
            <li><strong>100 points</strong> for sending your Working Grade.</li>
            <li><strong>+25 / –25</strong> points for each grade above/below (to a min of 0).</li>
            <li><strong>+20% bonus</strong> for flashing.</li>
            <li><strong>Working Grade adjusts as you progress,</strong> but previous scores remain fixed.</li>
            <li><strong>No repeats</strong> / significantly overlapping boulders (point farming)</li>
          </ul>
        </section>
      </main>


    </div>
  );
}
