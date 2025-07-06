import Link from 'next/link'

const mockLeaderboard = [
  { id: '1', name: 'Alice', score: 120, profilePhoto: '/default1.png' },
  { id: '2', name: 'Bob', score: 110, profilePhoto: '/default2.png' },
  { id: '3', name: 'You', score: 95, profilePhoto: '/default3.png' },
  { id: '4', name: 'Charlie', score: 80, profilePhoto: '/default4.png' },
]

const podiumColors = [
  'bg-yellow-400', // Gold
  'bg-gray-300',   // Silver
  'bg-orange-500', // Bronze
]

const podiumShadow = [
  'shadow-yellow-400/60',
  'shadow-gray-300/60',
  'shadow-orange-500/60',
]

export default function LeaderboardPage() {
  const podium = mockLeaderboard.slice(0, 3)
  const others = mockLeaderboard.slice(3)

  return (
    <main className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Leaderboard</h1>

      {/* Podium */}
      <div className="flex justify-center items-end gap-4 mb-10">
        {/* 2nd Place */}
        <div className="flex flex-col items-center">
          <div className={`w-20 h-20 rounded-full border-4 border-white -mb-4 z-10 bg-gray-100 flex items-center justify-center shadow-lg ${podiumShadow[1]}`}>
            <img src={podium[1]?.profilePhoto} alt={podium[1]?.name} className="w-16 h-16 rounded-full object-cover" />
          </div>
          <div className={`w-20 h-24 flex flex-col items-center justify-end ${podiumColors[1]} rounded-t-md`}>
            <span className="text-lg font-bold mb-1">2</span>
            <span className="font-semibold">{podium[1]?.name}</span>
            <span className="text-xs">{podium[1]?.score} pts</span>
          </div>
        </div>
        {/* 1st Place */}
        <div className="flex flex-col items-center">
          <div className={`w-24 h-24 rounded-full border-4 border-white -mb-6 z-20 bg-gray-100 flex items-center justify-center shadow-xl ${podiumShadow[0]}`}>
            <img src={podium[0]?.profilePhoto} alt={podium[0]?.name} className="w-20 h-20 rounded-full object-cover" />
          </div>
          <div className={`w-24 h-32 flex flex-col items-center justify-end ${podiumColors[0]} rounded-t-md`}>
            <span className="text-xl font-bold mb-1">1</span>
            <span className="font-semibold">{podium[0]?.name}</span>
            <span className="text-sm">{podium[0]?.score} pts</span>
          </div>
        </div>
        {/* 3rd Place */}
        <div className="flex flex-col items-center">
          <div className={`w-20 h-20 rounded-full border-4 border-white -mb-4 z-10 bg-gray-100 flex items-center justify-center shadow-lg ${podiumShadow[2]}`}>
            <img src={podium[2]?.profilePhoto} alt={podium[2]?.name} className="w-16 h-16 rounded-full object-cover" />
          </div>
          <div className={`w-20 h-20 flex flex-col items-center justify-end ${podiumColors[2]} rounded-t-md`}>
            <span className="text-lg font-bold mb-1">3</span>
            <span className="font-semibold">{podium[2]?.name}</span>
            <span className="text-xs">{podium[2]?.score} pts</span>
          </div>
        </div>
      </div>

      {/* Others */}
      {others.length > 0 && (
        <ul className="space-y-2 mt-8">
          {others.map((user, i) => (
            <li key={user.id} className="flex items-center gap-4 p-3 bg-gray-800 rounded">
              <span className="text-lg font-bold w-6">{i + 4}</span>
              <img src={user.profilePhoto} alt={user.name} className="w-8 h-8 rounded-full" />
              <span className="flex-1">{user.name}</span>
              <span className="font-mono">{user.score} pts</span>
            </li>
          ))}
        </ul>
      )}

      <Link href="/dashboard" className="block mt-12 text-indigo-400 hover:underline text-center">
        ← Back to Dashboard
      </Link>
    </main>
  )
}