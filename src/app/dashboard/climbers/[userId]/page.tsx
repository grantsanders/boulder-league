
"use client";


//
import * as React from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Ascent as BaseAscent } from "@/lib/interfaces/scoring";
import dynamic from "next/dynamic";
// Dynamically import the GradeBarChart to avoid SSR issues
const GradeBarChart = dynamic(() => import("@/components/GradeBarChart"), { ssr: false });





import type { Climber } from "@/lib/interfaces/user-info";

interface ClimberProfilePageProps {
  params: Promise<{ userId: string }>;
}

export default function ClimberProfilePage({ params }: ClimberProfilePageProps) {
  // Next.js 14+ App Router: params is always a Promise, must unwrap with React.use()
  const { userId } = React.use(params) as { userId: string };
  // The API returns Ascent with climber_id
  type Ascent = BaseAscent & { climber_id: string };
  const [climber, setClimber] = React.useState<Climber | null>(null);
  const [logbook, setLogbook] = React.useState<Ascent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch climber info
        const climberRes = await fetch(`/api/climbers?id=${userId}`);
        const climberData = await climberRes.json();
        if (climberData.success && climberData.climbers && climberData.climbers.length > 0) {
          setClimber(climberData.climbers[0] as Climber);
        } else {
          setClimber(null);
        }
        // Fetch all ascents (with climber info)
        const allAscentsRes = await fetch('/api/ascents/all');
        const allAscentsData = await allAscentsRes.json();
        if (allAscentsData.success && Array.isArray(allAscentsData.ascents)) {
          // Filter for this climber
          const climberAscents = allAscentsData.ascents.filter((a: Ascent) => a.climber_id === userId);
          // Sort by sent_date descending
          climberAscents.sort((a: Ascent, b: Ascent) => new Date(b.sent_date).getTime() - new Date(a.sent_date).getTime());
          setLogbook(climberAscents);
        } else {
          setLogbook([]);
        }
      } catch {
        setError("Failed to load climber profile");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600 font-bold text-xl mb-4">{error}</div>;
  }

  if (!climber) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-red-600 font-bold text-xl mb-4">Climber not found for userId: {userId}</div>
      </div>
    );
  }

  // Compute grade distribution for bar chart
  let minGrade = Infinity, maxGrade = -Infinity;
  const gradeCounts: Record<number, number> = {};
  logbook.forEach((a) => {
    if (typeof a.absolute_grade === 'number') {
      minGrade = Math.min(minGrade, a.absolute_grade);
      maxGrade = Math.max(maxGrade, a.absolute_grade);
      gradeCounts[a.absolute_grade] = (gradeCounts[a.absolute_grade] || 0) + 1;
    }
  });
  const barData = (minGrade !== Infinity && maxGrade !== -Infinity)
    ? Array.from({ length: maxGrade - minGrade + 1 }, (_, i) => {
        const grade = minGrade + i;
        return { grade: `V${grade}`, count: gradeCounts[grade] || 0 };
      })
    : [];

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="mb-8">
        <CardHeader className="flex flex-col items-center">
          {climber.profile_photo_url ? (
            <Image
              src={climber.profile_photo_url}
              alt={climber.nickname || climber.first_name}
              width={180}
              height={180}
              className="object-cover border shadow-md mb-4 rounded-lg" // Subtle rounding
            />
          ) : (
            <div
              className="flex items-center justify-center mb-4"
              style={{ width: 180, height: 180, background: '#e5e7eb', fontSize: 64, fontWeight: 700, color: '#6b7280', border: '1px solid #d1d5db' }}
            >
              {`${climber.first_name?.[0] || ''}${climber.last_name?.[0] || ''}`.toUpperCase()}
            </div>
          )}
          <CardTitle className="text-3xl font-bold text-center">{climber.nickname || climber.first_name}</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            {climber.first_name} {climber.last_name}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-2">
          <div className="flex gap-4 flex-wrap justify-center">
            <Badge variant="secondary">Score: {climber.running_score}</Badge>
            <Badge variant="secondary">Working Grade: V{climber.working_grade}</Badge>
            <Badge variant="secondary">Ascents of Next Grade: {climber.ascents_of_next_grade}</Badge>
          </div>
        </CardContent>
      </Card>
      {/* Bar graph for grade distribution */}
      {barData.length > 0 && (
        <div className="mb-8">
          <GradeBarChart data={barData} />
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Logbook</CardTitle>
          <div className="text-xs text-muted-foreground mt-1">{logbook.length} ascent{logbook.length === 1 ? '' : 's'}</div>
        </CardHeader>
        <CardContent>
          {logbook.length === 0 ? (
            <div className="text-muted-foreground text-center">No climbs logged yet.</div>
          ) : (
            <ul className="divide-y">
              {logbook.map((climb) => (
                <li key={climb.id} className="py-3 flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="font-medium">{climb.name}</span>
                  <span className="text-sm text-muted-foreground">{(() => {
                            const [year, month, day] = climb.sent_date.split('-');
                            return `${month}/${day}/${year}`;
                          })()}</span>
                  <span className="ml-auto text-sm">Grade: V{climb.absolute_grade}</span>
                  <span className="ml-2 text-sm">Flash: {climb.is_flash ? 'Yes' : 'No'}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
