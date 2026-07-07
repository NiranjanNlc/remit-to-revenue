import { useState, useEffect } from 'react'
import { supabase } from './utils/supabase'
import HomePage from './pages/HomePage'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAuth, setShowAuth] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null)
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    )
  }

  if (user) {
    return <Dashboard user={user} />
  }

  if (showAuth) {
    return <Auth setUser={setUser} />
  }

  return <HomePage onGetStarted={() => setShowAuth(true)} />
}
