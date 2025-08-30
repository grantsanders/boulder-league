'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  const { signUp } = useAuth()

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