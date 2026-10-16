const ICONS = [
  { id: 'gallery', x: 14, y: 32, label: 'Gallery', glyph: 'gallery' },
  { id: 'notes', x: 14, y: 54, label: 'Notes', glyph: 'notes' },
  { id: 'music', x: 14, y: 76, label: 'Music', glyph: 'music' },
  { id: 'files', x: 88, y: 26, label: 'Files', glyph: 'files' },
  { id: 'mail', x: 88, y: 48, label: 'Mail', glyph: 'mail' },
]

function Glyph({ type }) {
  switch (type) {
    case 'gallery':
      return (
        <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M3 17 L9 11 L14 16 L17 13 L21 17" fill="none" stroke="currentColor" strokeWidth="2" /><rect x="14" y="6" width="3" height="3" fill="currentColor" /></svg>
      )
    case 'notes':
      return (
        <svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M8 8 H16 M8 12 H16 M8 16 H13" stroke="currentColor" strokeWidth="2" /></svg>
      )
    case 'music':
      return (
        <svg viewBox="0 0 24 24"><path d="M9 18 V5 L19 3 V16" fill="none" stroke="currentColor" strokeWidth="2" /><rect x="5" y="16" width="5" height="5" fill="currentColor" /><rect x="15" y="14" width="5" height="5" fill="currentColor" /></svg>
      )
    case 'files':
      return (
        <svg viewBox="0 0 24 24"><path d="M3 6 H10 L12 8 H21 V20 H3 Z" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
      )
    default:
      return (
        <svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M3 5 L12 13 L21 5" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
      )
  }
}

const TILES = [
  ['#111111', 'sq'], ['#FF4F00', 'line'], ['#D9D4CA', 'sq'], ['#BFB8AB', 'bar'],
  ['#F7F5F0', 'sq'], ['#111111', 'bar'], ['#D9D4CA', 'line'], ['#FF4F00', 'sq'],
  ['#BFB8AB', 'line'], ['#F7F5F0', 'bar'], ['#111111', 'line'], ['#D9D4CA', 'bar'],
  ['#FF4F00', 'bar'], ['#BFB8AB', 'sq'], ['#111111', 'sq'], ['#F7F5F0', 'line'],
]

export default function Monitor({ s }) {
  const hovered = ICONS.find((i) => Math.abs(i.x - s.cx) < 5 && Math.abs(i.y - s.cy) < 8)
  const volSegs = 16

  return (
    <div className="monitor">
      <div className="bezel">
        <div className="screen">
          <div className="menubar">
            <span>■ PROJECTO OS</span>
            <span className="mb-mid">{s.phaseName}</span>
            <span>L ■ R ■ 92%</span>
          </div>

          <div className="wallpaper">Hello.</div>

          {ICONS.map((i) => (
            <div
              key={i.id}
              className={'icon' + (hovered?.id === i.id || (i.id === 'gallery' && s.tap > 0.6) ? ' is-hover' : '')}
              style={{ left: i.x + '%', top: i.y + '%' }}
            >
              <div className="icon-tile"><Glyph type={i.glyph} /></div>
              <span>{i.label}</span>
            </div>
          ))}

          <div
            className="window"
            style={{
              opacity: s.win,
              transform: `translate(-50%, -50%) scale(${0.86 + s.win * 0.14})`,
              visibility: s.win > 0.01 ? 'visible' : 'hidden',
            }}
          >
            <div className="win-bar">
              <span>Gallery</span>
              <span className="win-meta">16 items · scroll {Math.round(s.scroll * 100)}%</span>
              <span className="win-x">×</span>
            </div>
            <div className="win-body">
              <div className="win-grid" style={{ transform: `translateY(${-s.scroll * 52}%) scale(${1 + s.zoom * 0.4})` }}>
                {TILES.map(([c, kind], n) => (
                  <div key={n} className={'tile tile-' + kind} style={{ background: c }}>
                    <span>{String(n + 1).padStart(2, '0')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="hud" style={{ opacity: s.hud, transform: `translate(-50%, ${(1 - s.hud) * 16}px)` }}>
            <span className="hud-label">ZOOM</span>
            <div className="hud-bar">
              {Array.from({ length: volSegs }).map((_, n) => (
                <i key={n} className={n < Math.round(((s.zoom * 0.75) + 0.25) * volSegs) ? 'on' : ''} />
              ))}
            </div>
            <span className="hud-num">{Math.round(100 + s.zoom * 80)}%</span>
          </div>

          <div className="cursor" style={{ left: s.cx + '%', top: s.cy + '%', opacity: s.wake }}>
            {s.ripple > 0 && s.ripple < 1 && (
              <div className="ripple" style={{ transform: `translate(-50%, -50%) scale(${0.3 + s.ripple * 2.4})`, opacity: 1 - s.ripple }} />
            )}
            <svg width="22" height="30" viewBox="0 0 22 30" style={{ transform: `scale(${1 - s.tap * 0.18})` }}>
              <path d="M1 1 L1 24 L7 18 L11 28 L15 26 L11 17 L19 17 Z" fill="#111" stroke="#fff" strokeWidth="1.5" />
            </svg>
          </div>

          <div className="sleep" style={{ opacity: 1 - s.wake }}>
            <span>■ ■</span>
          </div>
        </div>
      </div>
      <div className="neck" />
      <div className="foot" />
    </div>
  )
}
