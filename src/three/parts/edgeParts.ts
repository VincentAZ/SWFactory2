import * as THREE from 'three';
import { makeCtx, finalize, pedestal, rivets, type PartBuild } from './common';
import { mesh, roundedBoxGeo, boxGeo, cylGeo, sphereGeo, torusGeo, coneGeo, wireGlobe, octGeo } from '../shapes';
import { mat, glassMat, glow } from '../materials';
import { PALETTE } from '../palette';
import type { PartHandle } from '../../app/types';

/** DNS + CDN: a globe under a glass dome, ringed by little satellite dishes */
export function buildDnsCdn(pos: THREE.Vector3): PartHandle {
  const ctx = makeCtx('dns-cdn', 'edge');
  const g = new THREE.Group();
  const shell: THREE.Mesh[] = [];
  g.add(pedestal(ctx, 3.6, 3.6, 0.3));

  const drum = mesh(cylGeo(1.35, 1.45, 0.7, 40), ctx.mats.body, [0, 0.65, 0]);
  g.add(drum);
  shell.push(drum);
  const rim = mesh(torusGeo(1.35, 0.06, 10, 48), ctx.mats.brass, [0, 1.0, 0]);
  rim.rotation.x = Math.PI / 2;
  g.add(rim);

  const globe = mesh(sphereGeo(0.85, 32, 20), mat('#7fc8f8', { roughness: 0.35 }), [0, 1.95, 0]);
  const wire = wireGlobe(0.87, '#1d4e89');
  globe.add(wire);
  // continents-ish blobs
  const land = mat('#9bd77a', { roughness: 0.7 });
  const blobs: [number, number, number, number][] = [
    [0.4, 0.5, 0.6, 0.32],
    [-0.6, 0.1, 0.55, 0.28],
    [0.2, -0.5, -0.65, 0.3],
    [-0.3, 0.6, -0.55, 0.22],
    [0.7, -0.2, 0.2, 0.2],
  ];
  for (const [x, y, z, r] of blobs) {
    const b = mesh(sphereGeo(r, 12, 8), land, [x, y, z], { shadow: false });
    b.scale.set(1, 0.9, 0.35);
    b.lookAt(new THREE.Vector3(0, 0, 0));
    globe.add(b);
  }
  g.add(globe);

  const dome = mesh(sphereGeo(1.25, 32, 20), glassMat(PALETTE.glass, 0.28), [0, 1.95, 0], { shadow: false });
  g.add(dome);
  shell.push(dome);

  // satellite dishes around
  const dishes: THREE.Group[] = [];
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const d = new THREE.Group();
    d.position.set(Math.cos(a) * 1.55, 0.95, Math.sin(a) * 1.55);
    const mast = mesh(cylGeo(0.05, 0.05, 0.6, 8), ctx.mats.graphite, [0, 0.3, 0]);
    const dish = mesh(sphereGeo(0.28, 16, 8, ), ctx.mats.cream, [0, 0.62, 0]);
    dish.scale.set(1, 0.45, 1);
    dish.rotation.x = -0.8;
    const feed = mesh(coneGeo(0.04, 0.2, 8), ctx.mats.brass, [0, 0.75, 0.08]);
    d.add(mast, dish, feed);
    d.rotation.y = -a;
    g.add(d);
    dishes.push(d);
  }

  // DNS "phonebook" : a small book on the side
  const book = mesh(roundedBoxGeo(0.7, 0.9, 0.25, 0.04), mat('#e76f51', { roughness: 0.6 }), [1.55, 0.75, -0.9]);
  book.rotation.y = 0.4;
  book.add(mesh(boxGeo(0.6, 0.8, 0.26), ctx.mats.cream, [0.02, 0, 0]));
  g.add(book);

  const pulses: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const p = mesh(torusGeo(0.3, 0.02, 6, 32), glow('#ffd166', 1.2), [0, 3.3, 0], { shadow: false });
    p.rotation.x = Math.PI / 2;
    g.add(p);
    pulses.push(p);
  }

  const update = (_dt: number, t: number) => {
    globe.rotation.y = t * 0.3;
    dishes.forEach((d, i) => (d.rotation.y = -((i / 4) * Math.PI * 2 + Math.PI / 4) + Math.sin(t * 0.6 + i) * 0.4));
    pulses.forEach((p, i) => {
      const k = ((t * 0.5 + i / 3) % 1);
      p.scale.setScalar(0.3 + k * 3);
      (p.material as THREE.MeshBasicMaterial).opacity = 1 - k;
      (p.material as THREE.MeshBasicMaterial).transparent = true;
    });
  };
  const b: PartBuild = { group: g, shell, update, radius: 2.6, port: new THREE.Vector3(0, 1.3, 0) };
  return finalize(ctx, b, pos);
}

