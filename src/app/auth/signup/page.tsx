'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [workingGrade, setWorkingGrade] = useState('')
  const [ascentsOfNextGrade, setAscentsOfNextGrade] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const { signUp, signInWithGoogle } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    console.log('🚀 Starting email account creation process...')
    console.log('📝 Form data:', { email, displayName: displayName.trim(), workingGrade, ascentsOfNextGrade })

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    if (!displayName.trim()) {
      setError('Display name is required')
      setLoading(false)
      return
    }

    if (!workingGrade) {
      setError('Working grade is required')
      setLoading(false)
      return
    }

    if (!ascentsOfNextGrade) {
      setError('Number of ascents of next grade is required')
      setLoading(false)
      return
    }

    console.log('✅ Form validation passed, calling signUp...')
    const { error } = await signUp(email, password, displayName.trim())
    
    console.log('📧 SignUp result:', { error: error?.message || 'No error' })
    
    if (!error) {
      console.log('💾 Storing pending data in localStorage...')
      // Store working grade and ascents for later climber creation
      localStorage.setItem('pendingWorkingGrade', workingGrade)
      localStorage.setItem('pendingAscentsOfNextGrade', ascentsOfNextGrade)
      localStorage.setItem('pendingDisplayName', displayName.trim())
      console.log('✅ Pending data stored:', { workingGrade, ascentsOfNextGrade, displayName: displayName.trim() })
    }
    
    if (error) {
      console.log('❌ SignUp failed:', error.message)
      setError(error.message)
      setLoading(false)
    } else {
      console.log('✅ SignUp successful, showing confirmation message')
      setMessage('Check your email for a confirmation link! After confirming, you can sign in to access your dashboard.')
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)

    const { error } = await signInWithGoogle()
    
    if (error) {
      setError(error.message)
      setLoading(false)
    }
    // Google OAuth will handle the redirect automatically
  }

  return (
    <div className="relative grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {/* Return to Rules Button */}
      <div className="absolute top-4 left-4 z-10">
        <Link
          href="/rules"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-black border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          ← Return to Rules
        </Link>
      </div>

      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start max-w-4xl w-full">
        <section className="flex flex-col items-center gap-4 text-center text-sm/6 font-[family-name:var(--font-geist-mono)] sm:text-left sm:items-start">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-center sm:text-left">
            🚀 Join Boulder League
          </h1>
          <p className="text-gray-400 max-w-xl text-center sm:text-left">
            Create your account to start tracking your climbing progress and competing with others.
          </p>
        </section>

        <section className="flex flex-col gap-2 text-sm/6 font-[family-name:var(--font-geist-mono)] text-left w-full max-w-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                autoComplete="name"
                required
                className="w-full px-3 py-2 border border-black/[0.08] dark:border-white/[0.12] rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="First and last name - you'll get a nickname later"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="workingGrade" className="block text-sm font-medium text-gray-700 mb-1">
                Working Grade
              </label>
              <select
                id="workingGrade"
                name="workingGrade"
                required
                className="w-full px-3 py-2 border border-black/[0.08] dark:border-white/[0.12] rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={workingGrade}
                onChange={(e) => setWorkingGrade(e.target.value)}
              >
                <option value="">Select your working grade</option>
                {Array.from({ length: 17 }, (_, i) => i).map((grade) => (
                  <option key={grade} value={grade}>
                    V{grade}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Your working grade is the highest V-grade where you&apos;ve sent at least that number of problems. 
                <br/>e.g. if you&apos;ve sent 3 V3s, your working grade is V3.
              </p>
            </div>

            <div>
              <label htmlFor="ascentsOfNextGrade" className="block text-sm font-medium text-gray-700 mb-1">
                Ascents of Next Grade
              </label>
              <input
                id="ascentsOfNextGrade"
                name="ascentsOfNextGrade"
                type="number"
                min="0"
                max="20"
                required
                className="w-full px-3 py-2 border border-black/[0.08] dark:border-white/[0.12] rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="0"
                value={ascentsOfNextGrade}
                onChange={(e) => setAscentsOfNextGrade(e.target.value)}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {workingGrade ? (
                  <>
                    How many climbs of the next grade (V{parseInt(workingGrade) + 1}) have you already sent?
                  </>
                ) : (
                  <>
                    How many climbs of the next grade have you already sent?
                    <br/>Select your working grade above first.
                  </>
                )}
              </p>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-3 py-2 border border-black/[0.08] dark:border-white/[0.12] rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="w-full px-3 py-2 border border-black/[0.08] dark:border-white/[0.12] rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Create a password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className="w-full px-3 py-2 border border-black/[0.08] dark:border-white/[0.12] rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
                <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
              </div>
            )}

            {message && (
              <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800">
                <div className="text-sm text-green-700 dark:text-green-300">{message}</div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-black text-gray-500">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-black text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </button>

          <div className="text-center mt-4">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-500 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  )
} 