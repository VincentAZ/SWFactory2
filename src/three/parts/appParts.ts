import * as THREE from 'three';
import { makeCtx, finalize, pedestal, rivets, type PartBuild } from './common';
import { mesh, roundedBoxGeo, boxGeo, cylGeo, sphereGeo, torusGeo, gearGeo, icoGeo, octGeo, coneGeo } from '../shapes';
import { mat, glow, glassMat } from '../materials';
import type { PartHandle } from '../../app/types';

/** Backend: the big engine — pistons, gears, exhaust puffs */
export function buildBackend(pos: THREE.Vector3): PartHandle {
  const ctx = makeCtx('backend', 'app');
  const g = new THREE.Group();
  const shell: THREE.Mesh[] = [];
  g.add(pedestal(ctx, 4.6, 4.0, 0.35));

  const block = mesh(roundedBoxGeo(3.4, 1.7, 2.4, 0.18), ctx.mats.body, [0, 1.2, 0]);
  g.add(block);
  shell.push(block);
  rivets(block, ctx.mats.brass, [[1.72, 0.6, -0.9], [1.72, 0.6, 0.9], [1.72, -0.5, -0.9], [1.72, -0.5, 0.9]]);
  // front panel with indicator lights
  const panel = mesh(roundedBoxGeo(2.2, 0.9, 0.08, 0.04), ctx.mats.cream, [0, 1.25, 1.22]);
  g.add(panel);
  const lights: THREE.Mesh[] = [];
  for (let i = 0; i < 5; i++) {
    const l = mesh(sphereGeo(0.08, 10, 8), glow('#2fd3a3', 0.9), [-0.8 + i * 0.4, 0.2, 0.06], { shadow: false });
    panel.add(l);
    lights.push(l);
  }
  // "logic" label plates (routes / services) on the panel
  for (let i = 0; i < 3; i++) panel.add(mesh(boxGeo(1.6, 0.06, 0.02), ctx.mats.graphite, [0, -0.1 - i * 0.16, 0.05], { shadow: false }));

  // pistons on top
  const pistons: THREE.Mesh[] = [];
  const cylMat = mat('#55607a', { roughness: 0.4, metalness: 0.3 });
  for (let i = 0; i < 3; i++) {
    const x = -1.0 + i * 1.0;
    const housing = mesh(cylGeo(0.36, 0.38, 0.6, 20), cylMat, [x, 2.3, -0.3]);
    g.add(housing);
    const rod = mesh(cylGeo(0.14, 0.14, 0.8, 12), ctx.mats.brass, [x, 2.7, -0.3]);
    const cap = mesh(cylGeo(0.3, 0.3, 0.18, 20), ctx.mats.graphite, [0, 0.45, 0]);
    rod.add(cap);
    g.add(rod);
    pistons.push(rod);
  }
  // gears on the side
  const gearMat = ctx.mats.brass;
  const gBig = new THREE.Mesh(gearGeo(0.62, 12, 0.18), gearMat);
  gBig.position.set(-1.85, 1.35, 0.3);
  gBig.rotation.y = Math.PI / 2;
  gBig.castShadow = true;
  const gSmall = new THREE.Mesh(gearGeo(0.36, 8, 0.18), gearMat);
  gSmall.position.set(-1.85, 2.2, -0.3);
  gSmall.rotation.y = Math.PI / 2;
  gSmall.castShadow = true;
  g.add(gBig, gSmall);

  // exhaust stack with puffs
  const stack = mesh(cylGeo(0.2, 0.26, 1.0, 16), ctx.mats.graphite, [1.4, 2.4, 0.6]);
  g.add(stack);
  const puffMat = mat('#ffffff', { roughness: 1, transparent: true, opacity: 0.7 });
  const puffs: { m: THREE.Mesh; phase: number }[] = [];
  for (let i = 0; i < 4; i++) {
    const p = mesh(sphereGeo(0.2, 10, 8), puffMat.clone(), [1.4, 3.0, 0.6], { shadow: false });
    g.add(p);
    puffs.push({ m: p, phase: i / 4 });
  }

  // pipes connecting to the top (manifold)
  const manifold = mesh(cylGeo(0.12, 0.12, 2.4, 10), cylMat, [0, 2.15, -0.3]);
  manifold.rotation.z = Math.PI / 2;
  g.add(manifold);

  const update = (_dt: number, t: number) => {
    pistons.forEach((p, i) => (p.position.y = 2.7 + Math.sin(t * 4 + (i * Math.PI * 2) / 3) * 0.22));
    gBig.rotation.x = t * 1.2;
    gSmall.rotation.x = -t * 1.2 * (12 / 8) + 0.2;
    lights.forEach((l, i) => (l.material as THREE.MeshBasicMaterial).color.set(Math.sin(t * 3 + i * 1.7) > 0 ? '#2fd3a3' : '#ffd166'));
    puffs.forEach(({ m, phase }) => {
      const k = (t * 0.4 + phase) % 1;
      m.position.y = 3.0 + k * 1.4;
      m.position.x = 1.4 + Math.sin(k * 6 + phase * 9) * 0.15;
      m.scale.setScalar(0.5 + k * 1.3);
      (m.material as THREE.MeshStandardMaterial).opacity = 0.75 * (1 - k);
    });
  };
  const b: PartBuild = { group: g, shell, update, radius: 3.2, port: new THREE.Vector3(0, 1.3, 0) };
  return finalize(ctx, b, pos);
}