/** Security: a shield wall with a scanning beam and a turnstile gate */
export function buildSecurity(pos: THREE.Vector3): PartHandle {
  const ctx = makeCtx('security', 'edge');
  const g = new THREE.Group();
  const shell: THREE.Mesh[] = [];
  g.add(pedestal(ctx, 3.0, 4.6, 0.3));

  const wallMat = mat('#5b6b8c', { roughness: 0.55, metalness: 0.15 });
  const leftWall = mesh(roundedBoxGeo(0.7, 2.4, 1.6, 0.1), wallMat, [0, 1.5, -1.4]);
  const rightWall = mesh(roundedBoxGeo(0.7, 2.4, 1.6, 0.1), wallMat, [0, 1.5, 1.4]);
  g.add(leftWall, rightWall);
  shell.push(leftWall, rightWall);
  rivets(leftWall, ctx.mats.brass, [[0.36, 0.9, -0.6], [0.36, 0.9, 0.6], [0.36, -0.9, -0.6], [0.36, -0.9, 0.6]]);
  rivets(rightWall, ctx.mats.brass, [[0.36, 0.9, -0.6], [0.36, 0.9, 0.6], [0.36, -0.9, -0.6], [0.36, -0.9, 0.6]]);

  // arch across
  const arch = mesh(roundedBoxGeo(0.6, 0.5, 4.4, 0.1), wallMat, [0, 2.95, 0]);
  g.add(arch);
  shell.push(arch);

  // shield emblem on arch
  const shieldShape = new THREE.Shape();
  shieldShape.moveTo(0, 0.5);
  shieldShape.lineTo(0.42, 0.32);
  shieldShape.lineTo(0.36, -0.2);
  shieldShape.lineTo(0, -0.5);
  shieldShape.lineTo(-0.36, -0.2);
  shieldShape.lineTo(-0.42, 0.32);
  shieldShape.closePath();
  const shieldGeo = new THREE.ExtrudeGeometry(shieldShape, { depth: 0.12, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 });
  const shield = new THREE.Mesh(shieldGeo, ctx.mats.body);
  shield.position.set(-0.42, 3.0, 0);
  shield.rotation.y = -Math.PI / 2;
  shield.castShadow = true;
  g.add(shield);
  const lock = mesh(roundedBoxGeo(0.26, 0.2, 0.08, 0.03), ctx.mats.brass, [-0.48, 2.9, 0]);
  lock.rotation.y = -Math.PI / 2;
  const shackle = mesh(torusGeo(0.08, 0.025, 8, 16), ctx.mats.brass, [-0.48, 3.06, 0]);
  shackle.rotation.y = -Math.PI / 2;
  g.add(lock, shackle);

  // scanning beam
  const beam = mesh(boxGeo(0.04, 2.2, 0.03), glow('#ff5a6e', 1.4), [0, 1.5, 0], { shadow: false });
  g.add(beam);
  // TLS padlock glass panel in the gate
  const pane = mesh(boxGeo(0.06, 2.2, 1.2), glassMat('#ffd9de', 0.18), [0, 1.5, 0], { shadow: false });
  g.add(pane);

  // turnstile
  const post = mesh(cylGeo(0.07, 0.07, 1.1, 10), ctx.mats.graphite, [0, 0.85, 0]);
  g.add(post);
  const arms = new THREE.Group();
  arms.position.set(0, 1.1, 0);
  for (let i = 0; i < 3; i++) {
    const a = mesh(cylGeo(0.035, 0.035, 0.7, 8), ctx.mats.brass, [0, 0, 0]);
    a.rotation.z = Math.PI / 2;
    a.rotation.y = (i / 3) * Math.PI * 2;
    a.position.set(Math.cos((i / 3) * Math.PI * 2) * 0.35, 0, Math.sin((i / 3) * Math.PI * 2) * 0.35);
    arms.add(a);
  }
  g.add(arms);

  // a warning light on top
  const light = mesh(sphereGeo(0.14), glow('#ff5a6e', 1.0), [0, 3.35, 0], { shadow: false });
  g.add(light);

  const update = (_dt: number, t: number) => {
    beam.position.z = Math.sin(t * 1.8) * 1.05;
    arms.rotation.y = Math.floor(t * 0.5) * (Math.PI * 2 / 3) + THREE.MathUtils.smoothstep((t * 0.5) % 1, 0.6, 1) * (Math.PI * 2 / 3);
    (light.material as THREE.MeshBasicMaterial).color.setHex(Math.sin(t * 4) > 0.3 ? 0xff5a6e : 0x7a2a33);
  };
  const b: PartBuild = { group: g, shell, update, radius: 2.8, port: new THREE.Vector3(0, 1.5, 0) };
  return finalize(ctx, b, pos);
}

