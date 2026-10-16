import { Easing, interpolate } from 'remotion'
import { loadFont as loadSans } from '@remotion/google-fonts/InterTight'
import { loadFont as loadMono } from '@remotion/google-fonts/JetBrainsMono'

export const SANS = loadSans('normal', { weights: ['400', '500', '600', '700', '800'], subsets: ['latin'] }).fontFamily
export const MONO = loadMono('normal', { weights: ['400', '500'], subsets: ['latin'] }).fontFamily

// Brand: flat colour only, square corners, one orange accent.
export const C = {
  bg: '#ECEAE4',
  paper: '#F7F5F0',
  ink: '#111111',
  muted: '#6A6862',
  soft: '#D9D4CA',
  line: '#BFB8AB',
  acc: '#FF4F00',
  skin: '#D9A68A',
  skinDark: '#B98466',
  nail: '#EBC6AE',
}

export const CL = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
export const EASE = Easing.bezier(0.2, 0.8, 0.2, 1)

// 0..1 between two frames, eased
export const prog = (f, a, b, easing = EASE) => interpolate(f, [a, b], [0, 1], { ...CL, easing })
export const lerp = (a, b, t) => a + (b - a) * t
export const smooth = (t) => t * t * (3 - 2 * t)

export function pathAt(pts, t) {
  const n = pts.length - 1
  const s = Math.min(Math.max(t, 0), 1) * n
  const i = Math.min(n - 1, Math.floor(s))
  const k = smooth(s - i)
  return [lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k)]
}