/** Database: stacked discs with spinning platters + a card-index drawer */
export function buildDatabase(pos: THREE.Vector3): PartHandle {
  const ctx = makeCtx('database', 'data');
  const g = new THREE.Group();
  const shell: THREE.Mesh[] = [];
  g.add(pedestal(ctx, 3.6, 3.6, 0.3));

  const platters: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const y = 0.75 + i * 0.85;
    const disc = mesh(cylGeo(1.15, 1.15, 0.6, 40), ctx.mats.body, [0, y, 0]);
    g.add(disc);
    shell.push(disc);
    const rim = mesh(torusGeo(1.15, 0.05, 8, 48), ctx.mats.brass, [0, y + 0.3, 0]);
    rim.rotation.x = Math.PI / 2;
    g.add(rim);
    const platter = mesh(cylGeo(0.9, 0.9, 0.06, 32), ctx.mats.cream, [0, y + 0.33, 0]);
    for (let s = 0; s < 8; s++) {
      const a = (s / 8) * Math.PI * 2;
      platter.add(mesh(boxGeo(0.5, 0.02, 0.05), ctx.mats.graphite, [Math.cos(a) * 0.55, 0.04, Math.sin(a) * 0.55], { rot: [0, -a, 0], shadow: false }));
    }
    g.add(platter);
    platters.push(platter);
  }
  // spindle
  g.add(mesh(cylGeo(0.09, 0.09, 2.9, 12), ctx.mats.brass, [0, 1.75, 0]));
  // activity light on top
  const top = mesh(sphereGeo(0.2, 16, 12), glow('#7f72f2', 1.1), [0, 3.35, 0], { shadow: false });
  g.add(top);

  // card-index cabinet with sliding drawer (tables / indexes)
  const cabinet = mesh(roundedBoxGeo(1.0, 1.1, 0.9, 0.06), ctx.mats.graphite, [1.6, 0.85, 0.9]);
  g.add(cabinet);
  shell.push(cabinet);
  const drawer = mesh(roundedBoxGeo(0.8, 0.28, 0.8, 0.04), ctx.mats.soft, [1.6, 1.08, 0.95]);
  drawer.add(mesh(cylGeo(0.04, 0.04, 0.16, 8), ctx.mats.brass, [0, 0, 0.42], { rot: [Math.PI / 2, 0, 0] }));
  // cards inside the drawer
  for (let i = 0; i < 5; i++) drawer.add(mesh(boxGeo(0.6, 0.22, 0.02), ctx.mats.cream, [0, 0.05, -0.3 + i * 0.13], { shadow: false }));
  g.add(drawer);
  const drawer2 = mesh(roundedBoxGeo(0.8, 0.28, 0.8, 0.04), ctx.mats.soft, [1.6, 0.72, 0.95]);
  drawer2.add(mesh(cylGeo(0.04, 0.04, 0.16, 8), ctx.mats.brass, [0, 0, 0.42], { rot: [Math.PI / 2, 0, 0] }));
  g.add(drawer2);

  // backup tape reel on the other side
  const reel = mesh(cylGeo(0.4, 0.4, 0.12, 24), ctx.mats.cream, [-1.5, 0.9, -0.9]);
  reel.rotation.x = Math.PI / 2;
  const reelHub = mesh(cylGeo(0.12, 0.12, 0.16, 12), ctx.mats.brass, [0, 0, 0]);
  reel.add(reelHub);
  g.add(reel);

  const update = (_dt: number, t: number) => {
    platters.forEach((p, i) => (p.rotation.y = t * (1.2 + i * 0.3)));
    drawer.position.z = 0.95 + Math.max(0, Math.sin(t * 1.1)) * 0.4;
    reel.rotation.z = t * 0.7;
    (top.material as THREE.MeshBasicMaterial).color.set(Math.sin(t * 6) > 0.6 ? '#ffffff' : '#7f72f2');
  };
  const b: PartBuild = { group: g, shell, update, radius: 2.8, port: new THREE.Vector3(0, 1.6, 0) };
  return finalize(ctx, b, pos);
}

