import { createContext, useContext } from 'react'
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame } from 'remotion'
import { C, CL, MONO, SANS, lerp, pathAt, prog } from './theme'
import { Band, Cursor, Finger, Glyph, LogoMark, Tag, Thumb, Wave, headline } from './parts'

const FPS = 30

// Scenes start drawing during the wipe, a few frames before their voice line.
// Their own clock is offset so frame 0 is when the line starts.
export const Offset = createContext(0)
const useF = () => useCurrentFrame() - useContext(Offset)
const abs = (x, y, extra) => ({ position: 'absolute', left: x, top: y, ...extra })

// Masked line that rises into place
function Line({ f, at = 0, children, style }) {
  const p = prog(f, at, at + 14)
  return (
    <div style={{ overflow: 'hidden', paddingBottom: '0.2em', marginBottom: '-0.1em' }}>
      <div style={{ transform: `translateY(${(1 - p) * 110}%)`, ...style }}>{children}</div>
    </div>
  )
}

const pop = (f, at, damping = 13) => spring({ frame: f - at, fps: FPS, config: { damping, stiffness: 140 } })

/* 1 · Meet Projecto ------------------------------------------------------ */
export function Intro() {
  const f = useF()
  const join = pop(f, 0, 15)
  const letters = 'PROJECTO'.split('')
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', transform: `scale(${1 + f * 0.0006})` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 56 }}>
        <LogoMark size={150} split={(1 - join) * 2.4} color={C.paper} opacity={Math.min(1, join * 3)} />
        <div style={{ display: 'flex', overflow: 'hidden', fontFamily: SANS, fontWeight: 800, fontSize: 210, letterSpacing: '-0.045em', lineHeight: 1, color: C.paper }}>
          {letters.map((l, i) => {
            const p = prog(f, 6 + i * 2.2, 20 + i * 2.2)
            return <span key={i} style={{ display: 'inline-block', transform: `translateY(${(1 - p) * 110}%)` }}>{l}</span>
          })}
        </div>
      </div>
      <div style={{ ...abs(0, 700), width: '100%', textAlign: 'center', fontFamily: MONO, fontSize: 28, letterSpacing: '0.2em', color: '#A9A59C', opacity: prog(f, 30, 44) }}>
        TWO RINGS · ONE CURSOR · NO KEYBOARD
      </div>
    </AbsoluteFill>
  )
}

/* 2 · Two smart rings ---------------------------------------------------- */
export function Rings({ v }) {
  const f = useF()
  const fingers = [
    { x: 1080, ring: 12, tag: 'L', side: -1 },
    { x: 1400, ring: 20, tag: 'R', side: 1 },
  ]
  const float = Math.sin(f / 16) * 6
  return (
    <AbsoluteFill>
      <div style={abs(130, 300)}>
        <Line f={f} at={2} style={headline(130)}>Two smart rings.</Line>
        <Line f={f} at={Math.round(v * 0.42)} style={{ ...headline(72), color: C.muted, marginTop: 24 }}>One on each index finger.</Line>
      </div>
      {fingers.map((g, i) => {
        const rise = pop(f, i * 4, 18)
        const drop = pop(f, g.ring, 11)
        const tagOn = prog(f, g.ring + 16, g.ring + 28)
        const ringY = 640
        return (
          <div key={g.tag} style={abs(g.x, 0, { width: 150, height: 1080, transform: `translateY(${float * (i ? -1 : 1)}px)` })}>
            <div style={abs(0, 330, { transform: `translateY(${(1 - rise) * 760}px)` })}>
              <Finger w={150} h={820} />
            </div>
            <div style={abs(-20, ringY, { transform: `translateY(${(1 - drop) * -900}px)` })}>
              <Band w={190} h={70} led={tagOn} />
            </div>
            <div style={abs(g.side < 0 ? -190 : 210, ringY - 70, { opacity: tagOn, display: 'flex', alignItems: 'center', gap: 10 })}>
              {g.side > 0 && <span style={{ width: 60 * tagOn, height: 2, background: C.ink, display: 'block' }} />}
              <Tag>{g.tag} · INDEX</Tag>
              {g.side < 0 && <span style={{ width: 60 * tagOn, height: 2, background: C.ink, display: 'block' }} />}
            </div>
          </div>
        )
      })}
    </AbsoluteFill>
  )
}

