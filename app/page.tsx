'use client'

import { useState } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import MoodInput from './components/MoodInput'
import TrackList from './components/TrackList'

export default function Home() {
  const { data: session } = useSession()
  const [mood, setMood] = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleMoodChange = (newMood: string) => {
    setMood(newMood)
  }

  const getRecommendations = async () => {
    if (!mood) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mood })
      })
      
      const data = await response.json()
      setRecommendations(data.recommendations)
    } catch (error) {
      console.error('Failed to get recommendations:', error)
    }
    setLoading(false)
  }

  const createPlaylist = async () => {
    // Implementation for creating Spotify playlist
    // This would call another API route
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-8">Moodify</h1>
          <p className="text-white mb-8">Music that matches your mood</p>
          <button
            onClick={() => signIn('spotify')}
            className="px-8 py-4 bg-green-500 text-white font-bold rounded-full hover:bg-green-600 transition-colors"
          >
            Connect with Spotify
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Moodify</h1>
          <p className="text-gray-600">Welcome back, {session.user?.name}!</p>
          <button
            onClick={() => signOut()}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Sign out
          </button>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <MoodInput onMoodChange={handleMoodChange} />
            <button
              onClick={getRecommendations}
              disabled={!mood || loading}
              className="w-full mt-4 px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Finding your music...' : 'Get Recommendations'}
            </button>
          </div>
          
          <div>
            {recommendations && (
              <TrackList
                tracks={recommendations}
                onCreatePlaylist={createPlaylist}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}