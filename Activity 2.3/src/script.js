import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'


// Debug GUI
const gui = new dat.GUI({ width: 300 })

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color('#cbd3d1') // pale sky
scene.fog = new THREE.Fog('#cbd3d1', 8, 25)

// Sizes
const sizes = { width: window.innerWidth, height: window.innerHeight }
window.addEventListener('resize', () => {
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Camera
const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.1, 100)
camera.position.set(8, 6, 10)
camera.lookAt(0, 1, 0)
scene.add(camera)

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(scene.background)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.target.set(0, 1.2, 0)

// Lights
const ambient = new THREE.AmbientLight('#ffffff', 0.45)
scene.add(ambient)

const sun = new THREE.DirectionalLight('#fff6d8', 0.7)
sun.position.set(5, 10, 2)
sun.castShadow = true
sun.shadow.mapSize.set(1024, 1024)
sun.shadow.camera.near = 1
sun.shadow.camera.far = 30
sun.shadow.camera.left = -15
sun.shadow.camera.right = 15
sun.shadow.camera.top = 15
sun.shadow.camera.bottom = -15
scene.add(sun)

// Helper GUI for lights
const lightFolder = gui.addFolder('Lights')
lightFolder.add(ambient, 'intensity', 0, 1, 0.01).name('ambient')
lightFolder.add(sun, 'intensity', 0, 2, 0.01).name('sun')
lightFolder.open()

// Ground (cobblestone simulated with multiple slightly raised discs)
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(40, 40, 1, 1),
  new THREE.MeshStandardMaterial({ color: '#6b6b58', roughness: 1 })
)
ground.rotation.x = -Math.PI * 0.5
ground.receiveShadow = true
scene.add(ground)

// Simple cobble pattern: low-cost visual detail using many small discs
const cobbleGeo = new THREE.CircleGeometry(0.25, 12)
const cobbleMat = new THREE.MeshStandardMaterial({ color: '#7a7568', roughness: 1 })
const cobbles = new THREE.Group()
for (let x = -10; x <= 10; x += 0.6) {
  for (let z = -10; z <= 10; z += 0.6) {
    if (Math.random() > 0.85) continue // sparse
    const c = new THREE.Mesh(cobbleGeo, cobbleMat)
    c.rotation.x = -Math.PI * 0.5
    c.position.set(x + (Math.random() - 0.5) * 0.2, 0.01 + Math.random() * 0.02, z + (Math.random() - 0.5) * 0.2)
    c.receiveShadow = true
    cobbles.add(c)
  }
}
scene.add(cobbles)

// Reusable geometries/materials for buildings
const wallGeom = new THREE.BoxGeometry(2.4, 1.8, 2.4)
const wallMat = new THREE.MeshStandardMaterial({ color: '#d9c8b0', roughness: 1 })
const roofGeom = new THREE.ConeGeometry(1.6, 1.2, 4)
const roofMat = new THREE.MeshStandardMaterial({ color: '#6b2b2b', roughness: 0.9 })
const doorGeom = new THREE.PlaneGeometry(0.6, 1.1)
const doorMat = new THREE.MeshStandardMaterial({ color: '#4b2f2f', roughness: 1 })

// Create a cottage factory function
function createCottage(x, z, rotation = 0, scale = 1) {
  const cottage = new THREE.Group()

  const walls = new THREE.Mesh(wallGeom, wallMat)
  walls.scale.set(scale, scale, scale)
  walls.position.y = 0.9 * scale
  walls.castShadow = true
  walls.receiveShadow = true
  cottage.add(walls)

  const roof = new THREE.Mesh(roofGeom, roofMat)
  roof.scale.set(1.2 * scale, 1.2 * scale, 1.2 * scale)
  roof.position.y = 2.0 * scale
  roof.rotation.y = Math.PI / 4
  roof.castShadow = true
  cottage.add(roof)

  const door = new THREE.Mesh(doorGeom, doorMat)
  door.position.set(0, 0.5 * scale, 1.201 * scale)
  door.rotation.y = Math.PI
  door.castShadow = true
  cottage.add(door)

  // Tiny window (emissive)
  const winMat = new THREE.MeshStandardMaterial({ color: '#ffcfa6', emissive: '#ffd27a', emissiveIntensity: 0.9 })
  const windowMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.45), winMat)
  windowMesh.position.set(-0.7 * scale, 1.2 * scale, 1.201 * scale)
  windowMesh.rotation.y = Math.PI
  cottage.add(windowMesh)

  cottage.position.set(x, 0, z)
  cottage.rotation.y = rotation
  return cottage
}

// Place a few cottages
const cottages = new THREE.Group()
cottages.add(createCottage(-3, -1.5, Math.PI * 0.08, 1))
cottages.add(createCottage(0, -2.5, -Math.PI * 0.06, 0.95))
cottages.add(createCottage(3, -1.2, Math.PI * 0.12, 1.05))
cottages.position.y = 0
scene.add(cottages)

// Well in the square
const well = new THREE.Group()
const wellBase = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.6, 24), new THREE.MeshStandardMaterial({ color: '#8b7d6a', roughness: 1 }))
wellBase.position.y = 0.3
wellBase.castShadow = true
well.add(wellBase)
const wellRoof1 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.12, 0.12), new THREE.MeshStandardMaterial({ color: '#5a3b2b' }))
wellRoof1.position.set(0, 0.85, 0.3)
well.add(wellRoof1)
const wellRoof2 = wellRoof1.clone(); wellRoof2.position.z = -0.3; well.add(wellRoof2)
const pulley = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.2, 12), new THREE.MeshStandardMaterial({ color: '#2e2e2e' }))
pulley.rotation.z = Math.PI * 0.5
pulley.position.set(0, 0.9, 0)
well.add(pulley)
well.position.set(0, 0, 2.2)
scene.add(well)

