// Generates the voiceover with Kokoro-82M (female voice "af_heart"), one WAV per line,
// and writes src/timeline.json so each scene lasts exactly as long as its line.
import { KokoroTTS } from 'kokoro-js'
import { mkdirSync, writeFileSync } from 'node:fs'
import { LINES } from '../src/script.js'

const VOICE = process.env.VOICE || 'af_heart'
const SPEED = Number(process.env.SPEED || 1.06)
const FPS = 30
const GAP = 0.32 // seconds of breathing room after each line

mkdirSync('public/voice', { recursive: true })

const tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', {
  dtype: 'fp32',
  device: 'cpu',
})

const timeline = []
let total = 0
for (const [i, line] of LINES.entries()) {
  const audio = await tts.generate(line.text, { voice: VOICE, speed: SPEED })
  const file = `voice/line${i + 1}.wav`
  audio.save(`public/${file}`)
  const seconds = audio.audio.length / audio.sampling_rate
  const frames = Math.ceil((seconds + GAP + (line.hold || 0)) * FPS)
  timeline.push({ id: line.id, file, voiceFrames: Math.ceil(seconds * FPS), frames })
  total += frames
  console.log(`${String(i + 1).padStart(2)}  ${seconds.toFixed(2)}s  ${line.text}`)
}

writeFileSync('src/timeline.json', JSON.stringify({ fps: FPS, total, scenes: timeline }, null, 2))
console.log(`\nTotal: ${(total / FPS).toFixed(2)}s (${total} frames) · voice ${VOICE} · speed ${SPEED}`)
