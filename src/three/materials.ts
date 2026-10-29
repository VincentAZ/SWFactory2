import * as THREE from 'three';
import { PALETTE } from './palette';

export interface MatOpts {
  roughness?: number;
  metalness?: number;
  emissive?: string;
  emissiveIntensity?: number;
  transparent?: boolean;
  opacity?: number;
  flat?: boolean;
  side?: THREE.Side;
}

/** Create a fresh standard material (each part owns its materials so they can be ghosted/highlighted independently). */
export function mat(color: string, o: MatOpts = {}): THREE.MeshStandardMaterial {
  const m = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness: o.roughness ?? 0.55,
    metalness: o.metalness ?? 0.05,
    flatShading: o.flat ?? false,
    transparent: o.transparent ?? false,
    opacity: o.opacity ?? 1,
    side: o.side ?? THREE.FrontSide,
  });
  if (o.emissive) {
    m.emissive = new THREE.Color(o.emissive);
    m.emissiveIntensity = o.emissiveIntensity ?? 0.6;
  }
  return m;
}

export function glassMat(color = PALETTE.glass, opacity = 0.35): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    roughness: 0.15,
    metalness: 0,
    transparent: true,
    opacity,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

export function brass(): THREE.MeshStandardMaterial {
  return mat(PALETTE.brass, { roughness: 0.35, metalness: 0.6 });
}

export function graphite(): THREE.MeshStandardMaterial {
  return mat(PALETTE.graphite, { roughness: 0.6, metalness: 0.2 });
}

export function glow(color: string, intensity = 1): THREE.MeshBasicMaterial {
  const c = new THREE.Color(color).multiplyScalar(intensity * 1.6);
  const m = new THREE.MeshBasicMaterial({ color: c });
  m.toneMapped = false;
  return m;
}

/** Shared ghost material used when a component is dimmed. */
export const GHOST_MATERIAL = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#b8b3a8'),
  roughness: 0.9,
  metalness: 0,
  transparent: true,
  opacity: 0.13,
  depthWrite: false,
});

export const XRAY_MATERIAL = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color('#9fb4c8'),
  roughness: 0.2,
  metalness: 0,
  transparent: true,
  opacity: 0.16,
  depthWrite: false,
  side: THREE.DoubleSide,
});