/** Cache: a frosty, sleek box with a lightning bolt and spinning snowflake fan */
export function buildCache(pos: THREE.Vector3): PartHandle {
  const ctx = makeCtx('cache', 'data');
  const g = new THREE.Group();
  const shell: THREE.Mesh[] = [];
  g.add(pedestal(ctx, 2.8, 2.8, 0.3));

  const iceMat = mat('#bfe9ff', { roughness: 0.25, metalness: 0.05 });
  const box = mesh(roundedBoxGeo(1.9, 1.5, 1.9, 0.22), iceMat, [0, 1.1, 0]);
  g.add(box);
  shell.push(box);
  const frost = mesh(roundedBoxGeo(2.0, 0.3, 2.0, 0.12), mat('#ffffff', { roughness: 0.9 }), [0, 1.92, 0]);
  g.add(frost);
  shell.push(frost);
  // lightning bolt emblem
  const bolt = new THREE.Shape();
  bolt.moveTo(0.05, 0.45);
  bolt.lineTo(-0.2, 0.0);
  bolt.lineTo(0.0, 0.0);
  bolt.lineTo(-0.1, -0.45);
  bolt.lineTo(0.22, 0.08);
  bolt.lineTo(0.02, 0.08);
  bolt.closePath();
  const boltMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(bolt, { depth: 0.08, bevelEnabled: false }), glow('#ffd166', 1.3));
  boltMesh.position.set(0, 1.1, 0.96);
  g.add(boltMesh);
  // fan on the side
  const fan = new THREE.Group();
  fan.position.set(-0.98, 1.1, 0);
  for (let i = 0; i < 4; i++) {
    const blade = mesh(roundedBoxGeo(0.06, 0.5, 0.14, 0.03), ctx.mats.graphite, [0, 0.25, 0]);
    const holder = new THREE.Group();
    holder.rotation.x = (i / 4) * Math.PI * 2;
    holder.add(blade);
    fan.add(holder);
  }
  fan.add(mesh(torusGeo(0.56, 0.04, 8, 32), ctx.mats.brass, [0, 0, 0], { rot: [0, Math.PI / 2, 0] }));
  g.add(fan);
  // hourglass (TTL) on top
  const hg = new THREE.Group();
  hg.position.set(0.55, 2.35, 0.5);
  hg.add(mesh(coneGeo(0.16, 0.26, 12), glassMat('#fff', 0.5), [0, 0.13, 0], { rot: [Math.PI, 0, 0] }));
  hg.add(mesh(coneGeo(0.16, 0.26, 12), glassMat('#fff', 0.5), [0, -0.13, 0]));
  hg.add(mesh(cylGeo(0.2, 0.2, 0.04, 12), ctx.mats.brass, [0, 0.28, 0]));
  hg.add(mesh(cylGeo(0.2, 0.2, 0.04, 12), ctx.mats.brass, [0, -0.28, 0]));
  g.add(hg);
  // key:value chips
  for (let i = 0; i < 3; i++) {
    g.add(mesh(roundedBoxGeo(0.46, 0.14, 0.1, 0.03), ctx.mats.body, [-0.5 + i * 0.5, 2.3, -0.4], { shadow: false }));
  }

  const update = (_dt: number, t: number) => {
    fan.rotation.x = t * 5;
    hg.rotation.z = Math.floor(t / 4) % 2 === 0 ? 0 : Math.PI;
    boltMesh.scale.setScalar(1 + Math.sin(t * 8) * 0.04);
  };
  const b: PartBuild = { group: g, shell, update, radius: 2.1, port: new THREE.Vector3(0, 1.1, 0) };
  return finalize(ctx, b, pos);
}

