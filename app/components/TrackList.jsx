export default function TrackList({ tracks, onCreatePlaylist }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Your Mood Playlist</h3>
        <button
          onClick={onCreatePlaylist}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Create Spotify Playlist
        </button>
      </div>
      
      {tracks.map((track, index) => (
        <div key={track.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <img
            src={track.album.images[0]?.url}
            alt={track.album.name}
            className="w-16 h-16 rounded"
          />
          <div className="flex-1">
            <h4 className="font-semibold">{track.name}</h4>
            <p className="text-gray-600">{track.artists[0].name}</p>
            <div className="text-sm text-gray-500">
              Match: {Math.round(track.mood_score * 100)}%
            </div>
          </div>
          <audio controls src={track.preview_url} className="w-32" />
        </div>
      ))}
    </div>
  )
}