/** Load balancer: a turntable hub with a rotating distributor arm and 3 lanes */
export function buildLoadBalancer(pos: THREE.Vector3): PartHandle {
  const ctx = makeCtx('load-balancer', 'edge');
  const g = new THREE.Group();
  const shell: THREE.Mesh[] = [];
  g.add(pedestal(ctx, 3.6, 3.6, 0.3));

  const hub = mesh(cylGeo(1.3, 1.4, 0.5, 40), ctx.mats.body, [0, 0.55, 0]);
  g.add(hub);
  shell.push(hub);
  const disc = mesh(cylGeo(1.1, 1.1, 0.12, 40), ctx.mats.cream, [0, 0.86, 0]);
  g.add(disc);
  // tick marks
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    disc.add(mesh(boxGeo(0.12, 0.02, 0.04), ctx.mats.graphite, [Math.cos(a) * 0.95, 0.07, Math.sin(a) * 0.95], { rot: [0, -a, 0], shadow: false }));
  }

  const arm = new THREE.Group();
  arm.position.set(0, 0.95, 0);
  const armBar = mesh(roundedBoxGeo(1.9, 0.14, 0.3, 0.05), ctx.mats.graphite, [0.5, 0.1, 0]);
  const tip = mesh(coneGeo(0.22, 0.45, 4), ctx.mats.brass, [1.5, 0.1, 0]);
  tip.rotation.z = -Math.PI / 2;
  tip.rotation.y = Math.PI / 4;
  const axle = mesh(cylGeo(0.2, 0.2, 0.4, 16), ctx.mats.brass, [0, 0.12, 0]);
  arm.add(armBar, tip, axle);
  g.add(arm);

  // three output lanes (pillars with lights)
  const lamps: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const a = -0.6 + i * 0.6;
    const px = Math.cos(a) * 1.45;
    const pz = Math.sin(a) * 1.45;
    const pillar = mesh(roundedBoxGeo(0.3, 1.2, 0.3, 0.05), ctx.mats.graphite, [px, 0.9, pz]);
    const lamp = mesh(sphereGeo(0.14), glow('#2fd3a3', 0.6), [0, 0.72, 0], { shadow: false });
    pillar.add(lamp);
    g.add(pillar);
    lamps.push(lamp);
  }

  // gauge on the back (health / traffic)
  const gauge = mesh(cylGeo(0.42, 0.42, 0.08, 32), ctx.mats.cream, [-1.2, 1.4, 0]);
  gauge.rotation.z = Math.PI / 2;
  const needle = mesh(boxGeo(0.03, 0.34, 0.02), mat('#e63946'), [0.06, 0.14, 0], { shadow: false });
  needle.rotation.x = 0;
  gauge.add(needle);
  const gaugeRim = mesh(torusGeo(0.42, 0.03, 8, 32), ctx.mats.brass, [-1.2, 1.4, 0]);
  gaugeRim.rotation.y = Math.PI / 2;
  g.add(gauge, gaugeRim);

  const update = (_dt: number, t: number) => {
    const step = Math.floor(t * 0.9) % 3;
    const frac = (t * 0.9) % 1;
    const targetA = -0.6 + step * 0.6;
    const prevA = -0.6 + ((step + 2) % 3) * 0.6;
    const k = THREE.MathUtils.smoothstep(frac, 0, 0.35);
    // rotate the arm smoothly to the lane (wrap at the end lane)
    let from = prevA;
    if (step === 0) from = 0.6;
    arm.rotation.y = -THREE.MathUtils.lerp(from, targetA, k);
    lamps.forEach((l, i) => (l.material as THREE.MeshBasicMaterial).color.set(i === step ? '#2fd3a3' : '#1d6b55'));
    needle.rotation.z = -1.0 + Math.sin(t * 1.3) * 0.5 + Math.sin(t * 5.1) * 0.08;
  };
  const b: PartBuild = { group: g, shell, update, radius: 2.5, port: new THREE.Vector3(0, 1.1, 0) };
  return finalize(ctx, b, pos);
}

