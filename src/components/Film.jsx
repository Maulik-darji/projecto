import { useEffect, useRef, useState } from 'react'

// The 30-second launch film. Plays muted while on screen (captions are burned in),
// pauses when scrolled away; one tap turns the sound on and restarts it.
export default function Film() {
  const ref = useRef(null)
  const [muted, setMuted] = useState(true)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {})
        else v.pause()
      },
      { threshold: 0.45 }
    )
    io.observe(v)
    return () => io.disconnect()
  }, [])

  const sound = () => {
    const v = ref.current
    if (!v) return
    if (muted) {
      v.muted = false
      v.currentTime = 0
      v.play().catch(() => {})
      setMuted(false)
    } else {
      v.muted = true
      setMuted(true)
    }
  }

  return (
    <section className="film" id="film">
      <div className="film-head">
        <p className="eyebrow">The film · 30 seconds</p>
        <h2>See it in thirty seconds.</h2>
      </div>
      <div className="film-frame">
        <video
          ref={ref}
          src="/projecto-film.mp4"
          poster="/projecto-film-poster.jpg"
          muted
          loop
          playsInline
          preload="metadata"
          controls={!muted}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          aria-label="Projecto launch film: two smart rings replace your mouse and keyboard"
        />
        {muted && (
          <button className="film-sound" onClick={sound}>
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
              <path d="M3 9 H7 L12 4 V20 L7 15 H3 Z" fill="currentColor" />
              <path d="M16 8 Q19 12 16 16 M18.5 5.5 Q23 12 18.5 18.5" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
            {playing ? 'Play with sound' : 'Watch with sound'}
          </button>
        )}
      </div>
      <div className="film-meta">
        <span>Voice: Kokoro · Typing powered by Wispr Flow</span>
        <a href="/projecto-film.mp4" download>Download the film (MP4)</a>
      </div>
    </section>
  )
}
