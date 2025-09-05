// app/components/LoginButton.tsx
'use client'
import { useSession, signIn, signOut } from 'next-auth/react'

export default function LoginButton() {
  const { data: session, status } = useSession()

  if (status === 'loading') return <p>Loading...</p>

  if (session) {
    return (
      <div>
        <p>Signed in as {session.user?.email}</p>
        <button onClick={() => signOut()}>Sign out</button>
      </div>
    )
  }

  return (
    <div>
      <p>Not signed in</p>
      <button onClick={() => signIn('spotify')}>Sign in with Spotify</button>
    </div>
  )
}