import * as THREE from 'three';
import { makeCtx, finalize, pedestal, rivets, type PartBuild } from './common';
import { mesh, roundedBoxGeo, boxGeo, cylGeo, sphereGeo, torusGeo, coneGeo, gearGeo } from '../shapes';
import { mat, glow, glassMat } from '../materials';
import { PALETTE } from '../palette';
import type { PartHandle } from '../../app/types';

/** Observability: a control tower with a sweeping radar, gauges, and a log ticker */
export function buildObservability(pos: THREE.Vector3): PartHandle {
  const ctx = makeCtx('observability', 'platform');
  const g = new THREE.Group();
  const shell: THREE.Mesh[] = [];
  g.add(pedestal(ctx, 3.2, 3.2, 0.3));

  const towerMat = mat('#6e7c9a', { roughness: 0.5, metalness: 0.15 });
  const tower = mesh(cylGeo(0.55, 0.8, 2.4, 24), towerMat, [0, 1.5, 0]);
  g.add(tower);
  shell.push(tower);
  const cab = mesh(cylGeo(1.1, 0.8, 0.9, 24), ctx.mats.cream, [0, 3.1, 0]);
  g.add(cab);
  shell.push(cab);
  const glass = mesh(cylGeo(1.12, 0.95, 0.5, 24, true), glassMat('#bfe3ff', 0.35), [0, 3.3, 0], { shadow: false });
  g.add(glass);
  const roof = mesh(coneGeo(1.2, 0.4, 24), ctx.mats.graphite, [0, 3.75, 0]);
  g.add(roof);

  // radar dish on top
  const radar = new THREE.Group();
  radar.position.set(0, 3.95, 0);
  const dish = mesh(sphereGeo(0.45, 16, 8), ctx.mats.cream, [0, 0.3, 0]);
  dish.scale.set(1, 0.4, 1);
  dish.rotation.x = -1.1;
  radar.add(mesh(cylGeo(0.05, 0.05, 0.5, 8), ctx.mats.brass, [0, 0.2, 0]));
  radar.add(dish);
  g.add(radar);

  // radar sweep ring on the floor
  const sweep = mesh(new THREE.RingGeometry(0.2, 1.6, 32, 1, 0, 0.8), new THREE.MeshBasicMaterial({ color: '#2fd3a3', transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false }), [0, 0.32, 0], { shadow: false, receive: false });
  sweep.rotation.x = -Math.PI / 2;
  g.add(sweep);

  // gauges on the tower
  const needles: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.5;
    const gauge = mesh(cylGeo(0.26, 0.26, 0.06, 20), ctx.mats.cream, [Math.cos(a) * 0.7, 1.9, Math.sin(a) * 0.7]);
    gauge.rotation.x = Math.PI / 2;
    gauge.rotation.z = -a + Math.PI / 2;
    const needle = mesh(boxGeo(0.02, 0.2, 0.02), mat('#e63946'), [0, 0.08, 0.04], { shadow: false });
    gauge.add(needle);
    needles.push(needle);
    const rim = mesh(torusGeo(0.26, 0.025, 6, 24), ctx.mats.brass, [0, 0, 0]);
    gauge.add(rim);
    g.add(gauge);
  }
  // log ticker: a paper strip coming out of a slot
  const strip = mesh(boxGeo(0.5, 0.02, 1.2), ctx.mats.cream, [1.0, 0.65, 0.4]);
  strip.rotation.y = -0.3;
  for (let i = 0; i < 6; i++) strip.add(mesh(boxGeo(0.3, 0.01, 0.04), ctx.mats.graphite, [0, 0.015, -0.5 + i * 0.18], { shadow: false }));
  g.add(strip);
  // alarm bell
  const bell = mesh(sphereGeo(0.18, 16, 10), ctx.mats.brass, [-1.1, 1.2, 0.6]);
  bell.scale.y = 1.2;
  g.add(bell);
  const bellLight = mesh(sphereGeo(0.1), glow('#ff4d6d', 1.2), [-1.1, 1.5, 0.6], { shadow: false });
  g.add(bellLight);

  const update = (_dt: number, t: number) => {
    radar.rotation.y = t * 1.1;
    sweep.rotation.z = t * 1.1;
    needles.forEach((n, i) => (n.rotation.z = Math.sin(t * (1 + i * 0.3) + i) * 0.9));
    strip.position.z = 0.4 + ((t * 0.3) % 0.18);
    const alarm = Math.sin(t * 0.5) > 0.95;
    (bellLight.material as THREE.MeshBasicMaterial).color.set(alarm && Math.sin(t * 20) > 0 ? '#ff4d6d' : '#5a2a35');
    bell.rotation.z = alarm ? Math.sin(t * 30) * 0.2 : 0;
  };
  const b: PartBuild = { group: g, shell, update, radius: 2.6, port: new THREE.Vector3(0, 1.8, 0) };
  return finalize(ctx, b, pos);
}