/** API gateway: an archway with a lifting barrier and a "menu board" of endpoint plates */
export function buildApiGateway(pos: THREE.Vector3): PartHandle {
  const ctx = makeCtx('api-gateway', 'app');
  const g = new THREE.Group();
  const shell: THREE.Mesh[] = [];
  g.add(pedestal(ctx, 3.4, 3.8, 0.3));

  const postL = mesh(roundedBoxGeo(0.5, 2.6, 0.5, 0.08), ctx.mats.graphite, [0, 1.6, -1.2]);
  const postR = mesh(roundedBoxGeo(0.5, 2.6, 0.5, 0.08), ctx.mats.graphite, [0, 1.6, 1.2]);
  const lintel = mesh(roundedBoxGeo(0.6, 0.5, 3.1, 0.08), ctx.mats.body, [0, 3.0, 0]);
  g.add(postL, postR, lintel);
  shell.push(postL, postR, lintel);
  // sign on lintel
  const sign = mesh(roundedBoxGeo(0.08, 0.3, 1.6, 0.03), ctx.mats.cream, [-0.33, 3.0, 0]);
  g.add(sign);

  // barrier arm
  const pivot = new THREE.Group();
  pivot.position.set(0, 1.1, -0.95);
  const bar = mesh(cylGeo(0.06, 0.06, 2.0, 10), mat('#ffffff'), [0, 0, 1.0]);
  bar.rotation.x = Math.PI / 2;
  // red stripes
  for (let i = 0; i < 4; i++) bar.add(mesh(cylGeo(0.065, 0.065, 0.2, 10), mat('#e63946'), [0, -0.7 + i * 0.45, 0], { shadow: false }));
  pivot.add(bar);
  g.add(pivot);

  // menu board with endpoint plates
  const board = mesh(roundedBoxGeo(0.12, 1.5, 1.1, 0.04), ctx.mats.graphite, [0.9, 1.5, -1.0]);
  board.rotation.y = 0.5;
  const plates = ['#2fbf9f', '#f2b53f', '#7f72f2', '#f0815a'];
  plates.forEach((c, i) => {
    board.add(mesh(roundedBoxGeo(0.04, 0.22, 0.8, 0.02), mat(c), [0.08, 0.5 - i * 0.32, 0], { shadow: false }));
  });
  g.add(board);

  // rate-limit counter: small spinning drum
  const drum = mesh(cylGeo(0.25, 0.25, 0.4, 16), ctx.mats.cream, [-0.9, 1.2, 1.0]);
  drum.rotation.z = Math.PI / 2;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    drum.add(mesh(boxGeo(0.12, 0.02, 0.04), ctx.mats.graphite, [Math.cos(a) * 0.26, 0, Math.sin(a) * 0.26], { rot: [0, -a, 0], shadow: false }));
  }
  g.add(drum);

  const update = (_dt: number, t: number) => {
    const cycle = t % 3;
    const open = cycle < 1.2 ? THREE.MathUtils.smoothstep(cycle, 0, 0.5) : 1 - THREE.MathUtils.smoothstep(cycle, 2.2, 2.8);
    pivot.rotation.x = -open * 1.2;
    drum.rotation.x = t * 2;
  };
  const b: PartBuild = { group: g, shell, update, radius: 2.6, port: new THREE.Vector3(0, 1.3, 0) };
  return finalize(ctx, b, pos);
}

