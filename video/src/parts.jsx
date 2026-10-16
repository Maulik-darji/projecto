import { C, MONO, SANS } from './theme'

// Brand mark: two interlocking squares. `split` pushes them apart (0 = locked).
export function LogoMark({ size = 120, split = 0, color = C.ink, accent = C.acc, opacity = 1 }) {
  const w = size * 0.2
  return (
    <svg width={size * 1.7} height={size * 1.1} viewBox={`0 0 ${size * 1.7} ${size * 1.1}`} style={{ overflow: 'visible', opacity }}>
      <rect
        x={w / 2 + size * 0.05} y={size * 0.05 + w / 2} width={size - w} height={size - w}
        fill="none" stroke={color} strokeWidth={w}
        transform={`translate(${-split * size * 0.6} 0) rotate(${-split * 40} ${size * 0.5} ${size * 0.55})`}
      />
      <rect
        x={size * 0.65 + w / 2} y={size * 0.05 + w / 2} width={size - w} height={size - w}
        fill="none" stroke={accent} strokeWidth={w}
        transform={`translate(${split * size * 0.6} 0) rotate(${split * 40} ${size * 1.15} ${size * 0.55})`}
      />
    </svg>
  )
}

// Ring band seen from the front, drawn like the technical illustration
export function Band({ w = 190, h = 70, led = 1, touch = 0 }) {
  const ch = h * 0.17
  return (
    <svg width={w} height={h + 8} viewBox={`0 -8 ${w} ${h + 8}`} style={{ overflow: 'visible', display: 'block' }}>
      <rect x="0" y={-8} width={w} height="6" fill={C.acc} opacity={touch} />
      <rect x="2" y="2" width={w - 4} height={h - 4} fill={C.paper} stroke={C.ink} strokeWidth="4" />
      <line x1="2" y1={ch} x2={w - 2} y2={ch} stroke={C.ink} strokeWidth="1.5" />
      <line x1="2" y1={h - ch} x2={w - 2} y2={h - ch} stroke={C.ink} strokeWidth="1.5" />
      {[0.18, 0.38, 0.62, 0.82].map((k) => (
        <line key={k} x1={w * k} y1={ch} x2={w * k} y2={h - ch} stroke={C.ink} strokeWidth="1.2" />
      ))}
      <rect x={w / 2 - 7} y={h / 2 - 7} width="14" height="14" fill={C.acc} opacity={led} />
      <rect x={w / 2 - 7} y={h / 2 - 7} width="14" height="14" fill="none" stroke={C.ink} strokeWidth="1.5" />
    </svg>
  )
}

// Stylised index finger, flat colour
export function Finger({ w = 150, h = 820 }) {
  const r = w / 2
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block', overflow: 'visible' }}>
      <path d={`M0 ${h} V${r} A${r} ${r} 0 0 1 ${w} ${r} V${h} Z`} fill={C.skin} stroke={C.ink} strokeWidth="4" />
      <path d={`M${w * 0.24} ${r * 1.05} A${w * 0.26} ${w * 0.26} 0 0 1 ${w * 0.76} ${r * 1.05} V${r * 1.9} H${w * 0.24} Z`} fill={C.nail} />
      {[0.42, 0.66].map((k) => (
        <path key={k} d={`M${w * 0.3} ${h * k} H${w * 0.7}`} stroke={C.skinDark} strokeWidth="4" />
      ))}
    </svg>
  )
}

export function Thumb({ size = 120, scale = 1 }) {
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 120 138" style={{ overflow: 'visible', transform: `scale(${scale})` }}>
      <ellipse cx="60" cy="69" rx="56" ry="66" fill={C.skin} stroke={C.ink} strokeWidth="5" />
      <ellipse cx="60" cy="50" rx="30" ry="34" fill={C.nail} />
    </svg>
  )
}

