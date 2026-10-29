import * as THREE from 'three';
import type { ComponentId, LayerId, PartHandle } from '../app/types';
import { LAYOUT, PLATFORM_SIZE, LAYER_ORDER, layoutPosition, PLATFORM_SCALE } from './layout';
import { buildUsers, buildFrontend } from './parts/clientParts';
import { buildDnsCdn, buildSecurity, buildLoadBalancer, buildApiGateway, buildAuth } from './parts/edgeParts';
import { buildBackend, buildDatabase, buildCache, buildStorage, buildQueue, buildAi, buildThirdParty } from './parts/appParts';
import { buildObservability, buildCicd, buildInfra } from './parts/platformParts';
import { PipeSystem } from './pipes';
import { PacketSystem } from './packets';
import { LabelSystem } from './labels';
import { GHOST_MATERIAL, XRAY_MATERIAL } from './materials';
import { LAYER_COLORS } from './palette';
import { ring } from './shapes';
import { tween, easeOutBack, damp } from './tween';

const CENTER = new THREE.Vector3(0, 0, 2.2);

interface PartState {
  ghost: boolean;
  hidden: boolean;
  spotlight: boolean;
  target: THREE.Vector3;
  hoverRing: THREE.Mesh;
  selectRing: THREE.Mesh;
  spotRing: THREE.Mesh;
  hoverK: number;
  selectK: number;
  spotK: number;
  level: number;
  pulse: number;
}

export class Machine {
  readonly root = new THREE.Group();
  readonly parts = new Map<ComponentId, PartHandle>();
  readonly pipes: PipeSystem;
  readonly packets: PacketSystem;
  readonly labels: LabelSystem;
  private states = new Map<ComponentId, PartState>();
  private explode = 0;
  private xray = false;
  private selected: ComponentId | null = null;
  private hovered: ComponentId | null = null;
  private complexity = 1;
  private moving = true;

