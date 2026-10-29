import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { PALETTE } from './palette';
import { stepTweens, tween, easeInOutCubic, clamp } from './tween';
import type { ViewPreset, Quality } from '../app/store';

export interface SceneContext {
  renderer: THREE.WebGLRenderer;
  labelRenderer: CSS2DRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  composer: EffectComposer;
  bloom: UnrealBloomPass;
  sun: THREE.DirectionalLight;
  clock: THREE.Clock;
  container: HTMLElement;
  /** per-frame callbacks */
  onFrame: Set<(dt: number, t: number) => void>;
  /** move camera smoothly to a target & position */
  flyTo: (target: THREE.Vector3, position: THREE.Vector3, duration?: number) => void;
  /** frame a sphere */
  frame: (center: THREE.Vector3, radius: number, opts?: { azimuth?: number; elevation?: number; duration?: number }) => void;
  preset: (view: ViewPreset, center?: THREE.Vector3) => void;
  setQuality: (q: Quality) => void;
  /** shift the rendered centre so the machine sits between open side panels (pixels) */
  setViewOffset: (x: number, y: number) => void;
  setReduceMotion: (v: boolean) => void;
  fps: () => number;
  dispose: () => void;
}

export const WORLD_CENTER = new THREE.Vector3(0, 0, 0);
export const WORLD_RADIUS = 21;

