import { getSession } from 'next-auth/react'
import { getUserTopTracks, getAudioFeatures, searchTracks } from '../../lib/spotify'

export default async function handler(req, res) {
  const session = await getSession({ req })
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { mood } = req.body
  const accessToken = session.accessToken

  try {
    // Get user's top tracks for personalization
    const topTracks = await getUserTopTracks(accessToken)
    
    // Get audio features for top tracks
    const topTrackIds = topTracks.items.map(track => track.id)
    const topTrackFeatures = await getAudioFeatures(accessToken, topTrackIds)
    
    // Call ML API for mood-based recommendations
    const mlResponse = await fetch(`${process.env.ML_API_URL}/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mood,
        user_preferences: topTrackFeatures.audio_features,
        top_tracks: topTracks.items
      })
    })
    
    const recommendations = await mlResponse.json()
    
    res.status(200).json(recommendations)
  } catch (error) {
    console.error('Recommendation error:', error)
    res.status(500).json({ error: 'Failed to get recommendations' })
  }
}