import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, Easing } from 'remotion'
import timeline from './timeline.json'
import { LINES } from './script.js'
import { Offset, SCENES } from './scenes'
import { C, CL, MONO, SANS } from './theme'
import { LogoMark } from './parts'

const WIPE = 10 // frames each scene overlaps the previous one while wiping in

// Absolute start frame of every scene (audio timing)
const STARTS = timeline.scenes.reduce((acc, s, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + timeline.scenes[i - 1].frames)
  return acc
}, [])

function SceneWrap({ dark, index, count, children }) {
  const f = useCurrentFrame()
  const p = index === 0 ? 100 : interpolate(f, [0, WIPE], [0, 100], { ...CL, easing: Easing.inOut(Easing.cubic) })
  return (
    <AbsoluteFill style={{ background: dark ? C.ink : C.bg, clipPath: `inset(0 ${100 - p}% 0 0)` }}>
      {children}
      {!dark && (
        <>
          <div style={{ position: 'absolute', left: 120, top: 40, display: 'flex', alignItems: 'center', gap: 14, fontFamily: SANS, fontWeight: 800, fontSize: 28, letterSpacing: '0.03em', color: C.ink }}>
            <LogoMark size={26} />
            PROJECTO
          </div>
          <div style={{ position: 'absolute', right: 120, top: 46, fontFamily: MONO, fontSize: 22, color: C.muted }}>
            {String(index).padStart(2, '0')} / {String(count).padStart(2, '0')}
          </div>
          <div style={{ position: 'absolute', left: 120, right: 120, top: 92, height: 2, background: C.ink, opacity: 0.12 }} />
        </>
      )}
      {p < 100 && <div style={{ position: 'absolute', top: 0, bottom: 0, left: `calc(${p}% - 36px)`, width: 36, background: C.acc }} />}
    </AbsoluteFill>
  )
}

// Word-by-word captions, so the video reads without sound
function Captions() {
  const frame = useCurrentFrame()
  let i = STARTS.findIndex((s, k) => frame >= s && frame < s + timeline.scenes[k].frames)
  if (i < 0) i = STARTS.length - 1
  const scene = timeline.scenes[i]
  if (SCENES[scene.id].dark) return null
  const local = frame - STARTS[i]
  const words = LINES[i].text.split(' ')
  const shown = Math.floor((local / scene.voiceFrames) * words.length) + 1
  const fade = interpolate(local, [0, 6, scene.frames - 5, scene.frames], [0, 1, 1, 0], CL)
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 58, display: 'flex', justifyContent: 'center', opacity: fade }}>
      <div style={{ background: C.ink, color: C.paper, padding: '14px 28px', fontFamily: SANS, fontWeight: 600, fontSize: 38, letterSpacing: '-0.01em', maxWidth: 1500, textAlign: 'center' }}>
        {words.map((w, k) => (
          <span key={k} style={{ opacity: k < shown ? 1 : 0.28 }}>{w}{k < words.length - 1 ? ' ' : ''}</span>
        ))}
      </div>
    </div>
  )
}

export function Projecto() {
  const lightCount = timeline.scenes.filter((s) => !SCENES[s.id].dark).length
  let light = 0
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      {timeline.scenes.map((s, i) => {
        const { C: Scene, dark } = SCENES[s.id]
        if (!dark) light += 1
        const from = i === 0 ? 0 : STARTS[i] - WIPE
        const dur = s.frames + (i === 0 ? 0 : WIPE)
        return (
          <Sequence key={s.id} from={from} durationInFrames={dur} name={s.id}>
            <SceneWrap dark={dark} index={dark ? 0 : light} count={lightCount}>
              <Offset.Provider value={i === 0 ? 0 : WIPE}>
                <Scene d={s.frames} v={s.voiceFrames} />
              </Offset.Provider>
            </SceneWrap>
          </Sequence>
        )
      })}
      {timeline.scenes.map((s, i) => (
        <Sequence key={'a' + s.id} from={STARTS[i]} durationInFrames={s.frames} name={'voice ' + s.id}>
          <Audio src={staticFile(s.file)} />
        </Sequence>
      ))}
      <Captions />
    </AbsoluteFill>
  )
}