/* 3 · Slide to point, tap to click -------------------------------------- */
const CURSOR_PATH = [[0.5, 0.5], [0.2, 0.3], [0.78, 0.24], [0.84, 0.72], [0.3, 0.76], [0.5, 0.7]]

export function Cursor_({ d, v }) {
  const f = useF()
  const tap = Math.round(v * 0.74) + 4
  const t = (fr) => interpolate(fr, [6, tap - 14], [0, 1], CL)
  const [nx, ny] = pathAt(CURSOR_PATH, t(f))

  const panel = { x: 120, y: 430, w: 700, h: 300 }
  const screen = { x: 978, y: 238, w: 804, h: 504 }
  const thumbX = panel.x + 70 + nx * (panel.w - 140)
  const thumbY = panel.y + 40 + ny * (panel.h - 80)
  const cx = screen.x + nx * screen.w
  const cy = screen.y + ny * screen.h

  const press = interpolate(f, [tap - 6, tap, tap + 7], [0, 1, 0], CL)
  const ripple = interpolate(f, [tap, tap + 18], [0, 1], CL)
  const clicked = f >= tap

  const trail = []
  for (let k = 0; k <= 26; k++) {
    const [tx, ty] = pathAt(CURSOR_PATH, t(f - k * 1.6))
    trail.push(`${screen.x + tx * screen.w},${screen.y + ty * screen.h}`)
  }

  const tiles = []
  for (let r = 0; r < 2; r++)
    for (let c = 0; c < 3; c++) tiles.push({ c, r, x: screen.x + 72 + c * 230, y: screen.y + 92 + r * 190 })

  return (
    <AbsoluteFill>
      <div style={abs(120, 110)}>
        <Line f={f} at={0} style={headline(96)}>Slide to point.</Line>
        <Line f={f} at={tap - 16} style={{ ...headline(96), color: C.acc }}>Tap to click.</Line>
      </div>

      {/* ring surface, unrolled */}
      <div style={abs(panel.x, panel.y - 50, { fontFamily: MONO, fontSize: 22, color: C.muted, letterSpacing: '0.05em' })}>R RING · TOUCH SURFACE</div>
      <svg style={abs(panel.x, panel.y)} width={panel.w} height={panel.h}>
        <rect x="2" y="2" width={panel.w - 4} height={panel.h - 4} fill={C.paper} stroke={C.ink} strokeWidth="4" />
        <line x1="2" y1="26" x2={panel.w - 2} y2="26" stroke={C.ink} strokeWidth="1.5" />
        <line x1="2" y1={panel.h - 26} x2={panel.w - 2} y2={panel.h - 26} stroke={C.ink} strokeWidth="1.5" />
        {Array.from({ length: 13 }).map((_, i) => (
          <line key={i} x1={(i + 1) * 50} y1="26" x2={(i + 1) * 50} y2={panel.h - 26} stroke={C.ink} strokeOpacity="0.12" strokeWidth="1.5" />
        ))}
      </svg>
      <div style={abs(thumbX - 54, thumbY - 62)}><Thumb size={108} scale={1 - press * 0.16} /></div>
      {ripple > 0 && ripple < 1 && (
        <div style={abs(thumbX, thumbY, { width: 60, height: 60, marginLeft: -30, marginTop: -30, border: `5px solid ${C.acc}`, transform: `scale(${1 + ripple * 2.6})`, opacity: 1 - ripple })} />
      )}

      {/* link between ring and screen */}
      <svg style={abs(830, 570)} width="140" height="20">
        <line x1="0" y1="10" x2="140" y2="10" stroke={C.ink} strokeWidth="3" strokeDasharray="10 8" strokeDashoffset={-f * 2} />
      </svg>

      {/* screen */}
      <div style={abs(960, 220, { width: 840, height: 540, background: C.ink })} />
      <div style={abs(screen.x, screen.y, { width: screen.w, height: screen.h, background: C.paper, overflow: 'hidden' })} />
      {tiles.map((tl, i) => {
        const target = tl.c === 1 && tl.r === 1
        const on = target && clicked
        return (
          <div key={i} style={abs(tl.x, tl.y, {
            width: 200, height: 140, border: `3px solid ${C.ink}`,
            background: on ? C.acc : i % 2 ? C.soft : C.bg,
            display: 'grid', placeItems: 'center',
            transform: on ? `scale(${1 + 0.06 * Math.sin(Math.min(1, (f - tap) / 10) * Math.PI)})` : 'none',
          })}>
            {on && <svg width="60" height="60" viewBox="0 0 24 24"><path d="M4 12 L10 18 L20 6" fill="none" stroke={C.ink} strokeWidth="3.4" /></svg>}
          </div>
        )
      })}
      <svg style={abs(0, 0)} width="1920" height="1080">
        <polyline points={trail.join(' ')} fill="none" stroke={C.acc} strokeWidth="5" opacity={clicked ? Math.max(0, 1 - (f - tap) / 10) : 0.85} />
      </svg>
      {ripple > 0 && ripple < 1 && (
        <div style={abs(cx, cy, { width: 50, height: 50, marginLeft: -25, marginTop: -25, border: `5px solid ${C.acc}`, transform: `scale(${1 + ripple * 2.4})`, opacity: 1 - ripple })} />
      )}
      <div style={abs(cx, cy)}><Cursor size={46} scale={1 - press * 0.15} /></div>
      <div style={abs(1330, 760, { width: 140, height: 70, background: '#2a2a2a' })} />
      <div style={abs(1230, 830, { width: 340, height: 16, background: C.ink })} />
    </AbsoluteFill>
  )
}

