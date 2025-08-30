
'use client'

import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

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
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-muted-foreground">
                    Logged in as {user.user_metadata?.display_name || user.email}
                  </span>
                  <Button asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="ghost">
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/auth/signup">Sign Up</Link>
                  </Button>
                </>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        <div className="space-y-8">
          <section className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
              Boulder League Rule Proposal
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                             Here&apos;s our current working plan for boulder league scoring. <br/>
               Please speak now, or forever hold your peace.
            </p>
          </section>

          <Card>
            <CardHeader>
              <CardTitle>🔹 Working Grade</CardTitle>
              <CardDescription>
                Your Working Grade is the highest V-grade where you&apos;ve sent at least that number of problems.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Grade</TableHead>
                    <TableHead>Sends Needed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    [1, 1], [2, 2], [3, 3], [4, 4], [5, 5],
                    [6, 6], [7, 7], [8, 8], [9, 9], [10, 10],
                    [11, 11], [12, 12],
                  ].map(([grade, sends]) => (
                    <TableRow key={grade}>
                      <TableCell className="font-medium">V{grade}</TableCell>
                      <TableCell>{sends}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🔹 Scoring System</CardTitle>
              <CardDescription>
                Points are based on how a problem compares to your Working Grade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Relative Grade</TableHead>
                    <TableHead>Points</TableHead>
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
                    ['Working Grade - 3', 25],
                    ['Working Grade - 4 or lower', 0],
                  ].map(([label, score]) => (
                    <TableRow key={label}>
                      <TableCell className="font-medium">{label}</TableCell>
                      <TableCell>{score}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="text-sm text-muted-foreground mt-4">
                <strong>Formula:</strong>{" "}
                <code className="bg-muted px-2 py-1 rounded text-sm">
                  100 + 25 × (Problem Grade – Working Grade)
                </code>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🔹 Flash Bonus</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                <strong>If you flash, you get an additional 20% point bonus</strong>
              </p>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>Examples:</strong>
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>If your working grade is 10, and you flash a 10, you would get 120 points (base 100 + 20) rather than 100.</li> 
                  <li>If your working grade is 10 and you flash a 9, you would get 90 points (base 75 + 15)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🔹 Working Grade Behavior</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>Working Grade updates as soon as you hit the required send count.</strong></li>
                <li>Only new climbs use the updated Working Grade.</li>
                <li>Past sends keep the grade you had at the time of sending.</li>
                <li>(this way, you are incentivized to keep pushing difficulty- as holding back would kneecap you anyway)</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🔹 Boulder Qualifications</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>New Boulders Only!!!</strong></li>
                <li>You cannot get points for repeats, or boulders that overlap significantly (&gt;= 50% of moves)</li>
                <li>You cannot get points for a climb and its low start- you must pick one</li>
                <li>If you do the low start to a stand you have already done, the low will replace the stand in your scoring</li>
                <li>Low starts to stands you have already done are fair game. e.g. if you did Cyclops years ago, you can do Blacksmith this year and get points.</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>✅ Point Accrual Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>Working Grade</strong> = highest V-grade with that number of sends.</li>
                <li><strong>100 points</strong> for sending your Working Grade.</li>
                <li><strong>+25 / –25</strong> points for each grade above/below (to a min of 0).</li>
                <li><strong>+20% bonus</strong> for flashing.</li>
                <li><strong>Working Grade adjusts as you progress,</strong> but previous scores remain fixed.</li>
                <li><strong>No repeats</strong> / significantly overlapping boulders (point farming)</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