/** Storage: a warehouse of crates with a lift and a little forklift */
export function buildStorage(pos: THREE.Vector3): PartHandle {
  const ctx = makeCtx('storage', 'data');
  const g = new THREE.Group();
  const shell: THREE.Mesh[] = [];
  g.add(pedestal(ctx, 4.0, 3.4, 0.3));

  // shelving frame
  const frameMat = ctx.mats.graphite;
  for (const x of [-1.4, 0, 1.4]) {
    g.add(mesh(boxGeo(0.1, 2.6, 0.1), frameMat, [x, 1.6, -0.8]));
    g.add(mesh(boxGeo(0.1, 2.6, 0.1), frameMat, [x, 1.6, 0.4]));
  }
  for (const y of [0.9, 1.8, 2.7]) g.add(mesh(boxGeo(2.9, 0.08, 1.3), ctx.mats.soft, [0, y, -0.2]));
  // crates: varied colors (files: images, videos, pdfs)
  const crateMats = ['#7f72f2', '#f2b53f', '#2fbf9f', '#f0815a', '#4f9dff'].map((c) => mat(c, { roughness: 0.6 }));
  const crates: THREE.Mesh[] = [];
  const slots: [number, number][] = [
    [-0.95, 0.9],
    [-0.1, 0.9],
    [0.85, 0.9],
    [-0.95, 1.8],
    [0.85, 1.8],
    [-0.1, 2.7],
    [0.85, 2.7],
  ];
  slots.forEach(([x, y], i) => {
    const c = mesh(roundedBoxGeo(0.62, 0.52, 0.62, 0.05), crateMats[i % crateMats.length], [x, y + 0.3, -0.2]);
    c.add(mesh(boxGeo(0.66, 0.08, 0.66), ctx.mats.cream, [0, 0, 0], { shadow: false }));
    g.add(c);
    crates.push(c);
  });
  shell.push(...crates);

  // lift crate that rises and falls on a rail
  const rail = mesh(boxGeo(0.08, 2.8, 0.08), ctx.mats.brass, [1.75, 1.7, 0.9]);
  g.add(rail);
  const lift = mesh(roundedBoxGeo(0.56, 0.48, 0.56, 0.05), crateMats[1], [1.75, 0.6, 0.9]);
  lift.add(mesh(boxGeo(0.6, 0.08, 0.6), ctx.mats.cream, [0, 0, 0], { shadow: false }));
  g.add(lift);

  // mini forklift
  const fork = new THREE.Group();
  fork.position.set(-1.0, 0.3, 1.1);
  fork.add(mesh(roundedBoxGeo(0.7, 0.4, 0.5, 0.06), mat('#f2b53f'), [0, 0.3, 0]));
  fork.add(mesh(boxGeo(0.08, 1.0, 0.08), ctx.mats.graphite, [0.4, 0.6, -0.15]));
  fork.add(mesh(boxGeo(0.08, 1.0, 0.08), ctx.mats.graphite, [0.4, 0.6, 0.15]));
  fork.add(mesh(boxGeo(0.5, 0.04, 0.1), ctx.mats.graphite, [0.65, 0.18, -0.12]));
  fork.add(mesh(boxGeo(0.5, 0.04, 0.1), ctx.mats.graphite, [0.65, 0.18, 0.12]));
  for (const [x, z] of [[-0.22, -0.28], [0.22, -0.28], [-0.22, 0.28], [0.22, 0.28]]) {
    fork.add(mesh(cylGeo(0.11, 0.11, 0.08, 12), ctx.mats.graphite, [x, 0.11, z], { rot: [Math.PI / 2, 0, 0] }));
  }
  g.add(fork);

  const update = (_dt: number, t: number) => {
    const k = (Math.sin(t * 0.8) + 1) / 2;
    lift.position.y = 0.6 + k * 2.2;
    fork.position.x = -1.0 + Math.sin(t * 0.5) * 0.9;
    fork.rotation.y = Math.cos(t * 0.5) > 0 ? 0 : Math.PI;
  };
  const b: PartBuild = { group: g, shell, update, radius: 2.9, port: new THREE.Vector3(0, 1.4, 0) };
  return finalize(ctx, b, pos);
}

