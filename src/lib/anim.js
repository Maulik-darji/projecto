export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const lerp = (a, b, t) => a + (b - a) * t
export const range = (a, b, p) => clamp((p - a) / (b - a))
export const ease = (t) => t * t * (3 - 2 * t)
export const smooth = (a, b, p) => ease(range(a, b, p))

// Eased walk through a list of [x, y] waypoints, t in 0..1
export function pathAt(pts, t) {
  const n = pts.length - 1
  const s = clamp(t) * n
  const i = Math.min(n - 1, Math.floor(s))
  const f = ease(s - i)
  return [lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)]
}
