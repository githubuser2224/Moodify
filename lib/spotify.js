const SPOTIFY_BASE_URL = 'https://api.spotify.com/v1'

export async function searchTracks(accessToken, query, limit = 50) {
  const response = await fetch(
    `${SPOTIFY_BASE_URL}/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  )
  return response.json()
}

export async function getAudioFeatures(accessToken, trackIds) {
  const response = await fetch(
    `${SPOTIFY_BASE_URL}/audio-features?ids=${trackIds.join(',')}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  )
  return response.json()
}

export async function getUserTopTracks(accessToken, timeRange = 'medium_term', limit = 50) {
  const response = await fetch(
    `${SPOTIFY_BASE_URL}/me/top/tracks?time_range=${timeRange}&limit=${limit}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  )
  return response.json()
}

export async function createPlaylist(accessToken, userId, name, trackUris) {
  // Create playlist
  const playlistResponse = await fetch(
    `${SPOTIFY_BASE_URL}/users/${userId}/playlists`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        description: 'Created by Moodify - Music for your mood',
        public: false
      })
    }
  )
  
  const playlist = await playlistResponse.json()
  
  // Add tracks
  await fetch(
    `${SPOTIFY_BASE_URL}/playlists/${playlist.id}/tracks`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        uris: trackUris
      })
    }
  )
  
  return playlist
}