/* 4 · Wispr Flow types for you ------------------------------------------- */
const DICTATED = 'Running ten minutes late — start without me.'

export function Flow({ v }) {
  const f = useF()
  const speaking = f < v
  const n = Math.floor(interpolate(f, [8, v], [0, DICTATED.length], CL))
  const strike = prog(f, 26, 40)
  return (
    <AbsoluteFill>
      <div style={abs(120, 130)}>
        <Line f={f} at={0} style={headline(120)}>Speak to type.</Line>
        <div style={{ marginTop: 26, opacity: prog(f, 8, 20) }}>
          <Tag dark={false}>TYPING POWERED BY WISPR FLOW</Tag>
        </div>
      </div>

      <div style={abs(130, 520, { opacity: prog(f, 4, 14) })}><Band w={250} h={88} led={1} touch={speaking ? 1 : 0} /></div>
      <div style={abs(130, 650, { fontFamily: MONO, fontSize: 22, color: C.muted, opacity: prog(f, 6, 16) })}>HOLD THUMB ON RING · SPEAK</div>
      <div style={abs(420, 515)}><Wave f={f} bars={22} width={420} height={110} active={speaking ? 1 : 0.05} /></div>

      {/* message being written */}
      <div style={abs(960, 300, {
        width: 840, height: 420, background: C.paper, border: `4px solid ${C.ink}`,
        transform: `translateY(${(1 - pop(f, 2, 18)) * 60}px)`, opacity: prog(f, 2, 10),
      })}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '18px 26px', borderBottom: `3px solid ${C.ink}`, fontFamily: SANS, fontWeight: 600, fontSize: 30 }}>
          <span>New message</span>
          <span style={{ fontFamily: MONO, fontWeight: 400, fontSize: 24, color: C.muted }}>To: Sam</span>
        </div>
        <div style={{ padding: '30px 26px', fontFamily: SANS, fontWeight: 500, fontSize: 60, letterSpacing: '-0.03em', lineHeight: 1.18, color: C.ink }}>
          {DICTATED.slice(0, n)}
          <span style={{ display: 'inline-block', width: 6, height: 58, background: C.acc, marginLeft: 4, verticalAlign: '-8px', opacity: Math.floor(f / 8) % 2 ? 1 : 0.2 }} />
        </div>
      </div>

      {/* no keyboard */}
      <div style={abs(1530, 770, { opacity: prog(f, 18, 28), display: 'flex', alignItems: 'center', gap: 18 })}>
        <div style={{ position: 'relative' }}>
          <Glyph type="keyboard" size={70} />
          <svg style={abs(-10, -10)} width="160" height="76"><line x1="0" y1="76" x2={160 * strike} y2={76 - 76 * strike} stroke={C.acc} strokeWidth="7" /></svg>
        </div>
      </div>
    </AbsoluteFill>
  )
}

