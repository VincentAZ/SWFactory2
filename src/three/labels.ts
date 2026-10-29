import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import type { ComponentId, PartHandle } from '../app/types';
import { LAYER_COLORS } from './palette';

export class LabelSystem {
  private labels = new Map<ComponentId, { obj: CSS2DObject; el: HTMLElement }>();

  constructor(parts: Map<ComponentId, PartHandle>, names: Record<ComponentId, string>) {
    for (const [id, part] of parts) {
      const el = document.createElement('div');
      el.className = 'c-label';
      el.dataset.id = id;
      el.innerHTML = `<span class="c-label__dot" style="background:${LAYER_COLORS[part.layer]}"></span><span class="c-label__text">${names[id]}</span>`;
      const obj = new CSS2DObject(el);
      const h = id === 'infra' ? 0.3 : part.radius * 1.15;
      obj.position.set(id === 'infra' ? -part.radius * 0.72 : 0, h, id === 'infra' ? part.radius * 0.26 : 0);
      obj.center.set(0.5, 1);
      part.group.add(obj);
      this.labels.set(id, { obj, el });
    }
  }

  setVisible(v: boolean) {
    for (const { obj } of this.labels.values()) obj.visible = v;
  }

  setState(id: ComponentId, state: { ghost?: boolean; active?: boolean; hover?: boolean; badge?: string | null; hidden?: boolean }) {
    const l = this.labels.get(id);
    if (!l) return;
    l.el.classList.toggle('is-ghost', !!state.ghost);
    l.el.classList.toggle('is-active', !!state.active);
    l.el.classList.toggle('is-hover', !!state.hover);
    if (state.hidden !== undefined) l.obj.visible = !state.hidden;
    const existing = l.el.querySelector('.c-label__badge');
    if (state.badge) {
      if (existing) existing.textContent = state.badge;
      else {
        const b = document.createElement('span');
        b.className = 'c-label__badge';
        b.textContent = state.badge;
        l.el.appendChild(b);
      }
    } else if (existing) existing.remove();
  }

  onClick(fn: (id: ComponentId) => void) {
    for (const [id, { el }] of this.labels) {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        fn(id);
      });
    }
  }

  elements(): Map<ComponentId, HTMLElement> {
    const m = new Map<ComponentId, HTMLElement>();
    for (const [id, l] of this.labels) m.set(id, l.el);
    return m;
  }

  static vector = new THREE.Vector3();
}
