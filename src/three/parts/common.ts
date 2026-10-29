import * as THREE from 'three';
import type { ComponentId, LayerId, PartHandle } from '../../app/types';
import { LAYER_COLORS, LAYER_SOFT, PALETTE } from '../palette';
import { mat, brass, graphite } from '../materials';
import { mesh, roundedBoxGeo, cylGeo } from '../shapes';

export interface PartCtx {
  id: ComponentId;
  layer: LayerId;
  color: string;
  soft: string;
  mats: {
    body: THREE.MeshStandardMaterial;
    soft: THREE.MeshStandardMaterial;
    graphite: THREE.MeshStandardMaterial;
    brass: THREE.MeshStandardMaterial;
    cream: THREE.MeshStandardMaterial;
  };
}

export function makeCtx(id: ComponentId, layer: LayerId): PartCtx {
  const color = LAYER_COLORS[layer];
  const soft = LAYER_SOFT[layer];
  return {
    id,
    layer,
    color,
    soft,
    mats: {
      body: mat(color, { roughness: 0.5 }),
      soft: mat(soft, { roughness: 0.6 }),
      graphite: graphite(),
      brass: brass(),
      cream: mat(PALETTE.cream, { roughness: 0.7 }),
    },
  };
}

export interface PartBuild {
  group: THREE.Group;
  shell: THREE.Mesh[];
  update: (dt: number, t: number) => void;
  radius: number;
  port?: THREE.Vector3;
}

export function finalize(ctx: PartCtx, b: PartBuild, basePosition: THREE.Vector3): PartHandle {
  b.group.position.copy(basePosition);
  b.group.traverse((o) => {
    o.userData.partId = ctx.id;
  });
  return {
    id: ctx.id,
    group: b.group,
    shell: b.shell,
    update: b.update,
    radius: b.radius,
    port: b.port ?? new THREE.Vector3(0, 1.2, 0),
    basePosition: basePosition.clone(),
    layer: ctx.layer,
  };
}

/** A standard machine pedestal / base plate with rounded corners and 4 little feet */
export function pedestal(ctx: PartCtx, w: number, d: number, h = 0.35): THREE.Mesh {
  const base = mesh(roundedBoxGeo(w, h, d, 0.12), ctx.mats.graphite, [0, h / 2, 0]);
  const footMat = ctx.mats.brass;
  const fx = w / 2 - 0.3;
  const fz = d / 2 - 0.3;
  for (const [x, z] of [
    [fx, fz],
    [-fx, fz],
    [fx, -fz],
    [-fx, -fz],
  ]) {
    base.add(mesh(cylGeo(0.12, 0.12, 0.08, 12), footMat, [x, h / 2 + 0.04, z]));
  }
  return base;
}

/** small rivet dots on a surface */
export function rivets(parent: THREE.Object3D, m: THREE.Material, positions: [number, number, number][], r = 0.05) {
  for (const p of positions) parent.add(mesh(cylGeo(r, r, 0.04, 8), m, p, { rot: [Math.PI / 2, 0, 0], shadow: false }));
}