/* 5 · Ask the AI --------------------------------------------------------- */
const ASK = '“Remind me to call Mom at 7, add renew passport, and text Sam when I leave the office.”'
const RESULTS = [
  ['REMINDER', 'Call Mom', 'Today · 19:00'],
  ['TASK', 'Renew passport', 'Added to your list'],
  ['AUTOMATION', 'Leave office → text Sam', 'Runs on location'],
]

export function Voice({ d }) {
  const f = useF()
  const typeEnd = d * 0.46
  const n = Math.floor(interpolate(f, [4, typeEnd], [0, ASK.length], CL))
  return (
    <AbsoluteFill>
      <div style={abs(120, 120)}>
        <Line f={f} at={0} style={headline(120)}>Just ask.</Line>
      </div>
      <div style={abs(120, 330, { width: 840 })}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: prog(f, 2, 10) }}>
          <Tag>YOU</Tag>
          <span style={{ fontFamily: MONO, fontSize: 22, color: C.muted }}>to Projecto AI</span>
        </div>
        <p style={{ fontFamily: SANS, fontWeight: 500, fontSize: 54, letterSpacing: '-0.03em', lineHeight: 1.2, margin: '26px 0 0', color: C.ink }}>
          {ASK.slice(0, n)}
        </p>
        <div style={{ marginTop: 30 }}>
          <Wave f={f} bars={30} width={520} height={70} active={f < typeEnd ? 1 : 0.05} />
        </div>
      </div>
      {RESULTS.map(([tag, title, meta], i) => {
        const at = Math.round(d * 0.4 + i * 11)
        const s = pop(f, at, 16)
        return (
          <div key={tag} style={abs(1060, 250 + i * 200, {
            width: 740, height: 168, background: C.paper, border: `4px solid ${C.ink}`,
            display: 'flex', transform: `translateX(${(1 - s) * 900}px)`,
          })}>
            <div style={{ width: 18, background: C.acc, flex: 'none' }} />
            <div style={{ padding: '22px 28px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontFamily: MONO, fontSize: 22, color: C.acc, letterSpacing: '0.06em' }}>{tag}</span>
              <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 46, letterSpacing: '-0.03em' }}>{title}</span>
              <span style={{ fontFamily: MONO, fontSize: 22, color: C.muted }}>{meta}</span>
            </div>
          </div>
        )
      })}
    </AbsoluteFill>
  )
}

/* 6 · It remembers ------------------------------------------------------- */
const HEARD = '“Can you send me the invoice by Friday?”'

