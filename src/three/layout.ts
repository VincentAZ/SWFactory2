import * as THREE from 'three';
import type { ComponentId, LayerId, PipeDef } from '../app/types';

export const LAYOUT: Record<ComponentId, { pos: [number, number, number]; layer: LayerId }> = {
  users: { pos: [-15, 0, 6], layer: 'client' },
  frontend: { pos: [-9.8, 0, 6], layer: 'client' },
  'dns-cdn': { pos: [-10.5, 0, -0.5], layer: 'edge' },
  security: { pos: [-4.6, 0, 3], layer: 'edge' },
  'load-balancer': { pos: [0.2, 0, 3], layer: 'edge' },
  'api-gateway': { pos: [5, 0, 3], layer: 'app' },
  auth: { pos: [5, 0, -3], layer: 'app' },
  backend: { pos: [10.4, 0, 3], layer: 'app' },
  cache: { pos: [10.4, 0, -3], layer: 'data' },
  database: { pos: [15.6, 0, -3], layer: 'data' },
  storage: { pos: [15.6, 0, 3], layer: 'data' },
  queue: { pos: [10.4, 0, 8.6], layer: 'app' },
  ai: { pos: [15.6, 0, 8.6], layer: 'app' },
  'third-party': { pos: [4.6, 0, 8.6], layer: 'app' },
  observability: { pos: [-0.2, 0, -3.8], layer: 'platform' },
  cicd: { pos: [-5.2, 0, -3.8], layer: 'platform' },
  infra: { pos: [0, 0, 2.2], layer: 'platform' },
};

export const PLATFORM_SIZE = { w: 38, d: 20.5 };

/** Compact positions for the Simple level so the four essentials sit close together. */
export const LAYOUT_SIMPLE: Partial<Record<ComponentId, [number, number, number]>> = {
  users: [-8.5, 0, 3.5],
  frontend: [-3, 0, 3.5],
  backend: [4.5, 0, 1.5],
  database: [10.5, 0, -1],
  infra: [0, 0, 1.2],
};

/** Platform scale (x, z) per complexity level: the machine grows as you level up. */
export const PLATFORM_SCALE: Record<number, [number, number]> = {
  1: [0.62, 0.62],
  2: [0.95, 0.95],
  3: [1, 1],
};

export function layoutPosition(id: ComponentId, level: number): THREE.Vector3 {
  const simple = level <= 1 ? LAYOUT_SIMPLE[id] : undefined;
  return new THREE.Vector3(...(simple ?? LAYOUT[id].pos));
}

export const LAYER_ORDER: LayerId[] = ['platform', 'data', 'app', 'edge', 'client'];

export const PIPES: (PipeDef & { maxLevel?: number })[] = [
  { id: 'users-frontend', from: 'users', to: 'frontend', level: 1 },
  { id: 'frontend-backend', from: 'frontend', to: 'backend', level: 1, maxLevel: 1, lift: 2.5 },
  { id: 'frontend-dns', from: 'frontend', to: 'dns-cdn', level: 2 },
  { id: 'dns-gateway', from: 'dns-cdn', to: 'api-gateway', level: 2, maxLevel: 2, lift: 2 },
  { id: 'dns-security', from: 'dns-cdn', to: 'security', level: 3 },
  { id: 'security-lb', from: 'security', to: 'load-balancer', level: 3 },
  { id: 'lb-gateway', from: 'load-balancer', to: 'api-gateway', level: 3 },
  { id: 'gateway-auth', from: 'api-gateway', to: 'auth', level: 2 },
  { id: 'gateway-backend', from: 'api-gateway', to: 'backend', level: 2 },
  { id: 'backend-database', from: 'backend', to: 'database', level: 1, lift: 1.4 },
  { id: 'backend-cache', from: 'backend', to: 'cache', level: 2 },
  { id: 'backend-storage', from: 'backend', to: 'storage', level: 2 },
  { id: 'backend-queue', from: 'backend', to: 'queue', level: 3 },
  { id: 'backend-ai', from: 'backend', to: 'ai', level: 2, lift: 1.6 },
  { id: 'backend-third', from: 'backend', to: 'third-party', level: 2, lift: 1.6 },
  { id: 'queue-ai', from: 'queue', to: 'ai', level: 3 },
  { id: 'storage-dns', from: 'storage', to: 'dns-cdn', level: 2, lift: 3.2 },
  { id: 'auth-database', from: 'auth', to: 'database', level: 2, lift: 1.8 },
  { id: 'cicd-backend', from: 'cicd', to: 'backend', level: 3, lift: 3.6, style: 'secondary' },
  { id: 'cicd-frontend', from: 'cicd', to: 'frontend', level: 3, lift: 2.2, style: 'secondary' },
  { id: 'obs-backend', from: 'observability', to: 'backend', level: 3, lift: 3.0, style: 'secondary' },
  { id: 'obs-database', from: 'observability', to: 'database', level: 3, lift: 3.6, style: 'secondary' },
  { id: 'obs-lb', from: 'observability', to: 'load-balancer', level: 3, lift: 1.2, style: 'secondary' },
  { id: 'users-dns', from: 'users', to: 'dns-cdn', level: 2, lift: 1.5, style: 'secondary' },
];

export function worldCenter(): THREE.Vector3 {
  return new THREE.Vector3(0, 1.2, 2.2);
}
