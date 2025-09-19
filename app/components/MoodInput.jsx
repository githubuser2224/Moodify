'use client'

import { useState } from 'react'
import Slider from '@mui/material/Slider'

export default function MoodInput({ onMoodChange }) {
  const [mood, setMood] = useState({
    valence: 0.5,
    energy: 0.5,
    danceability: 0.5,
    acousticness: 0.5,
    instrumentalness: 0.5
  })

  const handleSliderChange = (key, value) => {
    const newMood = { ...mood, [key]: value / 100 }
    setMood(newMood)
    onMoodChange(newMood)
  }

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center">How are you feeling?</h2>
      {Object.entries(mood).map(([key, value]) => (
        <div key={key} className="space-y-2">
          <label className="block text-sm font-medium">
            {key.charAt(0).toUpperCase() + key.slice(1)}: {Math.round(value * 100)}%
          </label>
          <Slider
            value={value * 100}
            onChange={(_, val) => handleSliderChange(key, val)}
            min={0}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
      ))}
    </div>
  )
}