export function Memory({ d }) {
  const f = useF()
  const n = Math.floor(interpolate(f, [6, d * 0.42], [0, HEARD.length], CL))
  const link = prog(f, d * 0.44, d * 0.58)
  const land = pop(f, d * 0.56, 14)
  const flash = interpolate(f, [d * 0.56, d * 0.8], [1, 0], CL)
  return (
    <AbsoluteFill>
      <div style={abs(120, 110)}>
        <Line f={f} at={0} style={headline(110)}>It remembers for you.</Line>
      </div>

      <div style={abs(120, 330, { width: 900, height: 330, background: C.paper, border: `4px solid ${C.ink}`, padding: 34, opacity: prog(f, 2, 10) })}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Tag>HEARD</Tag>
          <span style={{ fontFamily: MONO, fontSize: 24, color: C.muted }}>Alex · 14:10</span>
        </div>
        <p style={{ fontFamily: SANS, fontWeight: 600, fontSize: 60, letterSpacing: '-0.03em', lineHeight: 1.15, margin: '26px 0 0' }}>{HEARD.slice(0, n)}</p>
        <div style={abs(34, 270, { display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontSize: 22, color: C.acc })}>
          <span style={{ width: 14, height: 14, background: C.acc, opacity: Math.floor(f / 7) % 2 ? 1 : 0.25 }} />
          MEMORY ON
        </div>
      </div>

      <svg style={abs(1024, 480)} width="300" height="20">
        <line x1="0" y1="10" x2={300 * link} y2="10" stroke={C.ink} strokeWidth="3" strokeDasharray="10 8" />
        {link > 0.98 && <rect x="286" y="2" width="16" height="16" fill={C.acc} />}
      </svg>

      {/* phone */}
      <div style={abs(1330, 150, { width: 420, height: 740, background: C.ink, padding: 16 })}>
        <div style={{ width: '100%', height: '100%', background: C.bg, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '30px 26px 18px', borderBottom: `3px solid ${C.ink}` }}>
            <div style={{ fontFamily: MONO, fontSize: 20, color: C.muted }}>Fri 16 Oct</div>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 52, letterSpacing: '-0.03em' }}>Today</div>
          </div>
          <div style={{ overflow: 'hidden', height: 112 * land }}>
            <div style={{ display: 'flex', gap: 16, padding: '22px 26px', borderBottom: `3px solid ${C.ink}`, background: `rgba(255,79,0,${flash * 0.9})`, transform: `translateY(${(1 - land) * -100}%)` }}>
              <span style={{ width: 30, height: 30, border: `3px solid ${C.ink}`, flex: 'none', marginTop: 4, background: C.paper }} />
              <div>
                <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30 }}>Send invoice to Alex</div>
                <div style={{ fontFamily: MONO, fontSize: 18, color: C.ink, opacity: 0.7, marginTop: 4 }}>Heard from Alex · due Fri</div>
              </div>
            </div>
          </div>
          {['Design review · 09:30', 'Launch deck · 11:00', 'Lunch with Sam · 13:00', 'Gym · 16:30'].map((x) => (
            <div key={x} style={{ display: 'flex', gap: 16, padding: '22px 26px', borderBottom: `2px solid ${C.line}`, fontFamily: SANS, fontSize: 26, color: C.muted }}>
              <span style={{ width: 26, height: 26, border: `3px solid ${C.line}`, flex: 'none' }} />
              {x}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  )
}

/* 7 · No mouse. No keyboard. One pair controls everything. ------------- */
const TARGETS = [
  ['computer', 'Computer', 210],
  ['phone', 'Phone', 270],
  ['home', 'Home', 330],
  ['music', 'Music', 30],
  ['slides', 'Slides', 90],
  ['tv', 'TV', 150],
]

export function Everything({ d, v }) {
  const f = useF()
  const outOld = prog(f, v * 0.36, v * 0.46)
  const netIn = prog(f, v * 0.42, v * 0.52)
  const strikeM = prog(f, v * 0.06, v * 0.15)
  const strikeK = prog(f, v * 0.2, v * 0.29)
  const center = [960, 610]
  return (
    <AbsoluteFill>
      {/* phase A: retire the mouse and keyboard */}
      <div style={abs(0, 110, { width: '100%', textAlign: 'center', opacity: 1 - outOld })}>
        <div style={{ ...headline(120), display: 'inline-flex', gap: 40 }}>
          <span style={{ opacity: prog(f, 0, 8) }}>No mouse.</span>
          <span style={{ opacity: prog(f, v * 0.18, v * 0.24) }}>No keyboard.</span>
        </div>
      </div>
      <div style={abs(0, 0, { width: 1920, height: 1080, opacity: 1 - outOld, transform: `scale(${1 - outOld * 0.2})`, transformOrigin: '960px 600px' })}>
        <div style={abs(560, 420)}>
          <Glyph type="mouse" size={180} />
          <svg style={abs(-30, -20)} width="240" height="280"><line x1="0" y1="280" x2={240 * strikeM} y2={280 - 280 * strikeM} stroke={C.acc} strokeWidth="14" /></svg>
        </div>
        <div style={abs(880, 460)}>
          <Glyph type="keyboard" size={240} />
          <svg style={abs(-20, -30)} width="520" height="340"><line x1="0" y1="340" x2={520 * strikeK} y2={340 - 340 * strikeK} stroke={C.acc} strokeWidth="14" /></svg>
        </div>
      </div>

      {/* phase B: one pair controls everything */}
      <div style={abs(0, 100, { width: '100%', textAlign: 'center', opacity: netIn })}>
        <div style={headline(100)}>One pair controls <span style={{ color: C.acc }}>everything.</span></div>
      </div>
      <svg style={abs(0, 0, { opacity: netIn })} width="1920" height="1080">
        {TARGETS.map(([id, , deg], i) => {
          const a = (deg * Math.PI) / 180
          const x = center[0] + Math.cos(a) * 640
          const y = center[1] + Math.sin(a) * 220
          const p = prog(f, v * 0.48 + i * 3, v * 0.48 + i * 3 + 10)
          return <line key={id} x1={center[0]} y1={center[1]} x2={lerp(center[0], x, p)} y2={lerp(center[1], y, p)} stroke={C.ink} strokeWidth="3" strokeDasharray="10 8" />
        })}
      </svg>
      <div style={abs(center[0] - 136, center[1] - 66, { opacity: netIn, transform: `scale(${0.6 + 0.4 * pop(f, v * 0.42, 12)})` })}>
        <div style={{ background: C.bg, padding: 10 }}><LogoMark size={110} /></div>
      </div>
      {TARGETS.map(([id, label, deg], i) => {
        const a = (deg * Math.PI) / 180
        const x = center[0] + Math.cos(a) * 640
        const y = center[1] + Math.sin(a) * 220
        const s = pop(f, v * 0.52 + i * 3, 13)
        const lit = f > v * 0.6 + i * 3
        return (
          <div key={id} style={abs(x - 150, y - 62, {
            width: 300, height: 124, display: 'flex', alignItems: 'center', gap: 18, padding: '0 22px',
            background: lit ? C.ink : C.paper, color: lit ? C.paper : C.ink, border: `4px solid ${C.ink}`,
            transform: `scale(${s})`, opacity: netIn,
          })}>
            <Glyph type={id} size={56} color={lit ? C.acc : C.ink} />
            <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 36, letterSpacing: '-0.02em' }}>{label}</span>
          </div>
        )
      })}
    </AbsoluteFill>
  )
}