  constructor(names: Record<ComponentId, string>, levels: Record<ComponentId, number>) {
    const v = (id: ComponentId) => new THREE.Vector3(...LAYOUT[id].pos);
    const built: PartHandle[] = [
      buildInfra(v('infra'), PLATFORM_SIZE),
      buildUsers(v('users')),
      buildFrontend(v('frontend')),
      buildDnsCdn(v('dns-cdn')),
      buildSecurity(v('security')),
      buildLoadBalancer(v('load-balancer')),
      buildApiGateway(v('api-gateway')),
      buildAuth(v('auth')),
      buildBackend(v('backend')),
      buildDatabase(v('database')),
      buildCache(v('cache')),
      buildStorage(v('storage')),
      buildQueue(v('queue')),
      buildAi(v('ai')),
      buildThirdParty(v('third-party')),
      buildObservability(v('observability')),
      buildCicd(v('cicd')),
    ];
    for (const p of built) {
      this.parts.set(p.id, p);
      this.root.add(p.group);
      // store original materials
      p.group.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) {
          const m = o as THREE.Mesh;
          m.userData.origMat = m.material;
          m.userData.origCast = m.castShadow;
        }
      });
      const color = LAYER_COLORS[p.layer];
      const r = p.id === 'infra' ? 0 : p.radius * 0.78;
      const hoverRing = ring(r * 0.92, r, color, 0);
      const selectRing = ring(r * 1.02, r * 1.1, color, 0);
      const spotRing = ring(r * 1.14, r * 1.2, '#ffb703', 0);
      hoverRing.position.y = 0.09;
      selectRing.position.y = 0.1;
      spotRing.position.y = 0.11;
      hoverRing.renderOrder = selectRing.renderOrder = spotRing.renderOrder = 1;
      hoverRing.visible = selectRing.visible = spotRing.visible = p.id !== 'infra';
      p.group.add(hoverRing, selectRing, spotRing);
      this.states.set(p.id, {
        ghost: false,
        hidden: false,
        spotlight: false,
        target: p.basePosition.clone(),
        hoverRing,
        selectRing,
        spotRing,
        hoverK: 0,
        selectK: 0,
        spotK: 0,
        level: levels[p.id],
        pulse: 0,
      });
    }
    this.pipes = new PipeSystem(this.parts);
    this.root.add(this.pipes.group);
    this.packets = new PacketSystem(this.pipes);
    this.root.add(this.packets.mesh, this.packets.trailMesh);
    this.labels = new LabelSystem(this.parts, names);
  }

  pickables(): THREE.Object3D[] {
    return [...this.parts.values()].map((p) => p.group);
  }

  /** Where a component is (or is gliding to): used for camera framing */
  worldPosition(id: ComponentId): THREE.Vector3 {
    const p = this.parts.get(id)!;
    const pos = this.states.get(id)!.target.clone();
    pos.y += id === 'infra' ? 0.5 : p.radius * 0.5;
    return pos;
  }

  /** Jump every part to its target position immediately (used at boot) */
  snap() {
    for (const [id, s] of this.states) {
      const part = this.parts.get(id)!;
      part.group.position.copy(s.target);
      if (id === 'infra') part.group.scale.copy(this.platformScale);
    }
    this.pipes.rebuild();
    this.moving = false;
  }

  radiusOf(id: ComponentId): number {
    return this.parts.get(id)!.radius;
  }

  visibleIds(): ComponentId[] {
    return [...this.states.entries()].filter(([, s]) => !s.hidden).map(([id]) => id);
  }

  isVisible(id: ComponentId): boolean {
    return !this.states.get(id)!.hidden;
  }

  // ---- visibility by complexity ------------------------------------------------
  setComplexity(level: number) {
    this.complexity = level;
    for (const [id, s] of this.states) {
      const show = s.level <= level;
      if (show === !s.hidden) continue;
      const part = this.parts.get(id)!;
      s.hidden = !show;
      if (show) {
        part.group.visible = true;
        part.group.scale.setScalar(0.01);
        tween(0.7, (k) => part.group.scale.setScalar(0.01 + 0.99 * k), { ease: easeOutBack, tag: `scale-${id}` });
      } else {
        tween(0.35, (k) => part.group.scale.setScalar(1 - 0.99 * k), {
          tag: `scale-${id}`,
          done: () => {
            part.group.visible = false;
          },
        });
      }
      this.labels.setState(id, { hidden: !show });
    }
    this.pipes.setLevel(level);
    this.pipes.setHidden(new Set([...this.states.entries()].filter(([, s]) => s.hidden).map(([id]) => id)));
    this.computeTargets();
  }

  get currentComplexity() {
    return this.complexity;
  }

  // ---- ghosting / isolate / spotlight ------------------------------------------
  /** Ghost everything not in `keep` (pass null to clear ghosting) */
  setGhosted(ghosted: Set<ComponentId>) {
    for (const [id, s] of this.states) {
      s.ghost = ghosted.has(id);
      this.applyMaterials(id);
      this.labels.setState(id, { ghost: s.ghost });
    }
    this.pipes.setGhosted(ghosted);
  }

  setSpotlight(ids: Set<ComponentId>) {
    for (const [id, s] of this.states) s.spotlight = ids.has(id);
  }

  setBadges(badges: Partial<Record<ComponentId, string>>) {
    for (const id of this.states.keys()) this.labels.setState(id, { badge: badges[id] ?? null });
  }

  setXray(on: boolean) {
    this.xray = on;
    for (const id of this.states.keys()) this.applyMaterials(id);
  }

  private applyMaterials(id: ComponentId) {
    const part = this.parts.get(id)!;
    const s = this.states.get(id)!;
    const shellSet = new Set(part.shell);
    part.group.userData.ghost = s.ghost;
    part.group.traverse((o) => {
      o.userData.ghost = s.ghost;
      const m = o as THREE.Mesh;
      if (!m.isMesh || !m.userData.origMat) return;
      if (s.ghost) {
        m.material = GHOST_MATERIAL;
        m.castShadow = false;
      } else if (this.xray && shellSet.has(m) && id !== 'infra') {
        m.material = XRAY_MATERIAL;
        m.castShadow = false;
      } else {
        m.material = m.userData.origMat;
        m.castShadow = m.userData.origCast;
      }
      if ((o as THREE.LineSegments).isLineSegments) o.visible = !s.ghost;
    });
    if (s.ghost) {
      part.group.traverse((o) => {
        if ((o as THREE.LineSegments).isLineSegments) o.visible = false;
      });
    }
  }

  // ---- selection ---------------------------------------------------------------
  setSelected(id: ComponentId | null) {
    this.selected = id;
    for (const sid of this.states.keys()) this.labels.setState(sid, { active: sid === id });
  }
  setHovered(id: ComponentId | null) {
    this.hovered = id;
    for (const sid of this.states.keys()) this.labels.setState(sid, { hover: sid === id });
  }

  /** brief pulse on a component (used when a packet arrives) */
  pulse(id: ComponentId) {
    const s = this.states.get(id);
    if (s) s.pulse = 1;
  }

  // ---- explode -----------------------------------------------------------------
  setExplode(e: number) {
    this.explode = e;
    this.computeTargets();
  }

  private platformScale = new THREE.Vector3(1, 1, 1);

  private computeTargets() {
    const [sx, sz] = PLATFORM_SCALE[this.complexity] ?? [1, 1];
    this.platformScale.set(sx, 1, sz);
    for (const [id, s] of this.states) {
      const part = this.parts.get(id)!;
      const base = layoutPosition(id, this.complexity);
      part.basePosition.copy(base);
      if (id === 'infra') {
        s.target.set(base.x, base.y - this.explode * 2.5, base.z);
        continue;
      }
      const dir = new THREE.Vector3(base.x - CENTER.x, 0, base.z - CENTER.z);
      const len = dir.length() || 1;
      dir.divideScalar(len);
      const layerIndex = LAYER_ORDER.indexOf(part.layer);
      s.target.set(
        base.x + dir.x * this.explode * (2.5 + len * 0.18),
        base.y + this.explode * (1.5 + layerIndex * 2.4),
        base.z + dir.z * this.explode * (2.5 + len * 0.18),
      );
    }
    this.moving = true;
  }

  layerOf(id: ComponentId): LayerId {
    return this.parts.get(id)!.layer;
  }

  // ---- frame update ------------------------------------------------------------
  update(dt: number, t: number) {
    let anyMoved = false;
    for (const [id, s] of this.states) {
      const part = this.parts.get(id)!;
      if (!s.hidden || this.moving) {
        const g = part.group;
        const d = g.position.distanceToSquared(s.target);
        if (d > 1e-6) {
          g.position.x = damp(g.position.x, s.target.x, 6, dt);
          g.position.y = damp(g.position.y, s.target.y, 6, dt);
          g.position.z = damp(g.position.z, s.target.z, 6, dt);
          anyMoved = true;
        }
        if (id === 'infra' && g.scale.distanceToSquared(this.platformScale) > 1e-6) {
          g.scale.x = damp(g.scale.x, this.platformScale.x, 6, dt);
          g.scale.z = damp(g.scale.z, this.platformScale.z, 6, dt);
          anyMoved = true;
        }
      }
      if (s.hidden) continue;
      part.update(dt, t);
      // rings
      const hoverTarget = this.hovered === id && this.selected !== id ? 1 : 0;
      const selTarget = this.selected === id ? 1 : 0;
      const spotTarget = s.spotlight ? 1 : 0;
      s.hoverK = damp(s.hoverK, hoverTarget, 12, dt);
      s.selectK = damp(s.selectK, selTarget, 10, dt);
      s.spotK = damp(s.spotK, spotTarget, 8, dt);
      s.pulse = Math.max(0, s.pulse - dt * 2.2);
      (s.hoverRing.material as THREE.MeshBasicMaterial).opacity = s.hoverK * 0.55 + s.pulse * 0.6;
      s.hoverRing.scale.setScalar(1 + s.pulse * 0.25);
      (s.selectRing.material as THREE.MeshBasicMaterial).opacity = s.selectK * 0.9;
      s.selectRing.rotation.z = t * 0.6;
      (s.spotRing.material as THREE.MeshBasicMaterial).opacity = s.spotK * (0.55 + Math.sin(t * 4) * 0.3);
      s.spotRing.rotation.z = -t * 0.4;
    }
    if (anyMoved) this.pipes.rebuild();
    else this.moving = false;
    this.packets.update(dt);
  }
}