// Market stall factory
const stallGeom = new THREE.BoxGeometry(1.6, 0.2, 0.9)
const stallMat = new THREE.MeshStandardMaterial({ color: '#7a5235', roughness: 1 })
const awningMat = new THREE.MeshStandardMaterial({ color: '#d34b3b', roughness: 1 })
function createStall(x, z, rotation = 0) {
  const stall = new THREE.Group()
  const table = new THREE.Mesh(stallGeom, stallMat)
  table.position.y = 0.8
  table.castShadow = true
  stall.add(table)
  const awning = new THREE.Mesh(new THREE.ConeGeometry(0.9, 0.6, 4), awningMat)
  awning.rotation.x = Math.PI
  awning.position.y = 1.3
  awning.position.z = 0
  awning.rotation.y = Math.PI / 4
  stall.add(awning)

  // little crates
  const crate = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.25, 0.25), new THREE.MeshStandardMaterial({ color: '#d1a173' }))
  crate.position.set(0.4, 0.9, 0.2)
  stall.add(crate)

  stall.position.set(x, 0, z)
  stall.rotation.y = rotation
  return stall
}

const stalls = new THREE.Group()
stalls.add(createStall(-2.6, 2.2, Math.PI * 0.15))
stalls.add(createStall(0.8, 2.6, -Math.PI * 0.2))
scene.add(stalls)

// Lamp post with an emissive lantern
const lamp = new THREE.Group()
const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.4, 12), new THREE.MeshStandardMaterial({ color: '#2b2b2b' }))
post.position.y = 1.2
post.castShadow = true
lamp.add(post)
const lanternGeo = new THREE.BoxGeometry(0.34, 0.4, 0.34)
const lanternMat = new THREE.MeshStandardMaterial({ color: '#fff1d0', emissive: '#ffd98a', emissiveIntensity: 1 })
const lanternMesh = new THREE.Mesh(lanternGeo, lanternMat)
lanternMesh.position.set(0, 2.1, 0)
lanternMesh.castShadow = true
lamp.add(lanternMesh)

const lanternLight = new THREE.PointLight('#ffd98a', 1.2, 6)
lanternLight.position.set(0, 2.05, 0)
lanternLight.castShadow = true
lamp.add(lanternLight)
lamp.position.set(-4, 0, -1)
scene.add(lamp)

// Trees (reused geometry)
const trunkGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.9, 8)
const trunkMat = new THREE.MeshStandardMaterial({ color: '#6b3b20' })
const foliageGeo = new THREE.ConeGeometry(0.8, 1.2, 8)
const foliageMat = new THREE.MeshStandardMaterial({ color: '#2e6b2e' })

function createTree(x, z, scale = 1) {
  const tree = new THREE.Group()
  const trunk = new THREE.Mesh(trunkGeo, trunkMat)
  trunk.position.y = 0.45 * scale
  trunk.castShadow = true
  tree.add(trunk)
  const foliage = new THREE.Mesh(foliageGeo, foliageMat)
  foliage.position.y = 1.05 * scale
  foliage.castShadow = true
  tree.add(foliage)
  tree.position.set(x, 0, z)
  return tree
}

const trees = new THREE.Group()
trees.add(createTree(-6, -2, 1.2))
trees.add(createTree(5, -3, 1.1))
trees.add(createTree(4, 3, 0.9))
scene.add(trees)

// Small details: barrels, crates repeated
const barrelGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.4, 12)
const barrelMat = new THREE.MeshStandardMaterial({ color: '#7b4f2b' })
const details = new THREE.Group()
const b1 = new THREE.Mesh(barrelGeo, barrelMat); b1.position.set(2.6, 0.2, -0.6); b1.castShadow = true; details.add(b1)
const b2 = b1.clone(); b2.position.set(1.8, 0.2, 0.6); details.add(b2)
scene.add(details)

// GUI toggles for ambience
const params = { fog: true, lanternIntensity: 1.2 }
const envFolder = gui.addFolder('Environment')
envFolder.add(params, 'fog').name('Fog').onChange(v => { scene.fog = v ? new THREE.Fog('#cbd3d1', 8, 25) : null })
envFolder.add(params, 'lanternIntensity', 0, 2, 0.01).name('Lantern').onChange(v => { lanternLight.intensity = v; lanternMat.emissiveIntensity = v })
envFolder.open()

// Animation clock
const clock = new THREE.Clock()

// Simple animation: flicker lantern and window pulse, and pulley rotate
let pulleyRotation = 0

function tick() {
  const t = clock.getElapsedTime()

  // Soft pulse for window emissive
  const winPulse = 0.9 + Math.sin(t * 2.2) * 0.12
  cottages.children.forEach(c => {
    const win = c.children.find(ch => ch.geometry && ch.geometry.type === 'PlaneGeometry' && ch.material && ch.material.emissive)
    if (win) win.material.emissiveIntensity = winPulse
  })

  // Lantern flicker
  lanternLight.intensity = params.lanternIntensity + Math.sin(t * 8) * 0.12
  lanternMat.emissiveIntensity = params.lanternIntensity + Math.sin(t * 8) * 0.12

  // Pulley rotation (on well)
  pulleyRotation += 0.02
  // find pulley if exists
  well.children.forEach(child => { if (child.geometry && child.geometry.type === 'CylinderGeometry' && child.geometry.parameters.radiusTop === 0.08) child.rotation.x = pulleyRotation })

  controls.update()
  renderer.render(scene, camera)
  window.requestAnimationFrame(tick)
}

// Start
tick()
