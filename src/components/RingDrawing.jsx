// Technical line drawing of a Projecto ring: tilted band, inner sensors, callouts.
const INK = '#111111'
const PAPER = '#F7F5F0'
const ACC = '#FF4F00'

const TILT = (-14 * Math.PI) / 180
const C = [270, 200]
const OUT = [200, 84] // outer rim radii
const INN = [172, 68] // inner rim radii
const H = 74 // band height
const DEPTH = 52 // how far down the inner wall is visible

function pt(t, [rx, ry], dy = 0) {
  const x = rx * Math.cos(t)
  const y = ry * Math.sin(t) + dy
  return [C[0] + x * Math.cos(TILT) - y * Math.sin(TILT), C[1] + x * Math.sin(TILT) + y * Math.cos(TILT)]
}
function arc(t0, t1, r, dy = 0, steps = 64) {
  const pts = []
  for (let i = 0; i <= steps; i++) pts.push(pt(t0 + ((t1 - t0) * i) / steps, r, dy))
  return pts
}
const d = (pts, close) => 'M' + pts.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L') + (close ? ' Z' : '')
const PI = Math.PI

// Inner-wall components: [angle, kind]
const PARTS = [
  [PI * 1.22, 'disc'], [PI * 1.33, 'pad'], [PI * 1.42, 'pad'], [PI * 1.5, 'chip'],
  [PI * 1.58, 'pad'], [PI * 1.66, 'pad'], [PI * 1.78, 'disc'], [PI * 1.9, 'pad'],
]

export default function RingDrawing({ callouts = true, className }) {
  // silhouette: front half of the bottom rim + back half of the top rim
  const outline = [...arc(0, PI, OUT, H), ...arc(PI, 2 * PI, OUT)]
  const inner = arc(0, 2 * PI, INN)
  const segs = [0.3, 0.7, 1.1, 1.5, 1.9, 2.3, 2.75]

  const chip = pt(PI * 1.5, INN, 26)
  const discL = pt(PI * 1.22, INN, 26)
  const band = pt(PI * 0.62, OUT, H * 0.5)
  const rim = pt(PI * 0.05, OUT, 0)

  return (
    <svg viewBox="0 0 560 420" className={className} aria-label="Projecto ring, technical drawing">
      <defs>
        <clipPath id="ring-opening"><path d={d(inner, true)} /></clipPath>
      </defs>

      <path d={d(outline, true)} fill={PAPER} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      {/* chamfers on the top rim */}
      <path d={d(arc(0, 2 * PI, OUT), true)} fill="none" stroke={INK} strokeWidth="1.5" />
      <path d={d(arc(0, 2 * PI, [OUT[0] - 9, OUT[1] - 5]), true)} fill="none" stroke={INK} strokeWidth="1" />
      {/* lower chamfer on the band */}
      <path d={d(arc(0, PI, OUT, H - 8))} fill="none" stroke={INK} strokeWidth="1" />
      {/* band segments */}
      {segs.map((t) => {
        const a = pt(t, OUT, 0)
        const b = pt(t, OUT, H)
        return <line key={t} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={INK} strokeWidth="0.8" />
      })}

      {/* opening, inner wall and sensors */}
      <path d={d(inner, true)} fill={PAPER} stroke={INK} strokeWidth="1.5" />
      <g clipPath="url(#ring-opening)">
        <path d={d(arc(PI, 2 * PI, [INN[0] - 2, INN[1] - 1], DEPTH))} fill="none" stroke={INK} strokeWidth="1.5" />
        <path d={d(arc(PI, 2 * PI, INN, 10))} fill="none" stroke={INK} strokeWidth="0.8" />
        <path d={d(arc(PI, 2 * PI, INN, DEPTH - 8))} fill="none" stroke={INK} strokeWidth="0.8" />
        {PARTS.map(([t, kind]) => {
          const [x, y] = pt(t, INN, 26)
          const k = Math.abs(Math.sin(t))
          const rot = (TILT * 180) / PI
          if (kind === 'disc')
            return (
              <g key={t} transform={`translate(${x} ${y}) rotate(${rot})`}>
                <ellipse rx={16 * k} ry={17} fill={PAPER} stroke={INK} strokeWidth="1.2" />
                <ellipse rx={10 * k} ry={11} fill="none" stroke={INK} strokeWidth="0.8" />
                <line x1={-8 * k} y1={-8} x2={8 * k} y2={8} stroke={INK} strokeWidth="0.8" />
                <line x1={8 * k} y1={-8} x2={-8 * k} y2={8} stroke={INK} strokeWidth="0.8" />
              </g>
            )
          if (kind === 'chip')
            return (
              <g key={t} transform={`translate(${x} ${y}) rotate(${rot})`}>
                <rect x={-24} y={-14} width={48} height={28} fill={PAPER} stroke={INK} strokeWidth="1.2" />
                <rect x={-17} y={-9} width={34} height={18} fill="none" stroke={INK} strokeWidth="1" />
                <rect x={-12} y={-5} width={24} height={10} fill={INK} opacity="0.12" />
              </g>
            )
          return (
            <g key={t} transform={`translate(${x} ${y}) rotate(${rot})`}>
              <rect x={-6 * k} y={-9} width={12 * k} height={18} fill={PAPER} stroke={INK} strokeWidth="1.1" />
              <rect x={-3 * k} y={-5} width={6 * k} height={8} fill={INK} />
              <rect x={-6 * k} y={12} width={3} height={3} fill="none" stroke={INK} strokeWidth="0.7" />
              <rect x={-1 * k} y={12} width={3} height={3} fill="none" stroke={INK} strokeWidth="0.7" />
            </g>
          )
        })}
      </g>

      {callouts && (
        <g fontFamily="JetBrains Mono, monospace" fontSize="11" fill={INK}>
          <Callout from={chip} to={[452, 34]} label="02 · TOUCH CONTROLLER" anchor="end" />
          <Callout from={discL} to={[30, 64]} label="03 · HAPTIC ENGINE" />
          <Callout from={band} to={[30, 380]} label="01 · 360° THUMB TRACKPAD" />
          <Callout from={rim} to={[530, 330]} label="04 · TITANIUM SHELL" anchor="end" />
        </g>
      )}
    </svg>
  )
}

function Callout({ from, to, label, anchor = 'start' }) {
  const ty = to[1] < from[1] ? to[1] - 10 : to[1] + 20
  return (
    <g>
      <line x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} stroke={INK} strokeWidth="1" strokeDasharray="6 5" />
      <rect x={from[0] - 3} y={from[1] - 3} width={6} height={6} fill={INK} />
      <rect x={to[0] - 6} y={to[1] - 6} width={12} height={12} fill={ACC} />
      <text x={to[0] + (anchor === 'end' ? 6 : -6)} y={ty} textAnchor={anchor}>{label}</text>
    </g>
  )
}
