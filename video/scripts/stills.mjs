// Renders review stills at the given frames (default: two per scene).
import path from 'node:path'
import { bundle } from '@remotion/bundler'
import { renderStill, selectComposition } from '@remotion/renderer'
import timeline from '../src/timeline.json' with { type: 'json' }

let frames = process.argv.slice(2).map(Number)
if (!frames.length) {
  let at = 0
  for (const s of timeline.scenes) {
    frames.push(at + Math.round(s.frames * 0.3), at + Math.round(s.frames * 0.85))
    at += s.frames
  }
}
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.jsx') })
const composition = await selectComposition({ serveUrl, id: 'Projecto' })
for (const frame of frames) {
  const output = `out/frames/f${String(frame).padStart(3, '0')}.jpg`
  await renderStill({ composition, serveUrl, frame, output, imageFormat: 'jpeg', scale: Number(process.env.SCALE || 0.5), jpegQuality: 88 })
  console.log(output)
}
