// app/page.tsx
'use client'
import LoginButton from './components/LoginButton'
import { useSession } from 'next-auth/react'

export default function Home() {
  const { data: session } = useSession()

  return (
    <div>
      <h1>Spotify Next.js App</h1>
      <LoginButton />
      
      {session && (
        <div>
          <h2>Welcome, {session.user?.name}!</h2>
          <p>You can now make Spotify API calls</p>
          <p>Access token: {session.accessToken ? '✅ Available' : '❌ Not found'}</p>
        </div>
      )}
    </div>
  )
}