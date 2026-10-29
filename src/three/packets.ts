import * as THREE from 'three';
import type { PacketKind, ComponentId } from '../app/types';
import { PACKET_COLORS } from './palette';
import type { PipeSystem, RouteSeg } from './pipes';

interface Packet {
  route: RouteSeg[];
  seg: number;
  t: number;
  speed: number; // segments per second (per-segment uniform time)
  color: THREE.Color;
  size: number;
  onDone?: () => void;
  onHop?: (node: ComponentId) => void;
  from: ComponentId;
}

const MAX = 400;

export class PacketSystem {
  readonly mesh: THREE.InstancedMesh;
  readonly trailMesh: THREE.InstancedMesh;
  private packets: Packet[] = [];
  private pipes: PipeSystem;
  private dummy = new THREE.Object3D();
  private tmp = new THREE.Vector3();
  ambient = true;
  ambientRate = 0.45; // packets per second
  private ambientAcc = 0;
  private ambientKinds: PacketKind[] = ['request', 'response', 'request', 'data', 'response', 'event'];

  constructor(pipes: PipeSystem) {
    this.pipes = pipes;
    const geo = new THREE.SphereGeometry(0.17, 12, 10);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    mat.toneMapped = false;
    this.mesh = new THREE.InstancedMesh(geo, mat, MAX);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.count = 0;
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 3;

    const trailGeo = new THREE.SphereGeometry(0.1, 8, 6);
    const trailMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45 });
    trailMat.toneMapped = false;
    this.trailMesh = new THREE.InstancedMesh(trailGeo, trailMat, MAX * 2);
    this.trailMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.trailMesh.count = 0;
    this.trailMesh.frustumCulled = false;
  }

  get active(): number {
    return this.packets.length;
  }

  /**
   * Send packets along a route. Resolves when the last packet arrives.
   */
  send(
    from: ComponentId,
    route: RouteSeg[],
    kind: PacketKind,
    opts: { count?: number; duration?: number; stagger?: number; size?: number; onHop?: (node: ComponentId) => void } = {},
  ): Promise<void> {
    const count = opts.count ?? 3;
    const stagger = opts.stagger ?? 0.18;
    const duration = opts.duration ?? Math.max(0.9, route.length * 0.75);
    const speed = route.length / duration; // segments per second
    const color = new THREE.Color(PACKET_COLORS[kind]).multiplyScalar(2.4);
    return new Promise((resolve) => {
      if (route.length === 0) {
        resolve();
        return;
      }
      for (let i = 0; i < count; i++) {
        const last = i === count - 1;
        this.packets.push({
          route,
          seg: 0,
          t: -i * stagger * speed, // negative t = delayed start
          speed,
          color,
          size: opts.size ?? (kind === 'stream' ? 0.7 : 1),
          onDone: last ? resolve : undefined,
          onHop: i === 0 ? opts.onHop : undefined,
          from,
        });
      }
    });
  }

  clear() {
    for (const p of this.packets) p.onDone?.();
    this.packets = [];
  }

  private spawnAmbient() {
    const visible = [...this.pipes.pipes.values()].filter((p) => p.visible && p.def.style !== 'secondary');
    if (!visible.length) return;
    const e = visible[Math.floor(Math.random() * visible.length)];
    const reverse = Math.random() < 0.45;
    const kind = this.ambientKinds[Math.floor(Math.random() * this.ambientKinds.length)];
    const color = new THREE.Color(PACKET_COLORS[reverse && kind === 'request' ? 'response' : kind]).multiplyScalar(2.0);
    this.packets.push({
      route: [{ pipeId: e.def.id, reverse }],
      seg: 0,
      t: 0,
      speed: 0.45 + Math.random() * 0.3,
      color,
      size: 0.6 + Math.random() * 0.3,
      from: reverse ? e.def.to : e.def.from,
    });
  }

  update(dt: number) {
    if (this.ambient) {
      this.ambientAcc += dt * this.ambientRate;
      while (this.ambientAcc >= 1) {
        this.ambientAcc -= 1;
        if (this.packets.length < MAX - 20) this.spawnAmbient();
      }
    }
    let n = 0;
    let tn = 0;
    const done: Packet[] = [];
    for (const p of this.packets) {
      p.t += p.speed * dt;
      if (p.t < 0) continue; // delayed
      while (p.t >= 1 && p.seg < p.route.length) {
        p.t -= 1;
        p.seg++;
        if (p.seg < p.route.length && p.onHop) {
          const def = this.pipes.pipes.get(p.route[p.seg - 1].pipeId)!.def;
          p.onHop(p.route[p.seg - 1].reverse ? def.from : def.to);
        }
      }
      if (p.seg >= p.route.length) {
        done.push(p);
        continue;
      }
      const seg = p.route[p.seg];
      const curve = this.pipes.curveOf(seg.pipeId);
      const u = seg.reverse ? 1 - p.t : p.t;
      const pos = curve.getPointAt(THREE.MathUtils.clamp(u, 0, 1), this.tmp);
      this.dummy.position.copy(pos);
      const pulse = 1 + Math.sin(p.t * Math.PI) * 0.25;
      this.dummy.scale.setScalar(p.size * pulse);
      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(n, this.dummy.matrix);
      this.mesh.setColorAt(n, p.color);
      n++;
      // trail: two faint spheres behind
      for (let k = 1; k <= 2; k++) {
        const ut = THREE.MathUtils.clamp(u + (seg.reverse ? 1 : -1) * k * 0.035, 0, 1);
        curve.getPointAt(ut, this.tmp);
        this.dummy.position.copy(this.tmp);
        this.dummy.scale.setScalar(p.size * (1 - k * 0.3));
        this.dummy.updateMatrix();
        this.trailMesh.setMatrixAt(tn, this.dummy.matrix);
        this.trailMesh.setColorAt(tn, p.color);
        tn++;
      }
      if (n >= MAX) break;
    }
    this.mesh.count = n;
    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
    this.trailMesh.count = tn;
    this.trailMesh.instanceMatrix.needsUpdate = true;
    if (this.trailMesh.instanceColor) this.trailMesh.instanceColor.needsUpdate = true;
    if (done.length) {
      this.packets = this.packets.filter((p) => !done.includes(p));
      for (const p of done) p.onDone?.();
    }
  }
}
