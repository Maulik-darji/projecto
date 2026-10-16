import { useEffect, useRef, useState } from 'react'
import { isEmail, joinWaitlist, sendThumbsUp, useInterest } from '../lib/interest'

const ASK_REASON = 'projecto:ask-reason'
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
  const [reasonError, setReasonError] = useState('')
  const [shake, setShake] = useState(0)
  const reasonsRef = useRef(null)

  const pick = (r) => {
    setReasonError('')
    setReasons((rs) => (rs.includes(r) ? rs.filter((x) => x !== r) : [...rs, r]))
  }

  // At least one use is required before a vote or sign-up goes through
  const askForReason = (msg) => {
    setReasonError(msg)
    setShake((n) => n + 1)
    reasonsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  // The floating button sends visitors here to choose first
  useEffect(() => {
    const on = () => askForReason('Pick what you would use it for, then tap “Yes, I want this”.')
    window.addEventListener(ASK_REASON, on)
    return () => window.removeEventListener(ASK_REASON, on)
  }, [])

  const vote = async () => {
    if (interest.voted || voteBusy) return
    if (reasons.length === 0) {
      askForReason('Pick at least one thing you would use it for first.')
      return
    }
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
    const chosen = reasons.length ? reasons : interest.reasons || []
    if (chosen.length === 0) {
      setError('')
      askForReason('Pick at least one thing you would use it for before joining.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await joinWaitlist(email.trim(), chosen)
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
            <div className={'wl-reasons' + (reasonError ? ' is-error' : '')} ref={reasonsRef} key={shake}>
              <span>What would you use it for? Pick at least one</span>
              <div role="group" aria-label="What would you use it for">
                {REASONS.map((r) => (
                  <button key={r} className={reasons.includes(r) ? 'is-on' : ''} onClick={() => pick(r)} aria-pressed={reasons.includes(r)}>
                    {r}
                  </button>
                ))}
              </div>
              {reasonError && <p className="wl-error" role="alert">{reasonError}</p>}
            </div>

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
          </div>
        </div>
      </div>
    </section>
  )
}

// Small floating prompt, visible everywhere on the page
export function ThumbsFab() {
  const interest = useInterest()
  const click = () => {
    if (interest.voted) {
      document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    // Don't vote blind: send them to choose what they'd use it for first
    window.dispatchEvent(new Event(ASK_REASON))
  }
  return (
    <button className={'fab' + (interest.voted ? ' is-voted' : '')} onClick={click}>
      <ThumbIcon size={18} />
      <span>{interest.voted ? (interest.joined ? 'Thanks!' : 'Counted · join waitlist') : 'Want this?'}</span>
    </button>
  )
}
