'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ThemeToggle } from '@/components/theme-toggle'

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button asChild variant="ghost">
                <Link href="/">← Back to Rules</Link>
              </Button>
            </div>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                🚀 Join Boulder League
              </CardTitle>
              <CardDescription className="text-center">
                Create your account to start tracking your climbing progress and competing with others.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Name</Label>
                  <Input
                    id="displayName"
                    name="displayName"
                    type="text"
                    autoComplete="name"
                    required
                    placeholder="First and last name - you'll get a nickname later"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workingGrade">Working Grade</Label>
                  <Select value={workingGrade} onValueChange={setWorkingGrade} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your working grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 17 }, (_, i) => i).map((grade) => (
                        <SelectItem key={grade} value={grade.toString()}>
                          V{grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Your working grade is the highest V-grade where you&apos;ve sent at least that number of problems. 
                    <br/>e.g. if you&apos;ve sent 3 V3s, your working grade is V3.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ascentsOfNextGrade">Ascents of Next Grade</Label>
                  <Input
                    id="ascentsOfNextGrade"
                    name="ascentsOfNextGrade"
                    type="number"
                    min="0"
                    max="20"
                    required
                    placeholder="0"
                    value={ascentsOfNextGrade}
                    onChange={(e) => setAscentsOfNextGrade(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
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

                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    placeholder="Create a password (min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {message && (
                  <Alert>
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Creating account...' : 'Create account'}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {loading ? 'Signing in...' : 'Sign in with Google'}
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="text-primary hover:text-primary/80 font-medium">
                    Sign in here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 