/** Queue & workers: a conveyor belt carrying job boxes to three little worker robots */
export function buildQueue(pos: THREE.Vector3): PartHandle {
  const ctx = makeCtx('queue', 'app');
  const g = new THREE.Group();
  const shell: THREE.Mesh[] = [];
  g.add(pedestal(ctx, 5.0, 3.0, 0.3));

  // belt
  const beltLen = 4.2;
  const belt = mesh(roundedBoxGeo(beltLen, 0.26, 0.9, 0.08), ctx.mats.graphite, [-0.2, 0.75, -0.4]);
  g.add(belt);
  shell.push(belt);
  const rollerMat = ctx.mats.brass;
  for (const x of [-2.1, 2.1]) {
    const r = mesh(cylGeo(0.2, 0.2, 1.0, 16), rollerMat, [x - 0.2, 0.75, -0.4]);
    r.rotation.x = Math.PI / 2;
    g.add(r);
  }
  const beltTop = mesh(boxGeo(beltLen, 0.02, 0.8), mat('#44485a'), [-0.2, 0.89, -0.4]);
  g.add(beltTop);
  // belt stripes to show motion
  const stripes: THREE.Mesh[] = [];
  for (let i = 0; i < 8; i++) {
    const s = mesh(boxGeo(0.06, 0.01, 0.8), ctx.mats.cream, [0, 0.9, -0.4], { shadow: false });
    g.add(s);
    stripes.push(s);
  }
  // job boxes
  const jobMats = ['#f2b53f', '#2fbf9f', '#7f72f2', '#f0815a'].map((c) => mat(c));
  const jobs: THREE.Mesh[] = [];
  for (let i = 0; i < 4; i++) {
    const j = mesh(roundedBoxGeo(0.4, 0.34, 0.4, 0.04), jobMats[i], [0, 1.07, -0.4]);
    j.add(mesh(boxGeo(0.44, 0.06, 0.44), ctx.mats.cream, [0, 0.0, 0], { shadow: false }));
    g.add(j);
    jobs.push(j);
  }
  // hopper (queue input) at the belt start
  const hopperMat = ctx.mats.body.clone();
  hopperMat.side = THREE.DoubleSide;
  const hopper = mesh(cylGeo(0.5, 0.25, 0.7, 16, true), hopperMat, [-2.2, 1.8, -0.4]);
  g.add(hopper);
  // worker robots
  const workers: { body: THREE.Group; arm: THREE.Mesh }[] = [];
  for (let i = 0; i < 3; i++) {
    const w = new THREE.Group();
    w.position.set(-0.9 + i * 1.3, 0.3, 0.7);
    const body = mesh(roundedBoxGeo(0.6, 0.7, 0.5, 0.1), ctx.mats.soft, [0, 0.6, 0]);
    const eye1 = mesh(sphereGeo(0.06, 8, 6), ctx.mats.graphite, [-0.12, 0.75, -0.26], { shadow: false });
    const eye2 = mesh(sphereGeo(0.06, 8, 6), ctx.mats.graphite, [0.12, 0.75, -0.26], { shadow: false });
    const antenna = mesh(cylGeo(0.02, 0.02, 0.3, 6), ctx.mats.brass, [0, 1.1, 0]);
    const bulb = mesh(sphereGeo(0.06, 8, 6), glow('#ffd166', 1.2), [0, 1.27, 0], { shadow: false });
    const arm = mesh(roundedBoxGeo(0.12, 0.5, 0.12, 0.03), ctx.mats.graphite, [-0.38, 0.75, -0.1]);
    arm.geometry = roundedBoxGeo(0.12, 0.5, 0.12, 0.03);
    const hand = mesh(sphereGeo(0.09, 8, 6), ctx.mats.brass, [0, -0.3, 0]);
    arm.add(hand);
    w.add(body, eye1, eye2, antenna, bulb, arm);
    g.add(w);
    workers.push({ body: w, arm });
    shell.push(body);
  }
  // gear driving the belt
  const gear = new THREE.Mesh(gearGeo(0.4, 10, 0.14), ctx.mats.brass);
  gear.position.set(2.1, 0.75, 0.25);
  gear.castShadow = true;
  g.add(gear);

  const update = (_dt: number, t: number) => {
    stripes.forEach((s, i) => (s.position.x = -0.2 - beltLen / 2 + (((t * 0.7 + i / 8) % 1) * beltLen)));
    jobs.forEach((j, i) => {
      const k = (t * 0.18 + i / 4) % 1;
      j.position.x = -2.2 + k * 4.0;
      j.position.y = k < 0.08 ? 1.07 + (0.08 - k) * 8 : 1.07;
      j.visible = k < 0.96;
    });
    workers.forEach((w, i) => {
      w.arm.rotation.x = -0.5 + Math.sin(t * 3 + i) * 0.6;
      w.body.position.y = 0.3 + Math.abs(Math.sin(t * 3 + i)) * 0.04;
    });
    gear.rotation.z = -t * 2;
  };
  const b: PartBuild = { group: g, shell, update, radius: 3.0, port: new THREE.Vector3(-1.0, 1.3, -0.4) };
  return finalize(ctx, b, pos);
}

