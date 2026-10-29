import * as THREE from 'three';
import type { ComponentId, PartHandle } from '../app/types';
import { PIPES } from './layout';
import { PALETTE } from './palette';
import { torusGeo } from './shapes';

export interface RouteSeg {
  pipeId: string;
  reverse: boolean;
}

interface PipeEntry {
  def: (typeof PIPES)[number];
  mesh: THREE.Mesh;
  curve: THREE.CatmullRomCurve3;
  flangeA: THREE.Mesh;
  flangeB: THREE.Mesh;
  visible: boolean;
  highlighted: boolean;
  baseOpacity: number;
}

const MAIN_RADIUS = 0.12;
const SECONDARY_RADIUS = 0.07;

export class PipeSystem {
  readonly group = new THREE.Group();
  readonly pipes = new Map<string, PipeEntry>();
  private parts: Map<ComponentId, PartHandle>;
  private level = 1;
  private hidden = new Set<ComponentId>();
  private ghosted = new Set<ComponentId>();
  private highlighted = new Set<string>();
  private flangeGeo = torusGeo(0.2, 0.05, 8, 20);
  private flangeGeoSmall = torusGeo(0.12, 0.035, 8, 16);

  constructor(parts: Map<ComponentId, PartHandle>) {
    this.parts = parts;
    const flangeMat = new THREE.MeshStandardMaterial({ color: PALETTE.brass, roughness: 0.35, metalness: 0.6 });
    for (const def of PIPES) {
      const secondary = def.style === 'secondary';
      const material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(secondary ? '#8e9ab3' : PALETTE.pipe),
        roughness: 0.25,
        metalness: 0.05,
        transparent: true,
        opacity: secondary ? 0.5 : 0.55,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(new THREE.BufferGeometry(), material);
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      mesh.renderOrder = 2;
      mesh.userData.pipeId = def.id;
      const fg = secondary ? this.flangeGeoSmall : this.flangeGeo;
      const flangeA = new THREE.Mesh(fg, flangeMat);
      const flangeB = new THREE.Mesh(fg, flangeMat);
      flangeA.castShadow = flangeB.castShadow = true;
      this.group.add(mesh, flangeA, flangeB);
      this.pipes.set(def.id, {
        def,
        mesh,
        curve: new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]),
        flangeA,
        flangeB,
        visible: true,
        highlighted: false,
        baseOpacity: material.opacity,
      });
    }
    this.rebuild();
  }

  portWorld(id: ComponentId): THREE.Vector3 {
    const p = this.parts.get(id)!;
    return p.group.position.clone().add(p.port);
  }

  /** Recompute curves and tube geometry (called when components move, e.g. exploded view). */
  rebuild() {
    for (const entry of this.pipes.values()) {
      const a0 = this.portWorld(entry.def.from);
      const b0 = this.portWorld(entry.def.to);
      // attach pipes to the edge of each component rather than its center
      const ra = this.parts.get(entry.def.from)!.radius;
      const rb = this.parts.get(entry.def.to)!.radius;
      const dirAB = b0.clone().sub(a0);
      dirAB.y = 0;
      dirAB.normalize();
      const a = entry.def.from === 'infra' ? a0 : a0.clone().addScaledVector(dirAB, ra * 0.5);
      const b = entry.def.to === 'infra' ? b0 : b0.clone().addScaledVector(dirAB, -rb * 0.5);
      const dist = a.distanceTo(b);
      const lift = entry.def.lift ?? 0.4 + dist * 0.05;
      const mid = a.clone().lerp(b, 0.5);
      mid.y = Math.max(a.y, b.y) + lift;
      // Pull the pipe ends slightly outward from the component center for a cleaner look
      const pa = a.clone();
      const pb = b.clone();
      entry.curve = new THREE.CatmullRomCurve3([pa, mid, pb], false, 'catmullrom', 0.5);
      entry.mesh.geometry.dispose();
      const secondary = entry.def.style === 'secondary';
      entry.mesh.geometry = new THREE.TubeGeometry(entry.curve, 28, secondary ? SECONDARY_RADIUS : MAIN_RADIUS, 8, false);
      const tA = entry.curve.getTangentAt(0.02);
      const tB = entry.curve.getTangentAt(0.98);
      entry.flangeA.position.copy(entry.curve.getPointAt(0.03));
      entry.flangeA.lookAt(entry.flangeA.position.clone().add(tA));
      entry.flangeB.position.copy(entry.curve.getPointAt(0.97));
      entry.flangeB.lookAt(entry.flangeB.position.clone().add(tB));
    }
  }

  setLevel(level: number) {
    this.level = level;
    this.applyVisibility();
  }

  setHidden(hidden: Set<ComponentId>) {
    this.hidden = hidden;
    this.applyVisibility();
  }

  setGhosted(ghosted: Set<ComponentId>) {
    this.ghosted = ghosted;
    this.applyVisibility();
  }

  setHighlighted(ids: Iterable<string>) {
    this.highlighted = new Set(ids);
    this.applyVisibility();
  }

  isPipeVisible(id: string): boolean {
    return this.pipes.get(id)?.visible ?? false;
  }

  private applyVisibility() {
    for (const entry of this.pipes.values()) {
      const d = entry.def;
      const levelOk = d.level <= this.level && (d.maxLevel === undefined || this.level <= d.maxLevel);
      const visible = levelOk && !this.hidden.has(d.from) && !this.hidden.has(d.to);
      entry.visible = visible;
      entry.mesh.visible = visible;
      entry.flangeA.visible = visible;
      entry.flangeB.visible = visible;
      const ghost = this.ghosted.has(d.from) || this.ghosted.has(d.to);
      const hl = this.highlighted.has(d.id);
      const m = entry.mesh.material as THREE.MeshPhysicalMaterial;
      const anyHighlight = this.highlighted.size > 0;
      m.opacity = ghost ? 0.08 : hl ? 0.9 : anyHighlight ? entry.baseOpacity * 0.5 : entry.baseOpacity;
      m.color.set(hl ? '#ffd166' : d.style === 'secondary' ? '#8e9ab3' : PALETTE.pipe);
      m.emissive.set(hl ? '#ffb703' : '#000000');
      m.emissiveIntensity = hl ? 0.25 : 0;
      const fm = entry.flangeA.material as THREE.MeshStandardMaterial;
      fm.transparent = ghost;
      fm.opacity = ghost ? 0.15 : 1;
    }
  }

  /** Find a route between two components using currently visible pipes (main pipes preferred). */
  route(from: ComponentId, to: ComponentId): RouteSeg[] | null {
    if (from === to) return [];
    const tryRoute = (allowSecondary: boolean): RouteSeg[] | null => {
      const adj = new Map<ComponentId, { to: ComponentId; seg: RouteSeg }[]>();
      for (const e of this.pipes.values()) {
        if (!e.visible) continue;
        if (!allowSecondary && e.def.style === 'secondary') continue;
        const add = (a: ComponentId, b: ComponentId, reverse: boolean) => {
          if (!adj.has(a)) adj.set(a, []);
          adj.get(a)!.push({ to: b, seg: { pipeId: e.def.id, reverse } });
        };
        add(e.def.from, e.def.to, false);
        add(e.def.to, e.def.from, true);
      }
      const prev = new Map<ComponentId, { from: ComponentId; seg: RouteSeg }>();
      const queue: ComponentId[] = [from];
      const seen = new Set<ComponentId>([from]);
      while (queue.length) {
        const cur = queue.shift()!;
        if (cur === to) break;
        for (const n of adj.get(cur) ?? []) {
          if (seen.has(n.to)) continue;
          seen.add(n.to);
          prev.set(n.to, { from: cur, seg: n.seg });
          queue.push(n.to);
        }
      }
      if (!seen.has(to)) return null;
      const path: RouteSeg[] = [];
      let cur = to;
      while (cur !== from) {
        const p = prev.get(cur)!;
        path.unshift(p.seg);
        cur = p.from;
      }
      return path;
    };
    return tryRoute(false) ?? tryRoute(true);
  }

  /** Returns a list of component ids visited along a route (including endpoints) */
  routeNodes(from: ComponentId, route: RouteSeg[]): ComponentId[] {
    const nodes: ComponentId[] = [from];
    for (const seg of route) {
      const def = this.pipes.get(seg.pipeId)!.def;
      nodes.push(seg.reverse ? def.from : def.to);
    }
    return nodes;
  }

  curveOf(pipeId: string): THREE.CatmullRomCurve3 {
    return this.pipes.get(pipeId)!.curve;
  }
}
