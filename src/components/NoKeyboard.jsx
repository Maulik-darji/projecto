import { useEffect, useState } from 'react'

// Sentences "dictated" in the typing demo, looped.
const DICTATION = [
  'Hey Sam, running ten minutes late — start without me.',
  'Q4 plan: ship version two, hire two designers, launch in March.',
  'Thanks for today. Sending the invoice by Friday.',
]

const PARTS = [
  {
    k: '01',
    name: 'Projecto rings',
    does: 'Point · click · scroll · zoom',
    body: 'Slide your thumb on the ring to move the cursor. Tap to click. The other ring scrolls.',
    icon: 'rings',
  },
  {
    k: '02',
    name: 'Wispr Flow',
    does: 'Typing · writing',
    body: 'Typing is powered by Wispr Flow. Speak naturally and it writes clean, formatted text into any app.',
    icon: 'wave',
  },
  {
    k: '03',
    name: 'Built-in AI',
    does: 'Every other control',
    body: 'Reminders, tasks, notes and automations — just ask. It remembers what people ask of you too.',
    icon: 'spark',
  },
]

function Icon({ type }) {
  if (type === 'rings')
    return (
      <svg viewBox="0 0 48 48" aria-hidden>
        <rect x="6" y="14" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="5" />
        <rect x="20" y="14" width="22" height="22" fill="none" stroke="#FF4F00" strokeWidth="5" />
      </svg>
    )
  if (type === 'wave')
    return (
      <svg viewBox="0 0 48 48" aria-hidden>
        {[10, 22, 34, 16, 28, 12, 20].map((h, i) => (
          <rect key={i} x={4 + i * 6} y={24 - h / 2} width="4" height={h} fill={i === 3 ? '#FF4F00' : 'currentColor'} />
        ))}
      </svg>
    )
  return (
    <svg viewBox="0 0 48 48" aria-hidden>
      <path d="M24 4 L28 20 L44 24 L28 28 L24 44 L20 28 L4 24 L20 20 Z" fill="currentColor" />
      <rect x="36" y="6" width="6" height="6" fill="#FF4F00" />
    </svg>
  )
}

// Old tools, crossed out
function Retired() {
  return (
    <div className="retired" aria-label="No mouse, no keyboard">
      <svg viewBox="0 0 64 64" aria-hidden>
        <path d="M20 8 H44 V56 H20 Z" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M32 8 V24 M20 24 H44" stroke="currentColor" strokeWidth="3" />
        <path d="M6 58 L58 6" stroke="#FF4F00" strokeWidth="5" />
      </svg>
      <svg viewBox="0 0 96 64" aria-hidden>
        <path d="M4 14 H92 V54 H4 Z" fill="none" stroke="currentColor" strokeWidth="3" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => <rect key={i} x={12 + i * 11} y="22" width="7" height="7" fill="currentColor" />)}
        {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={17 + i * 11} y="32" width="7" height="7" fill="currentColor" />)}
        <rect x="26" y="42" width="44" height="6" fill="currentColor" />
        <path d="M10 60 L86 4" stroke="#FF4F00" strokeWidth="5" />
      </svg>
    </div>
  )
}

function TypingDemo() {
  const [i, setI] = useState(0)
  const [n, setN] = useState(0)
  const text = DICTATION[i]
  const done = n >= text.length

  useEffect(() => {
    const id = setTimeout(
      () => {
        if (done) {
          setI((x) => (x + 1) % DICTATION.length)
          setN(0)
        } else {
          // words land a few characters at a time, like dictation
          setN((x) => Math.min(text.length, x + 2 + Math.floor(Math.random() * 3)))
        }
      },
      done ? 2200 : 70
    )
    return () => clearTimeout(id)
  }, [n, done, text])

  return (
    <div className="type-demo">
      <div className="type-bar">
        <span>New message</span>
        <span className="type-to">To: Sam</span>
      </div>
      <p className="type-text">
        {text.slice(0, n)}
        <i className="caret" />
      </p>
      <div className="type-foot">
        <div className={'flow-wave' + (done ? ' is-idle' : '')} aria-hidden>
          {Array.from({ length: 14 }).map((_, k) => <i key={k} style={{ animationDelay: `${(k % 7) * 0.07}s` }} />)}
        </div>
        <span>{done ? 'Hold thumb on ring to speak' : 'Listening · typing with Wispr Flow'}</span>
      </div>
    </div>
  )
}

export default function NoKeyboard() {
  return (
    <section className="nokb" id="no-keyboard">
      <div className="nokb-head">
        <div className="section-head">
          <p className="eyebrow">Replace your mouse and keyboard</p>
          <h2>No mouse.<br />No keyboard.</h2>
          <p className="intel-lede">
            Projecto puts your whole computer in one place. The rings move your cursor, Wispr Flow turns your
            voice into text, and the built-in AI handles every other control. Everything, in one pair.
          </p>
        </div>
        <Retired />
      </div>

      <div className="stack">
        {PARTS.map((p, idx) => (
          <div className="stack-cell" key={p.k}>
            <article className="stack-part">
              <div className="stack-top">
                <span className="feature-n">{p.k}</span>
                <span className="stack-icon"><Icon type={p.icon} /></span>
              </div>
              <h3>{p.name}</h3>
              <span className="stack-does">{p.does}</span>
              <p>{p.body}</p>
            </article>
            <span className="stack-op" aria-hidden>{idx < PARTS.length - 1 ? '+' : '='}</span>
          </div>
        ))}
        <article className="stack-sum">
          <span className="feature-n">=</span>
          <h3>Everything,<br />in one pair.</h3>
          <p>No mouse. No keyboard. No switching.</p>
        </article>
      </div>

      <TypingDemo />
    </section>
  )
}
