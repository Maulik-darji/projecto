// macOS-style desktop, drawn flat: no gradients, square corners.
const ICONS = [
  { id: 'gallery', x: 91, y: 16, label: 'Photos', kind: 'folder' },
  { id: 'projects', x: 91, y: 33, label: 'Projects', kind: 'folder' },
  { id: 'notes', x: 91, y: 50, label: 'Notes.txt', kind: 'doc' },
  { id: 'invoice', x: 91, y: 67, label: 'Invoice.pdf', kind: 'pdf' },
]

const DOCK = [
  { id: 'finder', bg: '#2F7BF6', glyph: 'finder' },
  { id: 'browser', bg: '#F7F5F0', glyph: 'compass' },
  { id: 'mail', bg: '#3A8DFF', glyph: 'mail' },
  { id: 'photos', bg: '#F7F5F0', glyph: 'photos' },
  { id: 'music', bg: '#FA3C4C', glyph: 'music' },
  { id: 'notes', bg: '#FFD43B', glyph: 'notes' },
  { id: 'projecto', bg: '#111111', glyph: 'projecto', open: true },
  { id: 'gap' },
  { id: 'trash', bg: '#D9D4CA', glyph: 'trash' },
]

function DesktopIcon({ kind }) {
  if (kind === 'folder')
    return (
      <svg viewBox="0 0 48 40">
        <path d="M2 6 H18 L22 10 H46 V38 H2 Z" fill="#5AA6F0" />
        <path d="M2 14 H46 V38 H2 Z" fill="#7DBBF5" />
        <path d="M2 14 H46" stroke="#4A93DA" strokeWidth="1" />
      </svg>
    )
  if (kind === 'pdf')
    return (
      <svg viewBox="0 0 40 48">
        <path d="M4 2 H28 L36 10 V46 H4 Z" fill="#fff" stroke="#BDBDBD" />
        <path d="M28 2 V10 H36" fill="#EDEDED" stroke="#BDBDBD" />
        <rect x="4" y="30" width="32" height="10" fill="#E5463B" />
        <text x="20" y="38" fontSize="8" fill="#fff" textAnchor="middle" fontFamily="system-ui" fontWeight="700">PDF</text>
      </svg>
    )
  return (
    <svg viewBox="0 0 40 48">
      <path d="M4 2 H28 L36 10 V46 H4 Z" fill="#fff" stroke="#BDBDBD" />
      <path d="M28 2 V10 H36" fill="#EDEDED" stroke="#BDBDBD" />
      <path d="M10 18 H30 M10 24 H30 M10 30 H24" stroke="#9A9A9A" strokeWidth="2" />
    </svg>
  )
}

function DockGlyph({ type }) {
  switch (type) {
    case 'finder':
      return (
        <svg viewBox="0 0 24 24">
          <rect x="12" y="0" width="12" height="24" fill="#8CC3FF" />
          <path d="M8 8 V11 M16 8 V11" stroke="#111" strokeWidth="1.6" />
          <path d="M6 16 H18" stroke="#111" strokeWidth="1.6" />
        </svg>
      )
    case 'compass':
      return (
        <svg viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" fill="none" stroke="#2F7BF6" strokeWidth="2" />
          <path d="M15 9 L13 13 L9 15 L11 11 Z" fill="#FA3C4C" />
          <path d="M12 5 V7 M12 17 V19 M5 12 H7 M17 12 H19" stroke="#2F7BF6" strokeWidth="1.5" />
        </svg>
      )
    case 'mail':
      return (
        <svg viewBox="0 0 24 24">
          <rect x="3" y="6" width="18" height="12" fill="#fff" />
          <path d="M3 6 L12 13 L21 6" fill="none" stroke="#3A8DFF" strokeWidth="1.6" />
        </svg>
      )
    case 'photos':
      return (
        <svg viewBox="0 0 24 24">
          <rect x="4" y="4" width="8" height="8" fill="#FFB020" />
          <rect x="12" y="4" width="8" height="8" fill="#FA3C4C" />
          <rect x="4" y="12" width="8" height="8" fill="#34C759" />
          <rect x="12" y="12" width="8" height="8" fill="#3A8DFF" />
        </svg>
      )
    case 'music':
      return (
        <svg viewBox="0 0 24 24">
          <path d="M10 17 V6 L18 4 V15" fill="none" stroke="#fff" strokeWidth="2" />
          <rect x="6" y="15" width="5" height="4" fill="#fff" />
          <rect x="14" y="13" width="5" height="4" fill="#fff" />
        </svg>
      )
    case 'notes':
      return (
        <svg viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="5" fill="#F7F5F0" />
          <path d="M6 12 H18 M6 15.5 H18 M6 19 H13" stroke="#8C7A20" strokeWidth="1.4" />
        </svg>
      )
    case 'projecto':
      return (
        <svg viewBox="0 0 24 24">
          <rect x="4" y="8" width="9" height="9" fill="none" stroke="#F7F5F0" strokeWidth="2.4" />
          <rect x="11" y="8" width="9" height="9" fill="none" stroke="#FF4F00" strokeWidth="2.4" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 24 24">
          <path d="M6 7 H18 L17 21 H7 Z" fill="#F7F5F0" stroke="#8C887F" />
          <path d="M5 7 H19 M10 4 H14" stroke="#8C887F" strokeWidth="1.5" />
        </svg>
      )
  }
}

