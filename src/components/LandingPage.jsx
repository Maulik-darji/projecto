import Scene from './Scene'
import RingDrawing from './RingDrawing'
import Intelligence from './Intelligence'
import NoKeyboard from './NoKeyboard'
import Film from './Film'
import Waitlist, { ThumbsFab } from './Waitlist'

function Nav() {
  return (
    <header className="nav">
      <a href="#top" className="logo">
        <span className="logo-mark"><i /><i /></span>PROJECTO
      </a>
      <nav className="nav-links">
        <a href="#demo">How it works</a>
        <a href="#no-keyboard">No keyboard</a>
        <a href="#intelligence">Intelligence</a>
        <a href="#features">Features</a>
      </nav>
      <a href="#waitlist" className="btn btn-sm">Join waitlist</a>
    </header>
  )
}

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-copy">
        <p className="eyebrow">No mouse · No keyboard</p>
        <h1>
          Two rings.<br />One cursor.
        </h1>
        <p className="lede">
          Projecto is a pair of smart rings — one on each index finger. The outer band is a
          360° trackpad: slide your thumb on it to move the cursor, tap to click, slide the other ring to scroll.
          Typing is powered by Wispr Flow — just speak and it writes. The built-in AI handles your reminders,
          tasks and automations. No mouse, no keyboard: one pair controls everything.
        </p>
        <div className="hero-cta">
          <a href="#waitlist" className="btn">Join the waitlist</a>
          <a href="#film" className="btn btn-ghost">▶ Watch the film</a>
        </div>
        <dl className="hero-stats">
          <div><dt>360°</dt><dd>thumb trackpad</dd></div>
          <div><dt>L + R</dt><dd>one per index finger</dd></div>
          <div><dt>Voice</dt><dd>typing by Wispr Flow</dd></div>
        </dl>
      </div>
      <div className="hero-art">
        <RingDrawing className="hero-ring" />
        <span className="hero-tag">Fig. 01 — Projecto ring, ×4 · worn as a pair, L + R</span>
      </div>
    </section>
  )
}

function Marquee() {
  const words = ['No mouse', 'No keyboard', 'Slide to point', 'Speak to type', 'Ask the AI', 'One pair']
  const row = [...words, ...words, ...words]
  return (
    <div className="marquee" aria-hidden>
      <div className="marquee-track">
        {[...row, ...row].map((w, i) => (
          <span key={i}>{w}<i /></span>
        ))}
      </div>
    </div>
  )
}

const FEATURES = [
  { n: '01', t: '360° thumb trackpad', d: 'The whole outer band is a capacitive trackpad. Slide your thumb around it and along it to move the cursor; tap to click.' },
  { n: '02', t: 'Hands at rest', d: 'No waving in the air. Your hand stays still on the desk, your lap or the armrest — only the thumb moves.' },
  { n: '03', t: 'Talk to it', d: 'Ask the built-in AI to add a reminder, a task or an automation. It syncs straight to your phone.' },
  { n: '04', t: 'Remembers for you', d: 'When someone asks you for something, the ring notes it down so nothing slips through.' },
  { n: '05', t: 'Works with everything', d: 'Your Mac or PC, your phone, your smart home, your music and your slides — one pair for all of it.' },
  { n: '06', t: 'Private by default', d: 'Memory is opt-in and stays on your ring and phone. A light shows whenever it is listening.' },
]

function Features() {
  return (
    <section className="features" id="features">
      <div className="section-head">
        <p className="eyebrow">What it does</p>
        <h2>Small enough to forget.<br />Precise enough to work.</h2>
      </div>
      <div className="feature-grid">
        {FEATURES.map((f) => (
          <article key={f.n} className="feature">
            <span className="feature-n">{f.n}</span>
            <h3>{f.t}</h3>
            <p>{f.d}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <span className="logo"><span className="logo-mark"><i /><i /></span>PROJECTO</span>
      <span>© 2026 Projecto. A concept product.</span>
      <span className="footer-links">
        <a href="#features">Features</a>
        <a href="#waitlist">Waitlist</a>
        <a href="/admin" style={{ opacity: 0.35, fontSize: '11px', marginLeft: '8px' }}>Admin</a>
      </span>
    </footer>
  )
}

export default function LandingPage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Film />
        <Scene />
        <NoKeyboard />
        <Intelligence />
        <Features />
        <Waitlist />
      </main>
      <Footer />
      <ThumbsFab />
    </>
  )
}