export function Cursor({ size = 44, scale = 1 }) {
  return (
    <svg width={size} height={size * 1.36} viewBox="0 0 22 30" style={{ overflow: 'visible', transform: `scale(${scale})`, transformOrigin: '0 0' }}>
      <path d="M1 1 L1 24 L7 18 L11 28 L15 26 L11 17 L19 17 Z" fill={C.ink} stroke="#fff" strokeWidth="1.5" />
    </svg>
  )
}

// Speech waveform made of square bars
export function Wave({ f, bars = 28, width = 600, height = 120, active = 1, color = C.acc }) {
  const bw = width / bars
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      {Array.from({ length: bars }).map((_, i) => {
        const n = Math.abs(Math.sin(f * 0.33 + i * 1.7) * Math.cos(f * 0.19 + i * 0.83))
        const h = 8 + active * n * (height - 8)
        return <rect key={i} x={i * bw + bw * 0.2} y={(height - h) / 2} width={bw * 0.6} height={h} fill={color} />
      })}
    </svg>
  )
}

export function Glyph({ type, size = 64, color = C.ink }) {
  const s = { width: size, height: size, display: 'block', flex: 'none' }
  const st = { fill: 'none', stroke: color, strokeWidth: 3.2 }
  switch (type) {
    case 'computer':
      return <svg viewBox="0 0 48 48" style={s}><rect x="5" y="8" width="38" height="25" {...st} /><path d="M24 33 V40 M15 41 H33" {...st} /></svg>
    case 'phone':
      return <svg viewBox="0 0 48 48" style={s}><rect x="14" y="4" width="20" height="40" {...st} /><path d="M21 38 H27" {...st} /></svg>
    case 'home':
      return <svg viewBox="0 0 48 48" style={s}><path d="M6 22 L24 7 L42 22 V42 H6 Z" {...st} /><rect x="19" y="28" width="10" height="14" {...st} /></svg>
    case 'music':
      return <svg viewBox="0 0 48 48" style={s}><path d="M18 36 V10 L38 6 V31" {...st} /><rect x="10" y="32" width="9" height="8" fill={color} /><rect x="30" y="28" width="9" height="8" fill={color} /></svg>
    case 'slides':
      return <svg viewBox="0 0 48 48" style={s}><rect x="5" y="7" width="38" height="26" {...st} /><path d="M20 14 L30 20 L20 26 Z" fill={color} /><path d="M24 33 V42 M16 42 L24 36 L32 42" {...st} /></svg>
    case 'tv':
      return <svg viewBox="0 0 48 48" style={s}><rect x="4" y="10" width="40" height="26" {...st} /><path d="M14 42 H34 M18 4 L24 10 L30 4" {...st} /></svg>
    case 'mouse':
      return <svg viewBox="0 0 48 64" style={{ ...s, height: size * 1.33 }}><path d="M10 6 H38 V58 H10 Z" {...st} /><path d="M24 6 V24 M10 24 H38" {...st} /></svg>
    case 'keyboard':
      return (
        <svg viewBox="0 0 96 56" style={{ ...s, width: size * 2 }}>
          <rect x="3" y="3" width="90" height="50" {...st} />
          {Array.from({ length: 8 }).map((_, i) => <rect key={'a' + i} x={11 + i * 10} y="12" width="6" height="6" fill={color} />)}
          {Array.from({ length: 7 }).map((_, i) => <rect key={'b' + i} x={16 + i * 10} y="23" width="6" height="6" fill={color} />)}
          <rect x="24" y="36" width="48" height="6" fill={color} />
        </svg>
      )
    default:
      return null
  }
}

export function Tag({ children, dark = true, style }) {
  return (
    <span
      style={{
        display: 'inline-block', whiteSpace: 'nowrap', fontFamily: MONO, fontSize: 24, letterSpacing: '0.04em',
        padding: '6px 12px', background: dark ? C.ink : C.acc, color: dark ? C.paper : C.ink, ...style,
      }}
    >
      {children}
    </span>
  )
}

export const headline = (size = 110) => ({
  fontFamily: SANS, fontWeight: 700, fontSize: size, letterSpacing: '-0.045em', lineHeight: 0.95, color: C.ink, margin: 0,
})