const TILES = [
  ['#111111', 'sq'], ['#FF4F00', 'line'], ['#D9D4CA', 'sq'], ['#BFB8AB', 'bar'],
  ['#F7F5F0', 'sq'], ['#111111', 'bar'], ['#D9D4CA', 'line'], ['#FF4F00', 'sq'],
  ['#BFB8AB', 'line'], ['#F7F5F0', 'bar'], ['#111111', 'line'], ['#D9D4CA', 'bar'],
  ['#FF4F00', 'bar'], ['#BFB8AB', 'sq'], ['#111111', 'sq'], ['#F7F5F0', 'line'],
]

const SIDEBAR = [
  ['Favourites', null],
  ['Recents', false],
  ['Desktop', false],
  ['Documents', false],
  ['Photos', true],
  ['Downloads', false],
  ['Locations', null],
  ['Projecto Ring', false],
]

function Wallpaper() {
  return (
    <svg className="mac-wall" viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width="160" height="100" fill="#EFE4D6" />
      <rect x="96" y="22" width="18" height="18" fill="#FF4F00" />
      <path d="M0 62 L30 44 L58 58 L92 36 L126 54 L160 40 V100 H0 Z" fill="#D9C7B2" />
      <path d="M0 74 L36 58 L70 72 L104 56 L140 70 L160 62 V100 H0 Z" fill="#BCA58C" />
      <path d="M0 86 L44 74 L84 86 L120 76 L160 84 V100 H0 Z" fill="#8C7660" />
    </svg>
  )
}

export default function Monitor({ s }) {
  const hovered = ICONS.find((i) => Math.abs(i.x - s.cx) < 5 && Math.abs(i.y - s.cy) < 7)
  const volSegs = 16
  const gesture = s.phaseName.charAt(0) + s.phaseName.slice(1).toLowerCase()

  return (
    <div className="monitor">
      <div className="bezel">
        <div className="screen mac">
          <Wallpaper />

          <div className="menubar">
            <div className="mb-left">
              <strong>Projecto</strong>
              <span>File</span>
              <span>Edit</span>
              <span>View</span>
              <span className="mb-hide">Go</span>
              <span className="mb-hide">Window</span>
              <span className="mb-hide">Help</span>
            </div>
            <div className="mb-right">
              <span className="mb-ring" title="Projecto rings">
                <i /><i />
                <em>{gesture}</em>
              </span>
              <svg className="mb-ico" viewBox="0 0 18 12" aria-hidden>
                <path d="M1 4 Q9 -2 17 4" fill="none" stroke="currentColor" strokeWidth="1.6" />
                <path d="M4 7 Q9 3 14 7" fill="none" stroke="currentColor" strokeWidth="1.6" />
                <rect x="8" y="9" width="2" height="2" fill="currentColor" />
              </svg>
              <svg className="mb-ico mb-batt" viewBox="0 0 24 12" aria-hidden>
                <rect x="0.5" y="0.5" width="20" height="11" fill="none" stroke="currentColor" />
                <rect x="2" y="2" width="15" height="8" fill="currentColor" />
                <rect x="21" y="4" width="2" height="4" fill="currentColor" />
              </svg>
              <span className="mb-clock">Fri 16 Oct&nbsp;&nbsp;10:45</span>
            </div>
          </div>

          {ICONS.map((i) => (
            <div
              key={i.id}
              className={'icon' + (hovered?.id === i.id || (i.id === 'gallery' && s.tap > 0.6) ? ' is-hover' : '')}
              style={{ left: i.x + '%', top: i.y + '%' }}
            >
              <div className="icon-tile"><DesktopIcon kind={i.kind} /></div>
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
              <span className="lights"><i /><i /><i /></span>
              <span className="win-title">Photos</span>
              <span className="win-meta">16 items</span>
            </div>
            <div className="win-main">
              <ul className="win-side">
                {SIDEBAR.map(([label, on]) => (
                  <li key={label} className={on === null ? 'side-head' : on ? 'is-on' : ''}>{label}</li>
                ))}
              </ul>
              <div className="win-body">
                <div className="win-grid" style={{ transform: `translateY(${-s.scroll * 52}%) scale(${1 + s.zoom * 0.4})` }}>
                  {TILES.map(([c, kind], n) => (
                    <div key={n} className={'tile tile-' + kind} style={{ background: c }}>
                      <span>IMG_{String(n + 1).padStart(2, '0')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="dock">
            {DOCK.map((d) =>
              d.id === 'gap' ? (
                <span key="gap" className="dock-gap" />
              ) : (
                <span key={d.id} className="dock-app">
                  <span className="dock-ico" style={{ background: d.bg }}><DockGlyph type={d.glyph} /></span>
                  {(d.open || (d.id === 'photos' && s.win > 0.5)) && <i className="dock-dot" />}
                </span>
              )
            )}
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
