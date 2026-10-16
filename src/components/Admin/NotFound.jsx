import { logOut } from '../../lib/firebase'

export default function NotFound({ unauthorizedUser = null }) {
  const handleSignOut = async () => {
    try {
      await logOut()
      window.location.reload()
    } catch (err) {
      console.error('Sign-out error:', err)
    }
  }

  return (
    <div className="admin-page-wrap">
      <header className="nav">
        <a href="/" className="logo">
          <span className="logo-mark"><i /><i /></span>PROJECTO
        </a>
        <div className="nav-links">
          <a href="/">Back to Home</a>
        </div>
      </header>

      <main className="admin-login-main">
        <div className="not-found-card">
          <p className="eyebrow">Error 404 · Not Found</p>
          <h1 className="not-found-code">404</h1>
          <h2 className="not-found-title">Page not found</h2>
          <p className="not-found-desc">
            The page you are looking for does not exist or has been moved.
          </p>

          {unauthorizedUser && (
            <div className="unauthorized-box">
              <span className="unauth-badge">ACCESS DENIED</span>
              <p className="unauth-text">
                Signed in as: <strong>{unauthorizedUser.email}</strong>
              </p>
              <p className="unauth-sub">
                This Google account is not authorized for administrative access.
              </p>
              <button onClick={handleSignOut} className="btn btn-ghost btn-sm" style={{ marginTop: '12px', width: '100%' }}>
                Switch Google Account
              </button>
            </div>
          )}

          <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
            <a href="/" className="btn" style={{ flex: 1, justifyContent: 'center' }}>
              Return to Projecto
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
