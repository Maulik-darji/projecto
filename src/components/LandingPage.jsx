import Scene from './Scene'
import RingDrawing from './RingDrawing'
import Intelligence from './Intelligence'
import Waitlist, { ThumbsFab } from './Waitlist'

function Nav() {
  return (
    <header className="nav">
      <a href="#top" className="logo">
        <span className="logo-mark"><i /><i /></span>PROJECTO
      </a>
      <nav className="nav-links">
        <a href="#demo">How it works</a>
        <a href="#intelligence">Intelligence</a>
        <a href="#features">Features</a>
        <a href="#specs">Specs</a>
      </nav>
      <a href="#waitlist" className="btn btn-sm">Join waitlist</a>
    </header>
  )
}

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-copy">
        <p className="eyebrow">Wearable input · Series 01</p>
        <h1>
          Two rings.<br />One cursor.
        </h1>
        <p className="lede">
          Projecto is a set of two titanium rings — one on each index finger. The outer band is a
          360° trackpad: slide your thumb on it to move the cursor, tap to click, slide the other ring to scroll.
          Its built-in AI listens when you ask, remembers what people tell you, and runs your reminders,
          tasks and automations — one pair to control everything.
        </p>
        <div className="hero-cta">
          <a href="#waitlist" className="btn">Join the waitlist</a>
          <a href="#demo" className="btn btn-ghost">See it move ↓</a>
        </div>
        <dl className="hero-stats">
          <div><dt>3.1 g</dt><dd>per ring</dd></div>
          <div><dt>360°</dt><dd>thumb trackpad</dd></div>
          <div><dt>7 days</dt><dd>battery</dd></div>
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
  const words = ['Slide to point', 'Tap to click', 'Talk to it', 'It remembers', 'Automate anything']
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
  { n: '03', t: '7-day battery', d: 'Drop both rings into the square charging dock. Ten minutes gives a full day.' },
  { n: '04', t: 'Bluetooth LE 5.4', d: 'Shows up as a standard mouse and trackpad. No drivers on macOS, Windows, Linux or iPadOS.' },
  { n: '05', t: 'Grade 5 titanium', d: '2.4 mm wide, 3.1 g, water resistant to 50 m. Wear them all day and forget they are there.' },
  { n: '06', t: 'Smart, on-device AI', d: 'Syncs tasks, notes and calendar from your phone. Nudges you before things are due and captures voice notes.' },
]

function Features() {
  return (
    <section className="features" id="features">
      <div className="section-head">
        <p className="eyebrow">What is inside</p>
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

const SPECS = [
  ['Material', 'Grade 5 titanium, ceramic inner coat'],
  ['Weight', '3.1 g per ring'],
  ['Width', '2.4 mm'],
  ['Sizes', 'US 5 – 13, half sizes included'],
  ['Sensors', '360° capacitive trackpad band, haptic engine'],
  ['Latency', '< 8 ms, thumb to cursor'],
  ['Connectivity', 'Bluetooth LE 5.4, HID mouse + trackpad'],
  ['Intelligence', 'On-ring AI chip · syncs with the Projecto app on iOS and Android'],
  ['Microphone', 'Beam-forming mic · voice commands and opt-in conversation memory'],
  ['Battery', 'Up to 7 days · full charge in 45 min'],
  ['Water', '5 ATM'],
]

function Specs() {
  return (
    <section className="specs" id="specs">
      <div className="section-head">
        <p className="eyebrow">Tech specs</p>
        <h2>The numbers.</h2>
      </div>
      <dl className="spec-table">
        {SPECS.map(([k, v]) => (
          <div key={k} className="spec-row">
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
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
        <a href="#specs">Specs</a>
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
        <Scene />
        <Intelligence />
        <Features />
        <Specs />
        <Waitlist />
      </main>
      <Footer />
      <ThumbsFab />
    </>
  )
}
