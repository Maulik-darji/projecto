import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import rightUrl from '@webxr-input-profiles/assets/dist/profiles/generic-hand/right.glb?url'
import leftUrl from '@webxr-input-profiles/assets/dist/profiles/generic-hand/left.glb?url'

const FINGERS = ['index-finger', 'middle-finger', 'ring-finger', 'pinky-finger']
const JOINTS = ['metacarpal', 'phalanx-proximal', 'phalanx-intermediate', 'phalanx-distal', 'tip']
const THUMB = ['thumb-metacarpal', 'thumb-phalanx-proximal', 'thumb-phalanx-distal', 'thumb-tip']
const MAX_BEND = [0, 80, 100, 70] // degrees per joint at full curl (metacarpal stays put)
const PX = 0.00036 // scene px offsets -> metres
const ACC = new THREE.Color('#FF4F00')

const skin = new THREE.MeshPhysicalMaterial({
  color: '#C98A6B',
  roughness: 0.58,
  sheen: 0.5,
  sheenRoughness: 0.55,
  sheenColor: new THREE.Color('#FFB89A'),
  clearcoat: 0.06,
  clearcoatRoughness: 0.7,
})
const titanium = new THREE.MeshStandardMaterial({ color: '#BDB9B2', metalness: 1, roughness: 0.32 })
const sleeveMat = new THREE.MeshStandardMaterial({ color: '#141414', roughness: 0.92 })
const stripeMat = new THREE.MeshStandardMaterial({ color: ACC, roughness: 0.6 })

// Flat band with chamfered edges, revolved around Y
function ringGeometry() {
  const r = 0.0112
  const t = 0.0026
  const w = 0.0034
  const c = 0.0007
  const pts = [
    [r, -w], [r + t - c, -w], [r + t, -w + c], [r + t, w - c], [r + t - c, w], [r, w], [r, -w],
  ].map(([x, y]) => new THREE.Vector2(x, y))
  return new THREE.LatheGeometry(pts, 64)
}

// The WebXR hand rig ships with every joint parented to the armature.
// Rebuild the finger chains so rotating a knuckle carries the rest of the finger.
function rig(gltf, isLeft) {
  if (gltf.userData.rig) return gltf.userData.rig
  const root = gltf.scene
  root.updateMatrixWorld(true)
  const bone = (n) => root.getObjectByName(n)
  const wrist = bone('wrist')

  const chains = FINGERS.map((f) => JOINTS.map((j) => bone(`${f}-${j}`)))
  const thumb = THUMB.map(bone)
  for (const chain of [...chains, thumb]) {
    wrist.attach(chain[0])
    for (let i = 1; i < chain.length; i++) chain[i - 1].attach(chain[i])
  }
  root.traverse((o) => {
    if (o.isSkinnedMesh) {
      o.material = skin
      o.frustumCulled = false
    }
  })
  root.updateMatrixWorld(true)

  const wp = (o) => o.getWorldPosition(new THREE.Vector3())
  const w = wp(wrist)
  const palmN = new THREE.Vector3()
    .crossVectors(wp(chains[0][1]).sub(w), wp(chains[3][1]).sub(w))
    .normalize()
    .multiplyScalar(isLeft ? -1 : 1)

  // Flex axis for each finger joint, expressed in that joint's local frame
  const flex = chains.map((chain) =>
    chain.slice(0, 4).map((b, i) => {
      const dir = wp(chain[i + 1]).sub(wp(b)).normalize()
      const axis = new THREE.Vector3().crossVectors(dir, palmN).normalize()
      const q = b.getWorldQuaternion(new THREE.Quaternion()).invert()
      return axis.applyQuaternion(q)
    })
  )

  const all = [wrist, ...chains.flat(), ...thumb]
  const rest = new Map(all.map((b) => [b, b.quaternion.clone()]))

  // Ring on the index proximal phalanx
  const prox = chains[0][1]
  const seg = chains[0][2].position.clone()
  const ring = new THREE.Group()
  ring.position.copy(seg).multiplyScalar(0.42)
  ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), seg.clone().normalize())
  ring.add(new THREE.Mesh(ringGeometry(), titanium))
  const ledMat = new THREE.MeshStandardMaterial({ color: '#333', emissive: ACC, emissiveIntensity: 0 })
  const touchMat = new THREE.MeshStandardMaterial({ color: '#333', emissive: ACC, emissiveIntensity: 0, transparent: true, opacity: 0 })
  const led = new THREE.Mesh(new THREE.BoxGeometry(0.0022, 0.0022, 0.0012), ledMat)
  const touch = new THREE.Mesh(new THREE.CylinderGeometry(0.0141, 0.0141, 0.0062, 48, 1, true, 0, Math.PI * 0.6), touchMat)
  ring.add(led, touch)
  prox.add(ring)

  // Sleeve over the forearm
  const toFingers = wp(chains[1][0]).sub(w).normalize()
  const local = toFingers.clone().applyQuaternion(wrist.getWorldQuaternion(new THREE.Quaternion()).invert())
  const sleeve = new THREE.Group()
  sleeve.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), local.clone().negate())
  const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.031, 0.037, 0.34, 40), sleeveMat)
  cuff.position.y = 0.2
  cuff.scale.set(1, 1, 0.8)
  const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.0322, 0.0322, 0.006, 40, 1, true), stripeMat)
  stripe.position.y = 0.045
  stripe.scale.set(1, 1, 0.8)
  sleeve.add(cuff, stripe)
  wrist.add(sleeve)

  const r = { root, wrist, chains, thumb, flex, rest, ring, led, ledMat, touch, touchMat, palmN, all }
  gltf.userData.rig = r
  return r
}

