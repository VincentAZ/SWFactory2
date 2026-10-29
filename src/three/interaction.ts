import * as THREE from 'three';
import type { ComponentId } from '../app/types';

export interface InteractionEvents {
  hover: (id: ComponentId | null, x: number, y: number) => void;
  click: (id: ComponentId | null) => void;
  dblclick: (id: ComponentId | null) => void;
}

export class Interaction {
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private pickables: THREE.Object3D[] = [];
  private hovered: ComponentId | null = null;
  private down: { x: number; y: number; t: number } | null = null;
  private needsPick = false;
  private lastX = 0;
  private lastY = 0;
  private enabled = true;

  constructor(
    private dom: HTMLElement,
    private camera: THREE.Camera,
    private events: InteractionEvents,
  ) {
    dom.addEventListener('pointermove', (e) => {
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      this.needsPick = true;
    });
    dom.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      this.down = { x: e.clientX, y: e.clientY, t: performance.now() };
    });
    dom.addEventListener('pointerup', (e) => {
      if (!this.down) return;
      const dx = e.clientX - this.down.x;
      const dy = e.clientY - this.down.y;
      const dt = performance.now() - this.down.t;
      this.down = null;
      if (dx * dx + dy * dy < 36 && dt < 400) {
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        const id = this.pick();
        this.events.click(id);
      }
    });
    dom.addEventListener('dblclick', (e) => {
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      this.events.dblclick(this.pick());
    });
    dom.addEventListener('pointerleave', () => {
      if (this.hovered) {
        this.hovered = null;
        this.events.hover(null, 0, 0);
      }
    });
  }

  setPickables(objs: THREE.Object3D[]) {
    this.pickables = objs;
  }

  setEnabled(v: boolean) {
    this.enabled = v;
    if (!v && this.hovered) {
      this.hovered = null;
      this.events.hover(null, 0, 0);
    }
  }

  private pick(): ComponentId | null {
    const rect = this.dom.getBoundingClientRect();
    this.pointer.x = ((this.lastX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((this.lastY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.pickables, true);
    for (const h of hits) {
      if (!h.object.visible) continue;
      let o: THREE.Object3D | null = h.object;
      while (o && !o.userData.partId) o = o.parent;
      const id = o?.userData.partId as ComponentId | undefined;
      if (id && !o?.userData.ghost) return id;
      if (id && o?.userData.ghost) continue;
    }
    return null;
  }

  /** call once per frame */
  update() {
    if (!this.needsPick || !this.enabled) return;
    this.needsPick = false;
    const id = this.pick();
    if (id !== this.hovered) {
      this.hovered = id;
      this.events.hover(id, this.lastX, this.lastY);
    } else if (id) {
      this.events.hover(id, this.lastX, this.lastY);
    }
  }
}
