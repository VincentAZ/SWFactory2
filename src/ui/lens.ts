import type { ReadingLens } from '../app/types';
import { store } from '../app/store';
import { h, mount } from './dom';
import { setLens } from '../app/actions';

export const LENSES: { id: ReadingLens; label: string; hint: string }[] = [
  { id: 'founder', label: 'Founder', hint: 'Plain language, analogy first. Start here.' },
  { id: 'builder', label: 'Builder', hint: 'The technical version, with the terms engineers use.' },
];

/**
 * The reading-lens toggle: Founder (default) or Builder. Copy variants only; it changes no
 * components, scenes, or interactions. Mounted in the dock, the inspector header, and Settings.
 */
export function createLensToggle(opts: { small?: boolean } = {}): HTMLElement {
  const seg = h('div', { class: `seg lens ${opts.small ? 'seg--small' : ''}`, role: 'group', 'aria-label': 'Reading lens' });
  const btns = LENSES.map((l) =>
    h('button', { class: 'seg__btn', type: 'button', title: l.hint, 'aria-pressed': 'false', onClick: () => setLens(l.id) }, l.label),
  );
  mount(seg, btns);
  store.on(['lens'], (s) => {
    btns.forEach((b, i) => {
      const on = LENSES[i].id === s.lens;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
  });
  return seg;
}