const _v = new THREE.Vector3()
const _a = new THREE.Vector3()
const _b = new THREE.Vector3()
const _q = new THREE.Quaternion()
const _pq = new THREE.Quaternion()
const _wq = new THREE.Quaternion()

// Cyclic coordinate descent: rotate thumb joints until the tip reaches target
function solveThumb(thumb, target, iterations = 10) {
  const tip = thumb[3]
  for (let n = 0; n < iterations; n++) {
    for (let i = 2; i >= 0; i--) {
      const b = thumb[i]
      const pos = b.getWorldPosition(_v)
      _a.copy(tip.getWorldPosition(new THREE.Vector3())).sub(pos).normalize()
      _b.copy(target).sub(pos).normalize()
      _q.setFromUnitVectors(_a, _b)
      if (i === 0) _q.slerp(new THREE.Quaternion(), 0.65) // metacarpal moves less
      b.getWorldQuaternion(_wq)
      b.parent.getWorldQuaternion(_pq).invert()
      b.quaternion.copy(_pq.multiply(_q.multiply(_wq)))
      b.updateMatrixWorld(true)
    }
  }
}

function Hand({ url, isLeft, state }) {
  const gltf = useLoader(GLTFLoader, url)
  const r = useMemo(() => rig(gltf, isLeft), [gltf, isLeft])
  const outer = useRef()
  const base = isLeft ? [-0.135, -0.135, 0] : [0.135, -0.135, 0]

  useFrame(() => {
    const s = state.current[isLeft ? 'L' : 'R']
    if (!s || !outer.current) return
    outer.current.position.set(base[0] + s.x * PX, base[1] - s.y * PX, base[2])
    outer.current.rotation.z = (-s.rot * Math.PI) / 180
    // turn the thumb side toward the viewer so thumb-on-ring reads clearly
    outer.current.rotation.y = isLeft ? -0.45 : 0.45

    for (const b of r.all) b.quaternion.copy(r.rest.get(b))
    const curls = [s.curls.index, s.curls.middle, s.curls.ring, s.curls.pinky]
    r.chains.forEach((chain, f) => {
      for (let j = 1; j < 4; j++) {
        const ang = (curls[f] * MAX_BEND[j] * Math.PI) / 180
        chain[j].quaternion.multiply(_q.setFromAxisAngle(r.flex[f][j], ang))
      }
    })
    r.root.updateMatrixWorld(true)

    // where the thumb would rest, and where it touches the ring's outer surface
    const restTip = r.thumb[3].getWorldPosition(new THREE.Vector3())
    const center = r.ring.getWorldPosition(new THREE.Vector3())
    const axis = new THREE.Vector3(0, 1, 0).applyQuaternion(r.ring.getWorldQuaternion(new THREE.Quaternion()))
    const side = restTip.clone().sub(center)
    side.sub(axis.clone().multiplyScalar(side.dot(axis))).normalize()
    side.applyAxisAngle(axis, (s.orbit || 0) * (isLeft ? -1 : 1)) // thumb travelling around the band
    const contact = center
      .clone()
      .addScaledVector(side, 0.0225)
      .addScaledVector(axis, s.slide * 0.0045)
    solveThumb(r.thumb, restTip.lerp(contact, s.thumb))

    // LED on top of the band, touch glow on the thumb side
    const sideLocal = side.clone().applyQuaternion(r.ring.getWorldQuaternion(new THREE.Quaternion()).invert())
    const back = r.palmN.clone().negate().applyQuaternion(r.ring.getWorldQuaternion(new THREE.Quaternion()).invert())
    r.led.position.copy(back).setY(0).normalize().multiplyScalar(0.0139)
    r.led.lookAt(r.led.getWorldPosition(new THREE.Vector3()).add(r.led.position))
    r.ledMat.emissiveIntensity = s.led * (2 + s.flash * 4)
    const ang = Math.atan2(sideLocal.x, sideLocal.z)
    r.touch.rotation.y = ang - Math.PI * 0.3
    const on = s.thumb > 0.85 ? s.led : 0
    r.touchMat.opacity = on
    r.touchMat.emissiveIntensity = on * 2.5
  })

  // Fingers up, back of the hand to the viewer, reaching slightly into the screen
  return (
    <group ref={outer}>
      <group rotation={[-0.42, isLeft ? -Math.PI / 2 : Math.PI / 2, 0]}>
        <group rotation={[0, 0, Math.PI]}>
          <primitive object={r.root} />
        </group>
      </group>
    </group>
  )
}

