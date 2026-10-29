import * as THREE from 'three';
import { makeCtx, finalize, pedestal, type PartBuild } from './common';
import { mesh, roundedBoxGeo, boxGeo, cylGeo, person, sphereGeo, torusGeo } from '../shapes';
import { mat, glow } from '../materials';
import { PALETTE } from '../palette';
import type { PartHandle } from '../../app/types';

export function buildUsers(pos: THREE.Vector3): PartHandle {
  const ctx = makeCtx('users', 'client');
  const g = new THREE.Group();
  const shell: THREE.Mesh[] = [];
  g.add(pedestal(ctx, 4.2, 3.2, 0.3));

  // three people, friendly colors
  const skin = mat('#f6d7c2', { roughness: 0.8 });
  const bodies = ['#f0815a', '#f4a261', '#e76f51'].map((c) => mat(c, { roughness: 0.7 }));
  const people: THREE.Group[] = [];
  const spots: [number, number][] = [
    [-1.1, 0.5],
    [-0.2, -0.4],
    [0.8, 0.6],
  ];
  spots.forEach(([x, z], i) => {
    const p = person(bodies[i], skin, 1.05);
    p.position.set(x, 0.3, z);
    p.rotation.y = -0.6 + i * 0.5;
    g.add(p);
    people.push(p);
  });

  // phone in hand of person 1
  const phone = mesh(roundedBoxGeo(0.32, 0.6, 0.06, 0.04), ctx.mats.graphite, [-0.72, 0.95, 0.95]);
  phone.rotation.set(-0.5, 0.4, 0);
  const screen = mesh(boxGeo(0.26, 0.5, 0.01), glow('#9ad7ff', 1.3), [0, 0, 0.035], { shadow: false });
  phone.add(screen);
  g.add(phone);
  shell.push(phone);

  // laptop on a small table
  const table = mesh(cylGeo(0.7, 0.6, 0.08, 20), ctx.mats.cream, [1.3, 0.78, -0.6]);
  table.add(mesh(cylGeo(0.08, 0.1, 0.5, 10), ctx.mats.brass, [0, -0.28, 0]));
  g.add(table);
  const laptopBase = mesh(roundedBoxGeo(0.9, 0.05, 0.6, 0.02), ctx.mats.graphite, [1.3, 0.85, -0.6]);
  const lid = mesh(roundedBoxGeo(0.9, 0.6, 0.04, 0.02), ctx.mats.graphite, [0, 0.3, -0.3]);
  lid.rotation.x = -0.25;
  lid.add(mesh(boxGeo(0.8, 0.5, 0.01), glow('#9ad7ff', 1.2), [0, 0, 0.025], { shadow: false }));
  laptopBase.add(lid);
  laptopBase.rotation.y = -0.6;
  g.add(laptopBase);
  shell.push(laptopBase);

  // thought-bubble style "intent" sphere floating above
  const bubble = mesh(sphereGeo(0.28), mat('#ffffff', { roughness: 0.3 }), [-0.2, 2.2, 0]);
  const halo = new THREE.Mesh(torusGeo(0.42, 0.03), mat(PALETTE.brass, { metalness: 0.6, roughness: 0.3 }));
  halo.rotation.x = Math.PI / 2;
  bubble.add(halo);
  g.add(bubble);

  const update = (_dt: number, t: number) => {
    people.forEach((p, i) => {
      p.position.y = 0.3 + Math.sin(t * 2 + i) * 0.03;
      p.rotation.y = -0.6 + i * 0.5 + Math.sin(t * 0.7 + i) * 0.12;
    });
    bubble.position.y = 2.2 + Math.sin(t * 1.5) * 0.12;
    halo.rotation.z = t * 0.8;
  };

  const b: PartBuild = { group: g, shell, update, radius: 2.6, port: new THREE.Vector3(1.2, 1.2, 0.2) };
  return finalize(ctx, b, pos);
}

