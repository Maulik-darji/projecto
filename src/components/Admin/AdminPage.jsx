import { useState, useEffect } from 'react'
import { auth, onAuthStateChanged, isUserAdmin } from '../../lib/firebase'
import AdminLogin from './AdminLogin'
import AdminDashboard from './AdminDashboard'
import NotFound from './NotFound'

export default function AdminPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Loading state
  if (loading) {
    return (
      <div className="admin-page-wrap">
        <header className="nav">
          <a href="/" className="logo">
            <span className="logo-mark"><i /><i /></span>PROJECTO
          </a>
        </header>
        <div className="admin-loading-screen">
          <div className="admin-loading-spinner" />
          <p className="admin-loading-text">Verifying authorization...</p>
        </div>
      </div>
    )
  }

  // Not logged in -> Show login prompt with "Continue with Google"
  if (!user) {
    return <AdminLogin onLoginSuccess={(u) => setUser(u)} />
  }

  // Logged in: Check if authorized admin
  if (isUserAdmin(user)) {
    return <AdminDashboard user={user} />
  }

  // Logged in with unauthorized email -> Show 404
  return <NotFound unauthorizedUser={user} />
}
