import { useState } from 'react'
import { isEmail, joinWaitlist, sendThumbsUp, useInterest } from '../lib/interest'

const REASONS = ['Cursor & work', 'Notes & reminders', 'Talking to the AI', 'Smart home', 'Presentations', 'Accessibility']

export function ThumbIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d="M2 10 H6 V21 H2 Z" fill="currentColor" />
      <path d="M8 21 V10 L12 2 H14 V8 H21 V12 L18.5 21 Z" fill="currentColor" />
    </svg>
  )
}

export default function Waitlist() {
  const interest = useInterest()
  const [reasons, setReasons] = useState([])
  const [email, setEmail] = useState('')
  const [voteBusy, setVoteBusy] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [voteError, setVoteError] = useState('')

  const pick = (r) => setReasons((rs) => (rs.includes(r) ? rs.filter((x) => x !== r) : [...rs, r]))

  const vote = async () => {
    if (interest.voted || voteBusy) return
    setVoteBusy(true)
    setVoteError('')
    try {
      await sendThumbsUp(reasons)
    } catch (e) {
      setVoteError(e.message)
    }
    setVoteBusy(false)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!isEmail(email)) {
      setError('Please enter a valid email address.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await joinWaitlist(email.trim(), reasons)
    } catch (err) {
      setError(err.message)
    }
    setBusy(false)
  }

  return (
    <section className="reserve" id="waitlist">
      <div className="reserve-inner">
        <p className="eyebrow eyebrow-light">Concept · in development</p>
        <h2>Would you<br />wear it?</h2>

        <div className="wl-grid">
          <div className="wl-vote">
            <button
              className={'thumb-big' + (interest.voted ? ' is-voted' : '')}
              onClick={vote}
              disabled={voteBusy}
              aria-pressed={!!interest.voted}
            >
              <ThumbIcon size={56} />
              <span>{interest.voted ? 'Counted — thank you' : 'Yes, I want this'}</span>
            </button>
            <p className="wl-note">
              {interest.voted
                ? 'Your thumbs-up helps us decide whether to build Projecto.'
                : 'One tap. No email needed. It tells us whether to build Projecto.'}
            </p>
            {voteError && <p className="wl-error" role="alert">{voteError}</p>}

            <div className="wl-reasons">
              <span>What would you use it for? (optional)</span>
              <div>
                {REASONS.map((r) => (
                  <button key={r} className={reasons.includes(r) ? 'is-on' : ''} onClick={() => pick(r)} aria-pressed={reasons.includes(r)}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="wl-form">
            <h3>Get early access</h3>
            <p>Join the waitlist and be first to try Projecto. No deposit, no spam — one email when it's ready.</p>
            {interest.joined ? (
              <div className="wl-done" role="status">
                <strong>You're on the list.</strong>
                <span>We'll write to {interest.email}.</span>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <label htmlFor="wl-email">Email</label>
                <div className="wl-row">
                  <input
                    id="wl-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={!!error}
                  />
                  <button className="btn btn-accent" type="submit" disabled={busy}>
                    {busy ? 'Joining…' : 'Join waitlist'}
                  </button>
                </div>
                {error && <p className="wl-error" role="alert">{error}</p>}
              </form>
            )}
            <div className="price">
              <span className="price-num">$149</span>
              <span className="price-sub">Expected price · left + right ring, charging dock, sizing kit</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Small floating prompt, visible everywhere on the page
export function ThumbsFab() {
  const interest = useInterest()
  const [busy, setBusy] = useState(false)
  const click = async () => {
    if (interest.voted) {
      document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    setBusy(true)
    try {
      await sendThumbsUp([])
    } catch {
      document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })
    }
    setBusy(false)
  }
  return (
    <button className={'fab' + (interest.voted ? ' is-voted' : '')} onClick={click} disabled={busy}>
      <ThumbIcon size={18} />
      <span>{interest.voted ? (interest.joined ? 'Thanks!' : 'Counted · join waitlist') : 'Want this?'}</span>
    </button>
  )
}
