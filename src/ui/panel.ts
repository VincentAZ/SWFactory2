import { store, type Mode } from '../app/store';
import { h } from './dom';
import { createInspector } from './inspector';
import { createToursPanel } from './toursPanel';
import { createScenariosPanel } from './scenariosPanel';
import { createDecisionsPanel } from './decisionsPanel';
import { createBlueprintPanel } from './blueprintPanel';
import { createLearnPanel } from './learnPanel';

export function createPanel() {
  const el = h('aside', { class: 'panel', 'aria-label': 'Details' });
  const handle = h('div', { class: 'panel__handle', onClick: () => store.set({ panelOpen: false }) });
  const inspector = createInspector();
  const panels: Record<Exclude<Mode, 'explore'>, HTMLElement> = {
    tours: createToursPanel().el,
    scenarios: createScenariosPanel().el,
    decisions: createDecisionsPanel().el,
    blueprint: createBlueprintPanel().el,
    learn: createLearnPanel().el,
  };
  el.append(handle, inspector.el, ...Object.values(panels));

  store.on(['mode', 'selected', 'panelOpen', 'activeTour'], (s) => {
    const showInspector = !!s.selected && !s.activeTour;
    const open = s.panelOpen && (showInspector || s.mode !== 'explore');
    el.classList.toggle('is-open', open);
    inspector.el.hidden = !showInspector;
    for (const [mode, p] of Object.entries(panels)) p.hidden = showInspector || s.mode !== mode;
  });
  return el;
}
