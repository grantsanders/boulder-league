
'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  // Redirect authenticated users to dashboard on first app load only (per tab/session)
  useEffect(() => {
    if (!loading && user) {
      try {
        const hasRedirected = typeof window !== 'undefined' 
          ? sessionStorage.getItem('initialRedirectDone') 
          : 'true'
        if (!hasRedirected) {
          sessionStorage.setItem('initialRedirectDone', 'true')
          router.push('/dashboard')
        }
      } catch {
        // If sessionStorage is unavailable, skip redirect to avoid blocking access
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  // If user is authenticated, still render rules page unless first-load redirect triggers

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className="text-lg font-semibold text-foreground">
                🧗‍♂️ Boulder League
              </h1>
            </div>
            
            <div className="flex items-center space-x-2 md:space-x-4">
              <Button asChild variant="ghost" size="sm" className="text-xs md:text-sm">
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild size="sm" className="text-xs md:text-sm">
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 max-w-4xl">
        <div className="space-y-6 md:space-y-8">
          <section className="text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-3 md:mb-4">
              Boulder League Rules
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
              Official rules for boulder league scoring. <br className="hidden sm:block"/>
            </p>
          </section>

          <Card>
            <CardHeader className="pb-4 md:pb-6">
              <CardTitle className="text-lg md:text-xl">🔹 Working Grade</CardTitle>
              <CardDescription className="text-sm">
                Your Working Grade is the highest V-grade where you&apos;ve sent at least that number of problems.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 md:p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-sm md:text-base px-4">Grade</TableHead>
                      <TableHead className="text-sm md:text-base text-right px-4">Sends Needed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      [1, 1], [2, 2], [3, 3], [4, 4], [5, 5],
                      [6, 6], [7, 7], [8, 8], [9, 9], [10, 10],
                      [11, 11], [12, 12],
                    ].map(([grade, sends]) => (
                      <TableRow key={grade}>
                        <TableCell className="font-medium text-sm md:text-base px-4">V{grade}</TableCell>
                        <TableCell className="text-sm md:text-base text-right px-4">{sends}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4 md:pb-6">
              <CardTitle className="text-lg md:text-xl">🔹 Scoring System</CardTitle>
              <CardDescription className="text-sm">
                Points are based on how a problem compares to your Working Grade
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 md:p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-sm md:text-base px-4">Relative Grade</TableHead>
                      <TableHead className="text-sm md:text-base text-right px-4">Points</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      ['Working Grade + 3', 175],
                      ['Working Grade + 2', 150],
                      ['Working Grade + 1', 125],
                      ['Working Grade', 100],
                      ['Working Grade - 1', 75],
                      ['Working Grade - 2', 50],
                      ['Working Grade - 3 or lower', 0],
                    ].map(([label, score]) => (
                      <TableRow key={label}>
                        <TableCell className="font-medium text-sm md:text-base px-4">{label}</TableCell>
                        <TableCell className="text-sm md:text-base text-right px-4">{score}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="p-4 md:p-6 pt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  <strong className="underline">Formula</strong>
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  <code className="bg-muted px-2 py-1 rounded text-xs md:text-sm">
                    100 + 25 × (Problem Grade – Working Grade)
                  </code>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4 md:pb-6">
              <CardTitle className="text-lg md:text-xl">🔹 Flash Bonus</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4 text-center">
              <p className="text-muted-foreground text-sm md:text-base">
                <strong>If you flash, you get an additional 20% point bonus</strong>
              </p>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>Examples:</strong>
                </p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>If your working grade is 10, and you flash a 10, you would get 120 points (base 100 + 20) rather than 100.</p> 
                  <div className="border-t border-border/30 my-2"></div>
                  <p>If your working grade is 10 and you flash a 9, you would get 90 points (base 75 + 15)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4 md:pb-6">
              <CardTitle className="text-lg md:text-xl">🔹 Working Grade Behavior</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-muted-foreground space-y-2 text-sm md:text-base">
                <p><strong>Working Grade updates as soon as you hit the required send count.</strong></p>
                <div className="border-t border-border/30 my-2"></div>
                <p>Only new climbs use the updated Working Grade.</p>
                <div className="border-t border-border/30 my-2"></div>
                <p>Past sends keep the grade you had at the time of sending.</p>
                <div className="border-t border-border/30 my-2"></div>
                <p>(this way, you are incentivized to keep pushing difficulty- as holding back would kneecap you anyway)</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4 md:pb-6">
              <CardTitle className="text-lg md:text-xl">🔹 Boulder Qualifications</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-muted-foreground space-y-2 text-sm md:text-base">
                <p><strong>New Boulders Only!!!</strong></p>
                <div className="border-t border-border/30 my-2"></div>
                <p>You cannot get points for repeats, or boulders that overlap significantly (&gt;= 50% of moves)</p>
                <div className="border-t border-border/30 my-2"></div>
                <p>You cannot get points for a climb and its low start- you must pick one</p>
                <div className="border-t border-border/30 my-2"></div>
                <p>If you do the low start to a stand you have already done, the low will replace the stand in your scoring</p>
                <div className="border-t border-border/30 my-2"></div>
                <p>Low starts to stands you have already done are fair game. e.g. if you did Cyclops years ago, you can do Blacksmith this year and get points.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4 md:pb-6">
              <CardTitle className="text-lg md:text-xl">✅ Point Accrual Summary</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-muted-foreground space-y-2 text-sm md:text-base">
                <p><strong>Working Grade</strong> = highest V-grade with that number of sends.</p>
                <div className="border-t border-border/30 my-2"></div>
                <p><strong>100 points</strong> for sending your Working Grade.</p>
                <div className="border-t border-border/30 my-2"></div>
                <p><strong>+25 / –25</strong> points for each grade above/below (to a min of 2 below 0).</p>
                <div className="border-t border-border/30 my-2"></div>
                <p><strong>+20% bonus</strong> for flashing.</p>
                <div className="border-t border-border/30 my-2"></div>
                <p><strong>Working Grade adjusts as you progress,</strong> but previous scores remain fixed.</p>
                <div className="border-t border-border/30 my-2"></div>
                <p><strong>No repeats</strong> / significantly overlapping boulders (point farming)</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
