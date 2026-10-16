import { useEffect, useRef, useState } from 'react'
import Hands3D from './Hands3D'
import Monitor from './Monitor'
import { lerp, range, smooth, pathAt } from '../lib/anim'

const STEPS = [
  { k: '01', t: 'Wake', d: 'One ring on each index finger. Tap a ring with your thumb and both wake and pair in under a second.' },
  { k: '02', t: 'Point', d: 'Your hand stays still. Slide your right thumb around and along the ring — its 360° touch surface is a trackpad that moves the cursor.' },
  { k: '03', t: 'Tap', d: 'Lift and tap the right ring with your thumb to click. Double-tap to open.' },
  { k: '04', t: 'Scroll', d: 'Slide your left thumb along the left ring. The window scrolls, the cursor stays put.' },
  { k: '05', t: 'Zoom', d: 'Slide both thumbs forward on both rings at once to zoom in.' },
]
const BOUNDS = [0, 0.14, 0.42, 0.6, 0.8, 1]
const PATH = [[50, 50], [26, 36], [62, 30], [44, 62], [91, 16]]
const STROKES = 3

function compute(p) {
  const wake = smooth(0.02, 0.12, p)
  const wakeTap = smooth(0.04, 0.07, p) * (1 - smooth(0.08, 0.11, p))

  let [cx, cy] = pathAt(PATH, range(0.15, 0.4, p))

  // tap: thumb lifts off the ring, then presses down
  const lift = smooth(0.43, 0.46, p) * (1 - smooth(0.47, 0.49, p))
  const tap = smooth(0.47, 0.49, p) * (1 - smooth(0.52, 0.55, p))
  const ripple = range(0.48, 0.54, p)
  const win = smooth(0.5, 0.58, p)

  // after the click, the thumb glides the cursor into the opened window
  const intoWin = smooth(0.55, 0.6, p)
  cx = lerp(cx, 58, intoWin)
  cy = lerp(cy, 56, intoWin)

  // right thumb rests on the ring from Point until the cursor is in the window
  const pointOn = smooth(0.12, 0.15, p) * (1 - smooth(0.6, 0.63, p))

  // left thumb: three strokes along the ring, lifting to return between them
  const scrollOn = smooth(0.6, 0.63, p) * (1 - smooth(0.79, 0.82, p))
  const local = range(0.63, 0.79, p)
  const n = Math.min(STROKES - 1, Math.floor(local * STROKES))
  const st = local * STROKES - n
  const press = Math.min(st / 0.75, 1)
  const slideL = st < 0.75 ? lerp(1, -1, press) : lerp(-1, 1, (st - 0.75) / 0.25)
  const contactL = st < 0.75 ? 1 : 0.6
  const scroll = (n + press) / STROKES

  const bothOn = smooth(0.8, 0.83, p)
  const zoom = smooth(0.83, 0.97, p)
  const hud = smooth(0.8, 0.83, p)

  let phase = BOUNDS.findIndex((b, i) => p >= b && p < (BOUNDS[i + 1] ?? 2))
  if (phase > 4) phase = 4

  const led = smooth(0.06, 0.1, p)
  const rest = { index: 0.06, middle: 0.22, ring: 0.32, pinky: 0.38 }
  const rise = (1 - wake) * 420

  return {
    p, phase, wake, cx, cy, tap, ripple, win, hud, zoom,
    scroll: local > 0 ? scroll : 0,
    phaseName: STEPS[phase].t.toUpperCase(),
    // The hands stay put: the thumb's position on the ring is the trackpad input.
    right: {
      x: 0,
      y: rise,
      rot: 0,
      curls: rest,
      thumb: Math.max(wakeTap, pointOn * (1 - 0.45 * lift), bothOn),
      slide: lerp(((cy - 50) / 50) * 0.9 * pointOn, lerp(-1, 1, zoom), bothOn),
      orbit: ((cx - 50) / 50) * 0.75 * pointOn,
      led,
      flash: tap,
    },
    left: {
      x: 0,
      y: rise,
      rot: 0,
      curls: rest,
      thumb: Math.max(wakeTap, scrollOn * contactL, bothOn),
      slide: lerp(slideL * scrollOn, lerp(-1, 1, zoom), bothOn),
      orbit: 0,
      led,
      flash: 0,
    },
  }
}

export default function Scene() {
  const ref = useRef(null)
  const [p, setP] = useState(0)

  useEffect(() => {
    let target = 0
    let cur = 0
    let raf
    const read = () => {
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const total = r.height - window.innerHeight
      target = Math.min(1, Math.max(0, -r.top / total))
    }
    const tick = () => {
      cur += (target - cur) * 0.12
      if (Math.abs(target - cur) < 0.0002) cur = target
      setP(cur)
      raf = requestAnimationFrame(tick)
    }
    read()
    window.addEventListener('scroll', read, { passive: true })
    window.addEventListener('resize', read)
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', read)
      window.removeEventListener('resize', read)
    }
  }, [])

  const s = compute(p)
  const { left: L, right: R } = s

  return (
    <section className="scene" ref={ref} id="demo">
      <div className="scene-sticky">
        <aside className="scene-copy">
          <p className="eyebrow">Live demo — keep scrolling</p>
          <ol className="steps">
            {STEPS.map((st, i) => {
              const local = range(BOUNDS[i], BOUNDS[i + 1], p)
              return (
                <li key={st.k} className={i === s.phase ? 'is-active' : i < s.phase ? 'is-done' : ''}>
                  <div className="step-head">
                    <span className="step-k">{st.k}</span>
                    <span className="step-t">{st.t}</span>
                  </div>
                  <p className="step-d">{st.d}</p>
                  <div className="step-bar"><i style={{ width: local * 100 + '%' }} /></div>
                </li>
              )
            })}
          </ol>
        </aside>

        <div className="stage">
          <Monitor s={s} />
          <Hands3D L={L} R={R} />
          <div className="readout">
            <span>CURSOR {s.cx.toFixed(0)}, {s.cy.toFixed(0)}</span>
            <span>THUMB {R.orbit.toFixed(2)}, {R.slide.toFixed(2)}</span>
            <span>SCROLL {Math.round(s.scroll * 100)}</span>
            <span>ZOOM {Math.round(100 + s.zoom * 80)}%</span>
          </div>
        </div>
      </div>
    </section>
  )
}
