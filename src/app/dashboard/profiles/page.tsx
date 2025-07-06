import Link from 'next/link'

// Mock users (replace with real data later)
const mockUsers = [
  { id: '1', name: 'Alice', profilePhoto: '/default1.png' },
  { id: '2', name: 'Bob', profilePhoto: '/default2.png' },
  { id: '3', name: 'Charlie', profilePhoto: '/default3.png' },
]

export default function ProfilesPage() {
  return (
    <main className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Choose a Profile to Vote/Upload Photo</h1>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {mockUsers.map(user => (
          <li key={user.id} className="bg-gray-800 rounded-lg p-4 flex flex-col items-center">
            <img src={user.profilePhoto} alt={user.name} className="w-16 h-16 rounded-full mb-2" />
            <span className="font-semibold">{user.name}</span>
            <Link
              href={`/dashboard/profiles/${user.id}`}
              className="mt-2 text-indigo-400 hover:underline"
            >
              View & Vote
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}