/** CI/CD: a git rail feeding a robot arm that tests, boxes, and launches code on a rocket pad */
export function buildCicd(pos: THREE.Vector3): PartHandle {
  const ctx = makeCtx('cicd', 'platform');
  const g = new THREE.Group();
  const shell: THREE.Mesh[] = [];
  g.add(pedestal(ctx, 4.4, 3.4, 0.3));

  // git rail with commit nodes
  const rail = mesh(boxGeo(3.4, 0.08, 0.08), ctx.mats.graphite, [-0.2, 0.9, -1.1]);
  g.add(rail);
  const commits: THREE.Mesh[] = [];
  for (let i = 0; i < 6; i++) {
    const c = mesh(sphereGeo(0.12, 12, 8), i === 5 ? glow('#ffd166', 1.2) : ctx.mats.brass, [-1.8 + i * 0.65, 0.9, -1.1], { shadow: false });
    g.add(c);
    commits.push(c);
  }
  // branch rail
  const branch = mesh(boxGeo(1.4, 0.06, 0.06), ctx.mats.graphite, [-0.5, 1.25, -1.1]);
  branch.rotation.z = 0.0;
  g.add(branch);
  g.add(mesh(boxGeo(0.6, 0.06, 0.06), ctx.mats.graphite, [-1.4, 1.08, -1.1], { rot: [0, 0, 0.5] }));
  g.add(mesh(boxGeo(0.6, 0.06, 0.06), ctx.mats.graphite, [0.4, 1.08, -1.1], { rot: [0, 0, -0.5] }));
  g.add(mesh(sphereGeo(0.1, 10, 8), mat('#2fbf9f'), [-0.8, 1.25, -1.1], { shadow: false }));
  g.add(mesh(sphereGeo(0.1, 10, 8), mat('#2fbf9f'), [-0.1, 1.25, -1.1], { shadow: false }));

  // test bench: traffic lights
  const bench = mesh(roundedBoxGeo(0.9, 1.0, 0.5, 0.06), ctx.mats.graphite, [-1.4, 0.8, 0.2]);
  g.add(bench);
  const lightsMat = [glow('#ff4d6d', 1.0), glow('#ffd166', 1.0), glow('#2fd3a3', 1.0)];
  const testLights = lightsMat.map((m, i) => mesh(sphereGeo(0.1, 10, 8), m, [0, 0.3 - i * 0.28, 0.27], { shadow: false }));
  testLights.forEach((l) => bench.add(l));

  // robot arm
  const arm = new THREE.Group();
  arm.position.set(0.1, 0.3, 0.2);
  const armBase = mesh(cylGeo(0.4, 0.5, 0.3, 20), ctx.mats.body, [0, 0.15, 0]);
  const shoulder = new THREE.Group();
  shoulder.position.set(0, 0.3, 0);
  const upper = mesh(roundedBoxGeo(0.18, 1.3, 0.18, 0.05), ctx.mats.brass, [0, 0.65, 0]);
  const elbow = new THREE.Group();
  elbow.position.set(0, 1.3, 0);
  const fore = mesh(roundedBoxGeo(0.14, 1.0, 0.14, 0.04), ctx.mats.brass, [0, 0.5, 0]);
  const claw = mesh(roundedBoxGeo(0.3, 0.2, 0.3, 0.04), ctx.mats.graphite, [0, 1.0, 0]);
  const held = mesh(roundedBoxGeo(0.36, 0.3, 0.36, 0.04), mat('#2fbf9f'), [0, 1.25, 0]);
  elbow.add(fore, claw, held);
  shoulder.add(upper, elbow);
  arm.add(armBase, shoulder);
  g.add(arm);

  // rocket pad + rocket
  const pad = mesh(cylGeo(0.7, 0.75, 0.15, 24), ctx.mats.graphite, [1.5, 0.37, 0.3]);
  g.add(pad);
  const rocket = new THREE.Group();
  rocket.position.set(1.5, 0.45, 0.3);
  const rocketBody = mesh(cylGeo(0.25, 0.3, 0.9, 16), ctx.mats.cream, [0, 0.6, 0]);
  const nose = mesh(coneGeo(0.25, 0.4, 16), mat('#e63946'), [0, 1.25, 0]);
  const window = mesh(sphereGeo(0.09, 10, 8), glow('#9ad7ff', 1.0), [0, 0.7, 0.24], { shadow: false });
  rocket.add(rocketBody, nose, window);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    rocket.add(mesh(boxGeo(0.08, 0.3, 0.3), mat('#e63946'), [Math.cos(a) * 0.3, 0.2, Math.sin(a) * 0.3], { rot: [0, -a, 0] }));
  }
  const flame = mesh(coneGeo(0.18, 0.5, 12), glow('#ff8f3c', 1.3), [0, -0.1, 0], { rot: [Math.PI, 0, 0], shadow: false });
  rocket.add(flame);
  g.add(rocket);
  shell.push(rocketBody, bench, armBase);

  // version counter plates
  const plateGroup = new THREE.Group();
  plateGroup.position.set(1.4, 1.1, -1.0);
  plateGroup.add(mesh(roundedBoxGeo(1.0, 0.4, 0.1, 0.03), ctx.mats.cream, [0, 0, 0]));
  plateGroup.add(mesh(boxGeo(0.14, 0.2, 0.02), ctx.mats.graphite, [-0.3, 0, 0.06], { shadow: false }));
  plateGroup.add(mesh(boxGeo(0.14, 0.2, 0.02), ctx.mats.graphite, [0, 0, 0.06], { shadow: false }));
  plateGroup.add(mesh(boxGeo(0.14, 0.2, 0.02), ctx.mats.graphite, [0.3, 0, 0.06], { shadow: false }));
  g.add(plateGroup);

  const update = (_dt: number, t: number) => {
    const cyc = (t * 0.25) % 1; // one pipeline run every 4 seconds
    // phase 0-0.3: arm picks from rail; 0.3-0.6 test; 0.6-0.8 place on rocket; 0.8-1 launch
    const swing = cyc < 0.3 ? THREE.MathUtils.smoothstep(cyc, 0, 0.3) : cyc < 0.6 ? 1 : cyc < 0.8 ? 1 - THREE.MathUtils.smoothstep(cyc, 0.6, 0.8) : 0;
    arm.rotation.y = -1.2 + swing * 2.2;
    shoulder.rotation.x = -0.3 + Math.sin(cyc * Math.PI) * 0.4;
    elbow.rotation.x = 0.8 - Math.sin(cyc * Math.PI) * 0.6;
    held.visible = cyc < 0.8;
    testLights.forEach((l, i) => {
      const on = cyc > 0.3 && cyc < 0.6 && Math.floor((cyc - 0.3) / 0.1) === i;
      (l.material as THREE.MeshBasicMaterial).color.set(on ? ['#ff4d6d', '#ffd166', '#2fd3a3'][i] : '#3a3f52');
    });
    const launch = cyc > 0.82 ? THREE.MathUtils.smoothstep(cyc, 0.82, 1) : 0;
    rocket.position.y = 0.45 + launch * 6;
    rocket.visible = cyc < 0.98;
    flame.visible = cyc > 0.8;
    flame.scale.setScalar(0.8 + Math.random() * 0.4);
    commits.forEach((c, i) => (c.position.y = 0.9 + (i === 5 ? Math.sin(t * 4) * 0.05 : 0)));
  };
  const b: PartBuild = { group: g, shell, update, radius: 2.9, port: new THREE.Vector3(0.5, 1.4, 0) };
  return finalize(ctx, b, pos);
}