/** AI services: a floating crystal brain in a brass gyroscope with orbiting sparks */
export function buildAi(pos: THREE.Vector3): PartHandle {
  const ctx = makeCtx('ai', 'app');
  const g = new THREE.Group();
  const shell: THREE.Mesh[] = [];
  g.add(pedestal(ctx, 3.4, 3.4, 0.3));

  const base = mesh(cylGeo(1.1, 1.3, 0.5, 32), ctx.mats.body, [0, 0.55, 0]);
  g.add(base);
  shell.push(base);
  const column = mesh(cylGeo(0.25, 0.35, 0.8, 16), ctx.mats.graphite, [0, 1.2, 0]);
  g.add(column);

  const crystalMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#d9b3ff'),
    roughness: 0.15,
    metalness: 0.1,
    transparent: true,
    opacity: 0.85,
    emissive: new THREE.Color('#b989ff'),
    emissiveIntensity: 0.55,
  });
  const crystal = new THREE.Mesh(icoGeo(0.7, 1), crystalMat);
  crystal.position.set(0, 2.4, 0);
  crystal.castShadow = true;
  g.add(crystal);
  const core = mesh(octGeo(0.3), glow('#ffffff', 1.5), [0, 2.4, 0], { shadow: false });
  g.add(core);

  // gyroscope rings
  const r1 = mesh(torusGeo(1.05, 0.045, 10, 64), ctx.mats.brass, [0, 2.4, 0]);
  const r2 = mesh(torusGeo(0.9, 0.04, 10, 64), ctx.mats.brass, [0, 2.4, 0]);
  const r3 = mesh(torusGeo(1.2, 0.035, 10, 64), mat('#55607a', { metalness: 0.3 }), [0, 2.4, 0]);
  r3.rotation.x = Math.PI / 2;
  g.add(r1, r2, r3);

  // orbiting sparks (tokens)
  const sparks: THREE.Mesh[] = [];
  const sparkColors = ['#ffd166', '#ff6fb5', '#2fd3a3', '#4f9dff', '#ffffff'];
  for (let i = 0; i < 10; i++) {
    const s = mesh(sphereGeo(0.06, 8, 6), glow(sparkColors[i % sparkColors.length], 1.3), [0, 2.4, 0], { shadow: false });
    g.add(s);
    sparks.push(s);
  }
  // little "model cards" (brain icons) on the base
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.3;
    g.add(mesh(roundedBoxGeo(0.4, 0.5, 0.06, 0.03), ctx.mats.cream, [Math.cos(a) * 1.0, 1.0, Math.sin(a) * 1.0], { rot: [0, -a + Math.PI / 2, 0] }));
  }

  const update = (_dt: number, t: number) => {
    crystal.rotation.y = t * 0.5;
    crystal.rotation.x = Math.sin(t * 0.4) * 0.3;
    crystal.position.y = 2.4 + Math.sin(t * 1.3) * 0.1;
    core.rotation.y = -t;
    core.position.y = crystal.position.y;
    crystalMat.emissiveIntensity = 0.45 + Math.sin(t * 2.2) * 0.2;
    r1.rotation.x = t * 0.7;
    r1.rotation.y = t * 0.3;
    r2.rotation.z = t * 0.9;
    r2.rotation.x = Math.PI / 3 + t * 0.4;
    r3.rotation.z = t * 0.2;
    sparks.forEach((s, i) => {
      const a = t * (0.8 + i * 0.07) + i;
      const r = 1.35 + Math.sin(t + i) * 0.1;
      s.position.set(Math.cos(a) * r, 2.4 + Math.sin(a * 1.3 + i) * 0.6, Math.sin(a) * r);
    });
  };
  const b: PartBuild = { group: g, shell, update, radius: 2.6, port: new THREE.Vector3(0, 1.4, 0) };
  return finalize(ctx, b, pos);
}

