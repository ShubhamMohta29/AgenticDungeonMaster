'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return setError(error.message)
    router.push('/dashboard')
  }

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', padding: 24 }}>
      <h1>Sign in</h1>
      <input placeholder="Email" value={email}
        onChange={e => setEmail(e.target.value)} style={{ display: 'block', width: '100%', marginBottom: 12 }} />
      <input placeholder="Password" type="password" value={password}
        onChange={e => setPassword(e.target.value)} style={{ display: 'block', width: '100%', marginBottom: 12 }} />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={handleLogin}>Sign in</button>
      <p><a href="/register">Create account</a></p>
    </div>
  )
}