function Environment() {
  const { gl, scene } = useThree()
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env
    return () => {
      env.dispose()
      pmrem.dispose()
    }
  }, [gl, scene])
  return null
}

function Rig() {
  const { camera, size } = useThree()
  useEffect(() => {
    const aspect = size.width / size.height
    camera.position.set(0, 0.03, aspect < 0.9 ? 1.05 : 0.72)
    camera.lookAt(0, 0, 0)
  }, [camera, size])
  return null
}

export default function Hands3D({ L, R }) {
  const state = useRef({ L, R })
  state.current = { L, R }
  return (
    <div className="hands-canvas" aria-label="Two hands, each wearing a Projecto ring on the index finger">
      <Canvas
        dpr={[1, 2]}
        camera={{ fov: 28, near: 0.01, far: 10, position: [0, 0.03, 0.72] }}
        gl={{ alpha: true, antialias: true, toneMapping: THREE.ACESFilmicToneMapping, outputColorSpace: THREE.SRGBColorSpace }}
      >
        <Rig />
        <Environment />
        <hemisphereLight args={['#ffffff', '#b9a796', 0.9]} />
        <directionalLight position={[-0.6, 0.9, 1]} intensity={2.2} color="#fff3e6" />
        <directionalLight position={[0.8, 0.3, -0.8]} intensity={1.4} color="#dfe8ff" />
        <Suspense fallback={null}>
          <Hand url={leftUrl} isLeft state={state} />
          <Hand url={rightUrl} isLeft={false} state={state} />
        </Suspense>
      </Canvas>
    </div>
  )
}