/** Third-party services: a row of partner booths — payments terminal, mailbox, map pin */
export function buildThirdParty(pos: THREE.Vector3): PartHandle {
  const ctx = makeCtx('third-party', 'app');
  const g = new THREE.Group();
  const shell: THREE.Mesh[] = [];
  g.add(pedestal(ctx, 4.2, 3.0, 0.3));

  // Payments booth: card terminal
  const term = mesh(roundedBoxGeo(0.8, 1.1, 0.5, 0.08), ctx.mats.graphite, [-1.3, 0.85, 0]);
  term.rotation.x = -0.2;
  term.add(mesh(boxGeo(0.6, 0.35, 0.02), glow('#9ad7ff', 1.1), [0, 0.25, 0.26], { shadow: false }));
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) term.add(mesh(roundedBoxGeo(0.14, 0.1, 0.04, 0.02), ctx.mats.cream, [-0.2 + c * 0.2, -0.05 - r * 0.16, 0.26], { shadow: false }));
  g.add(term);
  shell.push(term);
  const card = mesh(roundedBoxGeo(0.55, 0.36, 0.03, 0.03), mat('#4f9dff'), [-1.3, 1.65, 0.1]);
  card.add(mesh(boxGeo(0.55, 0.08, 0.035), ctx.mats.graphite, [0, 0.08, 0], { shadow: false }));
  g.add(card);

  // Email booth: mailbox with flag
  const mailbox = mesh(roundedBoxGeo(0.7, 0.6, 1.0, 0.2), mat('#4f9dff', { roughness: 0.5 }), [0.1, 1.2, 0]);
  const post = mesh(boxGeo(0.12, 0.9, 0.12), ctx.mats.graphite, [0.1, 0.6, 0]);
  g.add(mailbox, post);
  shell.push(mailbox);
  const flag = new THREE.Group();
  flag.position.set(0.47, 1.3, -0.2);
  flag.add(mesh(boxGeo(0.04, 0.5, 0.06), ctx.mats.brass, [0, 0.25, 0]));
  flag.add(mesh(boxGeo(0.04, 0.25, 0.3), mat('#e63946'), [0, 0.42, 0.15]));
  g.add(flag);
  const envelope = mesh(boxGeo(0.5, 0.03, 0.35), ctx.mats.cream, [0.1, 1.75, 0]);
  g.add(envelope);

  // Maps booth: a map pin over a small tile
  const tile = mesh(roundedBoxGeo(1.0, 0.1, 1.0, 0.04), mat('#9bd77a', { roughness: 0.8 }), [1.5, 0.35, 0]);
  tile.add(mesh(boxGeo(0.12, 0.02, 1.0), ctx.mats.cream, [-0.1, 0.06, 0], { shadow: false }));
  tile.add(mesh(boxGeo(1.0, 0.02, 0.12), ctx.mats.cream, [0, 0.06, 0.2], { shadow: false }));
  g.add(tile);
  const pin = new THREE.Group();
  pin.position.set(1.5, 1.0, 0);
  pin.add(mesh(sphereGeo(0.28, 16, 12), mat('#e63946'), [0, 0.3, 0]));
  pin.add(mesh(coneGeo(0.22, 0.5, 16), mat('#e63946'), [0, -0.05, 0], { rot: [Math.PI, 0, 0] }));
  pin.add(mesh(sphereGeo(0.1, 10, 8), ctx.mats.cream, [0, 0.3, 0.22], { shadow: false }));
  g.add(pin);

  // plug / socket symbol: an API cable
  const plug = mesh(roundedBoxGeo(0.4, 0.3, 0.3, 0.05), ctx.mats.body, [0.1, 2.5, 0]);
  plug.add(mesh(cylGeo(0.03, 0.03, 0.25, 6), ctx.mats.brass, [-0.1, 0, 0.25], { rot: [Math.PI / 2, 0, 0] }));
  plug.add(mesh(cylGeo(0.03, 0.03, 0.25, 6), ctx.mats.brass, [0.1, 0, 0.25], { rot: [Math.PI / 2, 0, 0] }));
  g.add(plug);

  const update = (_dt: number, t: number) => {
    const cyc = t % 5;
    flag.rotation.x = cyc < 2.5 ? THREE.MathUtils.lerp(flag.rotation.x, 0, 0.1) : THREE.MathUtils.lerp(flag.rotation.x, Math.PI / 2, 0.1);
    envelope.position.y = 1.75 + Math.sin(t * 2) * 0.08;
    pin.position.y = 1.0 + Math.abs(Math.sin(t * 2.5)) * 0.3;
    card.position.y = 1.65 + Math.sin(t * 1.5) * 0.06;
    plug.rotation.y = Math.sin(t) * 0.4;
  };
  const b: PartBuild = { group: g, shell, update, radius: 2.7, port: new THREE.Vector3(0, 1.3, 0) };
  return finalize(ctx, b, pos);
}