/** Infrastructure: the great platform itself — a layered slab with cloud puffs, region beacons, and a basement of racks */
export function buildInfra(pos: THREE.Vector3, size: { w: number; d: number }): PartHandle {
  const ctx = makeCtx('infra', 'platform');
  const g = new THREE.Group();
  const shell: THREE.Mesh[] = [];
  const { w, d } = size;

  const topMat = mat(PALETTE.platformTop, { roughness: 0.85 });
  const sideMat = mat(PALETTE.platformSide, { roughness: 0.85 });
  const slab = mesh(roundedBoxGeo(w, 1.0, d, 0.3), sideMat, [0, -0.5, 0]);
  g.add(slab);
  shell.push(slab);
  const top = mesh(roundedBoxGeo(w - 0.6, 0.12, d - 0.6, 0.1), topMat, [0, 0.0, 0]);
  top.receiveShadow = true;
  g.add(top);
  // trim strip
  const trim = mesh(roundedBoxGeo(w + 0.4, 0.18, d + 0.4, 0.1), mat(PALETTE.platformTrim, { roughness: 0.8 }), [0, -1.0, 0]);
  g.add(trim);

  // basement racks peeking from the sides (server racks)
  const rackMat = mat('#3a3f52', { roughness: 0.5, metalness: 0.3 });
  const rackLights: THREE.Mesh[] = [];
  for (let i = 0; i < 10; i++) {
    const x = -w / 2 + 2.5 + i * ((w - 5) / 9);
    const rack = mesh(boxGeo(1.6, 0.7, 0.3), rackMat, [x, -0.5, d / 2 - 0.12]);
    for (let r = 0; r < 3; r++) {
      const l = mesh(sphereGeo(0.04, 6, 4), glow(['#2fd3a3', '#ffd166', '#4f9dff'][r], 1.2), [-0.6 + r * 0.25, 0.22, 0.16], { shadow: false });
      rack.add(l);
      rackLights.push(l);
    }
    rack.add(mesh(boxGeo(1.3, 0.04, 0.02), ctx.mats.cream, [0.1, 0.0, 0.16], { shadow: false }));
    rack.add(mesh(boxGeo(1.3, 0.04, 0.02), ctx.mats.cream, [0.1, -0.15, 0.16], { shadow: false }));
    g.add(rack);
  }

  // cloud puffs at the corners
  const cloudMat = mat('#ffffff', { roughness: 1 });
  const clouds: THREE.Group[] = [];
  const corners: [number, number][] = [
    [-w / 2 + 1.2, -d / 2 + 1.2],
    [w / 2 - 1.2, -d / 2 + 1.2],
    [-w / 2 + 1.2, d / 2 - 1.2],
    [w / 2 - 1.2, d / 2 - 1.2],
  ];
  corners.forEach(([x, z], i) => {
    const c = new THREE.Group();
    c.position.set(x, 0.9, z);
    c.add(mesh(sphereGeo(0.5, 14, 10), cloudMat, [0, 0, 0]));
    c.add(mesh(sphereGeo(0.38, 14, 10), cloudMat, [0.45, -0.05, 0.1]));
    c.add(mesh(sphereGeo(0.35, 14, 10), cloudMat, [-0.42, -0.08, 0.05]));
    c.add(mesh(sphereGeo(0.3, 14, 10), cloudMat, [0.1, 0.3, -0.1]));
    // region beacon under each cloud
    c.add(mesh(cylGeo(0.06, 0.06, 0.9, 8), ctx.mats.brass, [0, -0.9, 0]));
    c.add(mesh(sphereGeo(0.1), glow('#4f9dff', 1.2), [0, -0.4, 0], { shadow: false }));
    c.userData.phase = i;
    g.add(c);
    clouds.push(c);
  });

  // big gear half-buried in the side of the platform (the "engine room")
  const gear = new THREE.Mesh(gearGeo(1.2, 16, 0.3), ctx.mats.brass);
  gear.position.set(-w / 2 + 0.1, -0.5, 0);
  gear.rotation.y = Math.PI / 2;
  gear.castShadow = true;
  g.add(gear);
  rivets(slab, ctx.mats.brass, [[-w / 2 + 1, 0.2, d / 2 + 0.5], [w / 2 - 1, 0.2, d / 2 + 0.5]]);

  const update = (_dt: number, t: number) => {
    clouds.forEach((c, i) => {
      c.position.y = 0.9 + Math.sin(t * 0.8 + i * 1.5) * 0.1;
    });
    gear.rotation.x = t * 0.3;
    rackLights.forEach((l, i) => (l.visible = Math.sin(t * 3 + i * 0.7) > -0.5));
  };
  const b: PartBuild = { group: g, shell, update, radius: Math.max(w, d) / 2, port: new THREE.Vector3(0, 0, 0) };
  return finalize(ctx, b, pos);
}
