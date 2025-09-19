from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Spotify client setup
client_credentials_manager = SpotifyClientCredentials(
    client_id=os.getenv('SPOTIFY_CLIENT_ID'),
    client_secret=os.getenv('SPOTIFY_CLIENT_SECRET')
)
sp = spotipy.Spotify(client_credentials_manager=client_credentials_manager)

class MoodRecommender:
    def __init__(self):
        self.scaler = StandardScaler()
        
    def calculate_mood_similarity(self, track_features, target_mood):
        """Calculate similarity between track features and target mood"""
        # Audio features that matter for mood
        mood_features = ['valence', 'energy', 'danceability', 'acousticness', 'instrumentalness']
        
        track_vector = np.array([[track_features.get(f, 0.5) for f in mood_features]])
        mood_vector = np.array([[target_mood.get(f, 0.5) for f in mood_features]])
        
        similarity = cosine_similarity(track_vector, mood_vector)[0][0]
        return max(0, similarity)  # Ensure positive similarity
    
    def get_genre_seeds_from_mood(self, mood):
        """Map mood to appropriate genre seeds"""
        valence = mood.get('valence', 0.5)
        energy = mood.get('energy', 0.5)
        
        if valence > 0.7 and energy > 0.7:
            return ['pop', 'dance', 'funk']
        elif valence > 0.6 and energy < 0.4:
            return ['indie', 'folk', 'acoustic']
        elif valence < 0.4 and energy < 0.4:
            return ['ambient', 'sad', 'indie']
        elif valence < 0.4 and energy > 0.6:
            return ['rock', 'punk', 'metal']
        else:
            return ['indie', 'alternative', 'pop']
    
    def recommend_tracks(self, mood, user_preferences=None, top_tracks=None, limit=20):
        """Generate track recommendations based on mood"""
        try:
            # Get genre seeds based on mood
            genre_seeds = self.get_genre_seeds_from_mood(mood)

            # Use Spotify's recommendation engine with mood parameters
            recommendations = sp.recommendations(
                seed_genres=genre_seeds[:2],  # Max 2 genre seeds
                limit=50,
                target_valence=mood.get('valence', 0.5),
                target_energy=mood.get('energy', 0.5),
                target_danceability=mood.get('danceability', 0.5),
                target_acousticness=mood.get('acousticness', 0.5),
                target_instrumentalness=mood.get('instrumentalness', 0.5)
            )
            print('Spotify recommendations response:', recommendations)  # Debug print
            
            # Score and rank tracks
            scored_tracks = []
            for track in recommendations['tracks']:
                # Get audio features
                audio_features = sp.audio_features([track['id']])[0]
                if audio_features:
                    mood_score = self.calculate_mood_similarity(audio_features, mood)
                    
                    track_data = {
                        'id': track['id'],
                        'name': track['name'],
                        'artists': track['artists'],
                        'album': track['album'],
                        'preview_url': track['preview_url'],
                        'external_urls': track['external_urls'],
                        'mood_score': mood_score,
                        'audio_features': audio_features
                    }
                    scored_tracks.append(track_data)
            
            # Sort by mood score and return top tracks
            scored_tracks.sort(key=lambda x: x['mood_score'], reverse=True)
            return scored_tracks[:limit]
            
        except Exception as e:
            print(f"Error in recommend_tracks: {e}")
            return []

recommender = MoodRecommender()

@app.route('/recommend', methods=['POST'])
def get_recommendations():
    try:
        data = request.json
        mood = data.get('mood', {})
        user_preferences = data.get('user_preferences', [])
        top_tracks = data.get('top_tracks', [])
        
        recommendations = recommender.recommend_tracks(
            mood=mood,
            user_preferences=user_preferences,
            top_tracks=top_tracks
        )
        
        return jsonify({
            'recommendations': recommendations,
            'mood_analysis': {
                'target_mood': mood,
                'recommended_genres': recommender.get_genre_seeds_from_mood(mood),
                'total_tracks': len(recommendations)
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)