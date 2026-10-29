import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const geoCache = new Map<string, THREE.BufferGeometry>();

function cached<T extends THREE.BufferGeometry>(key: string, make: () => T): T {
  let g = geoCache.get(key) as T | undefined;
  if (!g) {
    g = make();
    geoCache.set(key, g);
  }
  return g;
}

export function roundedBoxGeo(w: number, h: number, d: number, r = 0.12, seg = 3) {
  return cached(`rb:${w}:${h}:${d}:${r}:${seg}`, () => new RoundedBoxGeometry(w, h, d, seg, r));
}

export function boxGeo(w: number, h: number, d: number) {
  return cached(`b:${w}:${h}:${d}`, () => new THREE.BoxGeometry(w, h, d));
}

export function cylGeo(rt: number, rb: number, h: number, seg = 32, open = false) {
  return cached(`c:${rt}:${rb}:${h}:${seg}:${open}`, () => new THREE.CylinderGeometry(rt, rb, h, seg, 1, open));
}

export function sphereGeo(r: number, w = 24, h = 16) {
  return cached(`s:${r}:${w}:${h}`, () => new THREE.SphereGeometry(r, w, h));
}

export function torusGeo(r: number, t: number, rs = 12, ts = 48) {
  return cached(`t:${r}:${t}:${rs}:${ts}`, () => new THREE.TorusGeometry(r, t, rs, ts));
}

export function capsuleGeo(r: number, len: number, cs = 4, rs = 12) {
  return cached(`cap:${r}:${len}:${cs}:${rs}`, () => new THREE.CapsuleGeometry(r, len, cs, rs));
}

export function coneGeo(r: number, h: number, seg = 24) {
  return cached(`cone:${r}:${h}:${seg}`, () => new THREE.ConeGeometry(r, h, seg));
}

export function icoGeo(r: number, detail = 0) {
  return cached(`ico:${r}:${detail}`, () => new THREE.IcosahedronGeometry(r, detail));
}

export function octGeo(r: number, detail = 0) {
  return cached(`oct:${r}:${detail}`, () => new THREE.OctahedronGeometry(r, detail));
}

/** Gear with teeth, extruded along Z. Lies in XY plane; rotate as needed. */
export function gearGeo(radius: number, teeth: number, thickness: number, toothDepth = radius * 0.18) {
  return cached(`gear:${radius}:${teeth}:${thickness}:${toothDepth}`, () => {
    const shape = new THREE.Shape();
    const inner = radius - toothDepth;
    const steps = teeth * 4;
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      const phase = i % 4;
      const r = phase === 0 || phase === 1 ? radius : inner;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    const hole = new THREE.Path();
    hole.absarc(0, 0, radius * 0.22, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: thickness,
      bevelEnabled: true,
      bevelThickness: thickness * 0.15,
      bevelSize: thickness * 0.15,
      bevelSegments: 2,
      curveSegments: 4,
    });
    g.center();
    return g;
  });
}

export function mesh(
  geo: THREE.BufferGeometry,
  material: THREE.Material,
  pos: [number, number, number] = [0, 0, 0],
  opts: { rot?: [number, number, number]; scale?: [number, number, number]; shadow?: boolean; receive?: boolean } = {},
): THREE.Mesh {
  const m = new THREE.Mesh(geo, material);
  m.position.set(...pos);
  if (opts.rot) m.rotation.set(...opts.rot);
  if (opts.scale) m.scale.set(...opts.scale);
  m.castShadow = opts.shadow ?? true;
  m.receiveShadow = opts.receive ?? true;
  return m;
}

/** A tiny stylized person: capsule body + sphere head. */
export function person(bodyMat: THREE.Material, headMat: THREE.Material, h = 1): THREE.Group {
  const g = new THREE.Group();
  const body = mesh(capsuleGeo(0.22 * h, 0.4 * h), bodyMat, [0, 0.42 * h, 0]);
  const head = mesh(sphereGeo(0.19 * h), headMat, [0, 0.92 * h, 0]);
  g.add(body, head);
  return g;
}

/** Lat/long wire globe */
export function wireGlobe(r: number, color: string): THREE.LineSegments {
  const geo = new THREE.SphereGeometry(r, 16, 10);
  const edges = new THREE.EdgesGeometry(geo, 1);
  const m = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.55 });
  return new THREE.LineSegments(edges, m);
}

export function ring(rInner: number, rOuter: number, color: string, opacity = 0.9): THREE.Mesh {
  const g = cached(`ring:${rInner}:${rOuter}`, () => new THREE.RingGeometry(rInner, rOuter, 48));
  const m = new THREE.MeshBasicMaterial({ color, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false });
  const r = new THREE.Mesh(g, m);
  r.rotation.x = -Math.PI / 2;
  return r;
}

/** A small flat label plate (box) with a colored stripe */
export function plate(w: number, h: number, mat: THREE.Material, stripe?: THREE.Material): THREE.Group {
  const g = new THREE.Group();
  g.add(mesh(roundedBoxGeo(w, h, 0.08, 0.03), mat, [0, 0, 0]));
  if (stripe) g.add(mesh(boxGeo(w * 0.6, h * 0.22, 0.02), stripe, [-w * 0.12, 0, 0.05]));
  return g;
}
