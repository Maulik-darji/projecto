import { useState } from 'react'
import { signInWithGoogle, ADMIN_EMAIL } from '../../lib/firebase'

export function GoogleIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.19 0 10.04 0 12s.45 3.81 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  )
}

export default function AdminLogin({ onLoginSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')
    try {
      const user = await signInWithGoogle()
      if (onLoginSuccess) {
        onLoginSuccess(user)
      }
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Login cancelled. Popup closed.')
      } else if (err.code === 'auth/cancelled-popup-request') {
        // Ignored
      } else {
        setError(err.message || 'Failed to authenticate with Google.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-page-wrap">
      <header className="nav">
        <a href="/" className="logo">
          <span className="logo-mark"><i /><i /></span>PROJECTO
        </a>
        <div className="nav-links">
          <a href="/">Back to Website</a>
        </div>
      </header>

      <main className="admin-login-main">
        <div className="admin-login-card">
          <p className="eyebrow">Projecto Control · Restricted</p>
          <h1 className="admin-login-title">Admin Portal</h1>
          <p className="admin-login-desc">
            Sign in with your Google account to access the Projecto management console.
          </p>

          <div className="admin-auth-box">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="google-btn"
              id="google-signin-btn"
            >
              <GoogleIcon size={22} />
              <span>{loading ? 'Authenticating with Google...' : 'Continue with Google'}</span>
            </button>

            {error && (
              <div className="admin-login-error">
                <span>✕</span> {error}
              </div>
            )}

            <div className="admin-security-note">
              <span className="security-tag">SECURITY POLICY</span>
              <p>
                Access is restricted to authorized personnel:
                <br />
                <code>{ADMIN_EMAIL}</code>
              </p>
            </div>
          </div>

          <div className="admin-card-footer">
            <a href="/">← Return to Projecto homepage</a>
          </div>
        </div>
      </main>
    </div>
  )
}