export function buildFrontend(pos: THREE.Vector3): PartHandle {
  const ctx = makeCtx('frontend', 'client');
  const g = new THREE.Group();
  const shell: THREE.Mesh[] = [];
  g.add(pedestal(ctx, 3.6, 3, 0.3));

  // kiosk stand
  const stand = mesh(roundedBoxGeo(1.2, 1.6, 0.8, 0.1), ctx.mats.graphite, [0, 1.1, 0.2]);
  g.add(stand);
  // screen frame, tilted
  const frame = mesh(roundedBoxGeo(3.0, 2.1, 0.22, 0.1), ctx.mats.body, [0, 2.6, 0]);
  frame.rotation.x = -0.28;
  g.add(frame);
  shell.push(frame, stand);
  const screenMat = mat('#e6e0d6', { roughness: 0.75 });
  const screen = mesh(boxGeo(2.7, 1.8, 0.03), screenMat, [0, 0, 0.12], { shadow: false });
  frame.add(screen);

  // UI widgets on screen: header bar, cards, buttons
  const accent = mat(ctx.color, { roughness: 0.5 });
  const soft = ctx.mats.soft;
  const ink = mat('#3a3f52', { roughness: 0.6 });
  const uiEls: THREE.Mesh[] = [];
  const header = mesh(boxGeo(2.5, 0.22, 0.03), accent, [0, 0.72, 0.03], { shadow: false });
  screen.add(header);
  for (let i = 0; i < 3; i++) {
    const card = mesh(roundedBoxGeo(0.72, 0.6, 0.04, 0.04), soft, [-0.85 + i * 0.85, 0.15, 0.03], { shadow: false });
    card.add(mesh(boxGeo(0.5, 0.06, 0.02), ink, [0, 0.14, 0.03], { shadow: false }));
    card.add(mesh(boxGeo(0.4, 0.06, 0.02), ink, [-0.05, 0.0, 0.03], { shadow: false }));
    screen.add(card);
    uiEls.push(card);
  }
  const button = mesh(roundedBoxGeo(1.0, 0.26, 0.06, 0.08), accent, [0, -0.55, 0.04], { shadow: false });
  screen.add(button);
  // cursor: small sphere
  const cursor = mesh(sphereGeo(0.06), glow('#ffd166', 1.4), [0.6, -0.2, 0.08], { shadow: false });
  screen.add(cursor);

  // code/design badge on the stand ("HTML / CSS / JS" plates)
  const plateMat = ctx.mats.brass;
  for (let i = 0; i < 3; i++) g.add(mesh(roundedBoxGeo(0.28, 0.12, 0.05, 0.02), plateMat, [-0.35 + i * 0.35, 1.5, 0.62]));

  let pressT = 0;
  const update = (dt: number, t: number) => {
    // cursor wanders between elements and "clicks" the button periodically
    const cycle = t % 6;
    if (cycle < 2) {
      cursor.position.x = THREE.MathUtils.lerp(0.6, -0.5, cycle / 2);
      cursor.position.y = THREE.MathUtils.lerp(-0.2, 0.15, cycle / 2);
    } else if (cycle < 4) {
      cursor.position.x = THREE.MathUtils.lerp(-0.5, 0.0, (cycle - 2) / 2);
      cursor.position.y = THREE.MathUtils.lerp(0.15, -0.55, (cycle - 2) / 2);
    } else {
      pressT += dt;
    }
    if (cycle < 4) pressT = 0;
    const press = cycle >= 4 && cycle < 4.4 ? 1 : 0;
    button.scale.z = THREE.MathUtils.lerp(button.scale.z, press ? 0.4 : 1, dt * 12);
    uiEls.forEach((c, i) => (c.position.y = 0.15 + Math.sin(t * 2 + i * 1.3) * 0.015));
  };

  const b: PartBuild = { group: g, shell, update, radius: 2.5, port: new THREE.Vector3(0, 1.6, -0.3) };
  return finalize(ctx, b, pos);
}