/** Auth: a round vault with a spinning combination dial, a key, and ID badge slots */
export function buildAuth(pos: THREE.Vector3): PartHandle {
  const ctx = makeCtx('auth', 'app');
  const g = new THREE.Group();
  const shell: THREE.Mesh[] = [];
  g.add(pedestal(ctx, 3.4, 3.4, 0.3));

  const vaultMat = mat('#55607a', { roughness: 0.45, metalness: 0.3 });
  const body = mesh(cylGeo(1.25, 1.25, 2.2, 40), vaultMat, [0, 1.4, 0]);
  body.rotation.z = Math.PI / 2;
  g.add(body);
  shell.push(body);
  const door = mesh(cylGeo(1.05, 1.05, 0.2, 40), ctx.mats.body, [-1.2, 1.4, 0]);
  door.rotation.z = Math.PI / 2;
  g.add(door);
  shell.push(door);
  const doorRim = mesh(torusGeo(1.05, 0.07, 10, 48), ctx.mats.brass, [-1.3, 1.4, 0]);
  doorRim.rotation.y = Math.PI / 2;
  g.add(doorRim);

  // dial
  const dial = new THREE.Group();
  dial.position.set(-1.35, 1.4, 0);
  const dialDisc = mesh(cylGeo(0.42, 0.42, 0.1, 24), ctx.mats.cream, [0, 0, 0]);
  dialDisc.rotation.z = Math.PI / 2;
  dial.add(dialDisc);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const spoke = mesh(roundedBoxGeo(0.1, 0.1, 0.5, 0.03), ctx.mats.brass, [-0.08, Math.sin(a) * 0.25, Math.cos(a) * 0.25]);
    spoke.rotation.x = -a;
    dial.add(spoke);
  }
  g.add(dial);

  // bolts on the door
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    g.add(mesh(cylGeo(0.07, 0.07, 0.08, 10), ctx.mats.brass, [-1.32, 1.4 + Math.sin(a) * 0.85, Math.cos(a) * 0.85], { rot: [0, 0, Math.PI / 2], shadow: false }));
  }

  // big friendly key floating on top
  const key = new THREE.Group();
  const bow = mesh(torusGeo(0.22, 0.07, 10, 24), ctx.mats.brass, [0, 0, 0]);
  const blade = mesh(roundedBoxGeo(0.9, 0.12, 0.08, 0.03), ctx.mats.brass, [0.6, 0, 0]);
  const bit1 = mesh(boxGeo(0.12, 0.2, 0.08), ctx.mats.brass, [0.85, -0.14, 0]);
  const bit2 = mesh(boxGeo(0.12, 0.14, 0.08), ctx.mats.brass, [0.65, -0.11, 0]);
  key.add(bow, blade, bit1, bit2);
  key.position.set(-0.2, 3.1, 0);
  g.add(key);

  // ID badges (tokens) on the side: small cards
  for (let i = 0; i < 3; i++) {
    const card = mesh(roundedBoxGeo(0.5, 0.32, 0.03, 0.03), ctx.mats.cream, [0.6 + i * 0.1, 0.85 + i * 0.12, 1.45 + i * 0.05]);
    card.rotation.y = 0.2;
    card.add(mesh(sphereGeo(0.07, 10, 8), mat(ctx.color), [-0.14, 0.04, 0.02], { shadow: false }));
    card.add(mesh(boxGeo(0.2, 0.04, 0.02), ctx.mats.graphite, [0.08, 0.06, 0.02], { shadow: false }));
    card.add(mesh(boxGeo(0.2, 0.04, 0.02), ctx.mats.graphite, [0.08, -0.04, 0.02], { shadow: false }));
    g.add(card);
  }

  // status light
  const light = mesh(octGeo(0.18), glow('#2fd3a3', 1.2), [1.1, 2.75, 0], { shadow: false });
  g.add(light);

  const update = (_dt: number, t: number) => {
    dial.rotation.x = Math.sin(t * 0.8) * 2.2 + t * 0.2;
    key.position.y = 3.1 + Math.sin(t * 1.6) * 0.1;
    key.rotation.y = t * 0.6;
    light.rotation.y = t;
    (light.material as THREE.MeshBasicMaterial).color.set(Math.sin(t * 1.3) > 0.85 ? '#ff5a6e' : '#2fd3a3');
  };
  const b: PartBuild = { group: g, shell, update, radius: 2.5, port: new THREE.Vector3(0, 1.4, 0) };
  return finalize(ctx, b, pos);
}