/* 8 · Outro ------------------------------------------------------------- */
export function Outro({ d }) {
  const f = useF()
  const s = pop(f, 0, 16)
  const chip = pop(f, d * 0.3, 12)
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 50, transform: `scale(${0.9 + 0.1 * s})`, opacity: s }}>
        <LogoMark size={140} color={C.paper} />
        <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 190, letterSpacing: '-0.045em', color: C.paper, lineHeight: 1 }}>PROJECTO</span>
      </div>
      <div style={{ marginTop: 36, fontFamily: SANS, fontWeight: 500, fontSize: 46, color: '#A9A59C', letterSpacing: '-0.02em', opacity: prog(f, 10, 22) }}>
        No mouse. No keyboard. Just two rings.
      </div>
      <div style={{
        marginTop: 64, display: 'flex', alignItems: 'center', gap: 18,
        background: C.acc, color: C.ink, padding: '22px 36px',
        fontFamily: SANS, fontWeight: 700, fontSize: 48, letterSpacing: '-0.02em',
        transform: `translateY(${(1 - chip) * 40}px)`, opacity: Math.min(1, chip * 2),
      }}>
        <svg width="38" height="34" viewBox="0 0 38 34"><path d="M19 2 L36 32 H2 Z" fill={C.ink} /></svg>
        Now on Product Hunt
      </div>
      <div style={{ position: 'absolute', bottom: 56, fontFamily: MONO, fontSize: 20, color: '#77736B', letterSpacing: '0.06em', opacity: prog(f, d * 0.45, d * 0.6) }}>
        TYPING POWERED BY WISPR FLOW · CONCEPT PRODUCT
      </div>
    </AbsoluteFill>
  )
}

export const SCENES = {
  intro: { C: Intro, dark: true },
  rings: { C: Rings },
  cursor: { C: Cursor_ },
  flow: { C: Flow },
  voice: { C: Voice },
  memory: { C: Memory },
  everything: { C: Everything },
  outro: { C: Outro, dark: true },
}