export function createScene(container: HTMLElement): SceneContext {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance', stencil: false });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(PALETTE.background, 1);
  container.appendChild(renderer.domElement);
  renderer.domElement.classList.add('gl-canvas');

  const labelRenderer = new CSS2DRenderer();
  labelRenderer.domElement.className = 'label-layer';
  container.appendChild(labelRenderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(PALETTE.background);
  scene.fog = new THREE.Fog(PALETTE.fog, 95, 190);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.45;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 300);
  camera.position.set(-22, 20, 30);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.minDistance = 3;
  controls.maxDistance = 90;
  controls.target.set(0, 1, 0);
  controls.zoomSpeed = 0.9;
  controls.rotateSpeed = 0.7;

  // Lighting: warm key, cool fill, sky hemisphere
  const hemi = new THREE.HemisphereLight('#ffffff', '#cbbfae', 0.5);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff4e3', 1.6);
  sun.position.set(-18, 32, 14);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 90;
  sun.shadow.camera.left = -26;
  sun.shadow.camera.right = 26;
  sun.shadow.camera.top = 26;
  sun.shadow.camera.bottom = -26;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  sun.shadow.radius = 3;
  scene.add(sun);
  const fill = new THREE.DirectionalLight('#dfe9ff', 0.45);
  fill.position.set(24, 14, -18);
  scene.add(fill);

  // Post-processing
  const size = new THREE.Vector2();
  renderer.getSize(size);
  const target = new THREE.WebGLRenderTarget(1, 1, { samples: 4, type: THREE.HalfFloatType });
  const composer = new EffectComposer(renderer, target);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.5, 0.45, 1.2);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  const clock = new THREE.Clock();
  const onFrame = new Set<(dt: number, t: number) => void>();

  let quality: Quality = 'auto';
  let reduceMotion = false;
  let dprCap = 1.75;
  let bloomEnabled = true;

  function applyQuality() {
    const base = Math.min(window.devicePixelRatio || 1, dprCap);
    renderer.setPixelRatio(base);
    composer.setPixelRatio(base);
    bloom.enabled = bloomEnabled;
    renderer.shadowMap.enabled = quality !== 'low';
    sun.castShadow = quality !== 'low';
    resize();
  }

  function setQuality(q: Quality) {
    quality = q;
    if (q === 'high') {
      dprCap = 2;
      bloomEnabled = true;
    } else if (q === 'balanced') {
      dprCap = 1.25;
      bloomEnabled = true;
    } else if (q === 'low') {
      dprCap = 1;
      bloomEnabled = false;
    } else {
      dprCap = 1.75;
      bloomEnabled = true;
    }
    applyQuality();
  }

  let viewOffsetX = 0;
  let viewOffsetY = 0;
  function setViewOffset(x: number, y: number) {
    viewOffsetX = x;
    viewOffsetY = y;
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;
    camera.setViewOffset(w, h, x, y, w, h);
    camera.updateProjectionMatrix();
  }
  function resize() {
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;
    camera.aspect = w / h;
    camera.setViewOffset(w, h, viewOffsetX, viewOffsetY, w, h);
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    labelRenderer.setSize(w, h);
    bloom.setSize(w, h);
  }
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();
  applyQuality();

  // adaptive quality: watch frame times
  const frameTimes: number[] = [];
  let fpsValue = 60;
  let adaptCooldown = 0;

  function flyTo(targetPos: THREE.Vector3, camPos: THREE.Vector3, duration = 1.1) {
    const t0 = controls.target.clone();
    const c0 = camera.position.clone();
    const d = reduceMotion ? 0.001 : duration;
    tween(
      d,
      (k) => {
        controls.target.lerpVectors(t0, targetPos, k);
        camera.position.lerpVectors(c0, camPos, k);
      },
      { ease: easeInOutCubic, tag: 'camera' },
    );
  }

  function frame(center: THREE.Vector3, radius: number, opts: { azimuth?: number; elevation?: number; duration?: number } = {}) {
    const az = opts.azimuth ?? Math.atan2(camera.position.x - controls.target.x, camera.position.z - controls.target.z);
    const el = opts.elevation ?? 0.55;
    const fov = THREE.MathUtils.degToRad(camera.fov);
    const aspectFix = camera.aspect < 1 ? 1 / camera.aspect : 1;
    const dist = clamp((radius * 1.25 * aspectFix) / Math.sin(fov / 2), controls.minDistance + 1, controls.maxDistance);
    const pos = new THREE.Vector3(
      center.x + Math.sin(az) * Math.cos(el) * dist,
      center.y + Math.sin(el) * dist,
      center.z + Math.cos(az) * Math.cos(el) * dist,
    );
    flyTo(center.clone(), pos, opts.duration);
  }

  function preset(view: ViewPreset, center: THREE.Vector3 = new THREE.Vector3(0, 1.2, 0)) {
    switch (view) {
      case 'overview':
        frame(center, WORLD_RADIUS, { azimuth: -0.55, elevation: 0.58 });
        break;
      case 'top':
        frame(center, WORLD_RADIUS * 0.95, { azimuth: -0.01, elevation: 1.48 });
        break;
      case 'front':
        frame(center, WORLD_RADIUS, { azimuth: 0, elevation: 0.28 });
        break;
      case 'side':
        frame(center, WORLD_RADIUS, { azimuth: Math.PI / 2, elevation: 0.35 });
        break;
      case 'closeup':
        frame(center, 6, { elevation: 0.45 });
        break;
    }
  }

  let running = true;
  let rafId = 0;
  function loop() {
    rafId = requestAnimationFrame(loop);
    if (!running) return;
    const raw = clock.getDelta();
    const dt = Math.min(raw, 0.05); // simulation delta (clamped so slow frames don't jump)
    const t = clock.elapsedTime;
    stepTweens(Math.min(raw, 0.3)); // camera/UI tweens follow real time
    controls.update();
    for (const fn of onFrame) fn(dt, t);
    composer.render();
    labelRenderer.render(scene, camera);

    // fps estimate + adaptive quality
    frameTimes.push(dt);
    if (frameTimes.length > 90) frameTimes.shift();
    if (frameTimes.length === 90) {
      const avg = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
      fpsValue = 1 / avg;
      adaptCooldown -= dt;
      if (quality === 'auto' && adaptCooldown <= 0) {
        if (fpsValue < 38 && dprCap > 1) {
          dprCap = Math.max(1, dprCap - 0.35);
          applyQuality();
          adaptCooldown = 4;
        } else if (fpsValue < 28 && bloomEnabled) {
          bloomEnabled = false;
          applyQuality();
          adaptCooldown = 6;
        }
      }
    }
  }
  loop();

  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) clock.getDelta();
  });

  return {
    renderer,
    labelRenderer,
    scene,
    camera,
    controls,
    composer,
    bloom,
    sun,
    clock,
    container,
    onFrame,
    flyTo,
    frame,
    preset,
    setQuality,
    setViewOffset,
    setReduceMotion: (v) => (reduceMotion = v),
    fps: () => fpsValue,
    dispose: () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      renderer.dispose();
    },
  };
}
