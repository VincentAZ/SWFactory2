import { store, type Mode } from '../app/store';
import type { ComponentId, Complexity, LayerId } from '../app/types';
import { COMPONENT_MAP, COMPONENT_ORDER, taglineFor } from '../content/components';
import { LAYERS, LAYER_LIST } from '../content/layers';
import { h, clear, icon, button, mount } from './dom';
import { setMode, select, setComplexity, setLayerFilter, setView, setExplode, toggleXray, toggleIsolate, toggleLabels, toggleFlow, resetView, toggleDock } from '../app/actions';
import { createLensToggle } from './lens';

const MODES: { id: Mode; label: string; icon: string }[] = [
  { id: 'explore', label: 'Explore', icon: 'compass' },
  { id: 'tours', label: 'Tours', icon: 'map' },
  { id: 'scenarios', label: 'Scenarios', icon: 'route' },
  { id: 'decisions', label: 'Decision lab', icon: 'flask' },
  { id: 'blueprint', label: 'Blueprint', icon: 'blueprint' },
  { id: 'learn', label: 'My path', icon: 'graduation' },
];

export function createTopbar(opts: { onSearch: () => void; onSettings: () => void; onHelp: () => void }) {
  const tabs = h('nav', { class: 'modes', 'aria-label': 'Modes' });
  const el = h('header', { class: 'topbar' },
    button('', { icon: 'menu', class: 'btn--ghost btn--icon topbar__menu', title: 'Components', onClick: () => toggleDock() }),
    h('div', { class: 'brand', onClick: () => { setMode('explore'); resetView(); } },
      h('span', { class: 'brand__mark' }, brandMark()),
      h('span', { class: 'brand__text' }, h('strong', null, 'StackWorks'), h('small', null, 'How software works, as a machine')),
    ),
    tabs,
    h('div', { class: 'topbar__right' },
      button('Search', { icon: 'search', class: 'btn--ghost topbar__search', title: 'Search (press /)', onClick: opts.onSearch }),
      button('', { icon: 'settings', class: 'btn--ghost btn--icon', title: 'Settings', onClick: opts.onSettings }),
      button('', { icon: 'help', class: 'btn--ghost btn--icon', title: 'Help & shortcuts (?)', onClick: opts.onHelp }),
    ),
  );
  store.on(['mode', 'panelOpen'], (s) => {
    clear(tabs);
    for (const m of MODES) {
      mount(tabs, h('button', { class: `mode ${s.mode === m.id ? 'is-active' : ''}`, onClick: () => setMode(m.id), title: m.label }, icon(m.icon, 16), h('span', null, m.label)));
    }
  });
  return el;
}

function brandMark() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 64 64');
  svg.setAttribute('width', '30');
  svg.setAttribute('height', '30');
  svg.innerHTML = '<rect width="64" height="64" rx="14" fill="#2f3340"/><circle cx="32" cy="32" r="13" fill="none" stroke="#d9a95b" stroke-width="6"/><circle cx="32" cy="32" r="4" fill="#f0815a"/><g fill="#d9a95b"><rect x="29" y="6" width="6" height="9" rx="2"/><rect x="29" y="49" width="6" height="9" rx="2"/><rect x="6" y="29" width="9" height="6" rx="2"/><rect x="49" y="29" width="9" height="6" rx="2"/><rect x="11" y="11" width="6" height="9" rx="2" transform="rotate(-45 14 15.5)"/><rect x="47" y="44" width="6" height="9" rx="2" transform="rotate(-45 50 48.5)"/><rect x="44" y="11" width="9" height="6" rx="2" transform="rotate(-45 48.5 14)"/><rect x="11" y="47" width="9" height="6" rx="2" transform="rotate(-45 15.5 50)"/></g>';
  return svg;
}

export function createDock() {
  const el = h('aside', { class: 'dock', 'aria-label': 'Components' });
  function render() {
    clear(el);
    const s = store.get();
    const levels: { v: Complexity; label: string; hint: string }[] = [
      { v: 1, label: 'Simple', hint: 'The four essentials' },
      { v: 2, label: 'Standard', hint: 'A typical modern app' },
      { v: 3, label: 'Production', hint: 'Everything a serious product needs' },
    ];
    mount(el,
      h('div', { class: 'dock__section' },
        h('div', { class: 'dock__label' }, 'Reading lens'),
        createLensToggle(),
      ),
      h('div', { class: 'dock__section' },
        h('div', { class: 'dock__label' }, 'Complexity'),
        h('div', { class: 'seg' }, levels.map((l) => h('button', { class: `seg__btn ${s.complexity === l.v ? 'is-active' : ''}`, title: l.hint, onClick: () => setComplexity(l.v) }, l.label))),
      ),
      h('div', { class: 'dock__section' },
        h('div', { class: 'dock__label' }, 'Layers'),
        h('div', { class: 'layerchips' }, LAYER_LIST.map((lid) => h('button', { class: `layerchip ${s.layerFilter === lid ? 'is-active' : ''}`, title: LAYERS[lid].blurb, onClick: () => setLayerFilter(lid), style: { '--c': LAYERS[lid].color } as unknown as Record<string, string> }, h('span', { class: 'dot' }), LAYERS[lid].name))),
      ),
      h('div', { class: 'dock__section dock__list' },
        h('div', { class: 'dock__label' }, 'Components', h('span', { class: 'muted' }, ` ${s.progress.explored.length}/${COMPONENT_ORDER.length} explored`)),
        LAYER_LIST.map((lid: LayerId) => h('div', { class: 'dock__group' },
          h('div', { class: 'dock__grouphead', style: { color: LAYERS[lid].color } }, LAYERS[lid].name),
          COMPONENT_ORDER.filter((id) => COMPONENT_MAP[id].layer === lid).map((id: ComponentId) => {
            const c = COMPONENT_MAP[id];
            const hidden = c.level > s.complexity;
            const explored = s.progress.explored.includes(id);
            return h('button', {
              class: `dockitem ${s.selected === id ? 'is-active' : ''} ${hidden ? 'is-hidden' : ''}`,
              title: hidden ? `Appears at ${['', 'Simple', 'Standard', 'Production'][c.level]} complexity` : taglineFor(id, s.lens),
              onClick: () => { if (hidden) setComplexity(c.level); select(id); },
              onMouseenter: () => { if (!hidden) store.set({ hovered: id }); },
              onMouseleave: () => { if (store.get().hovered === id) store.set({ hovered: null }); },
            },
              h('span', { class: 'dot', style: { background: LAYERS[lid].color } }),
              h('span', { class: 'grow' }, c.name),
              explored ? icon('check', 12) : hidden ? icon('lock', 12) : null,
            );
          }),
        )),
      ),
      h('div', { class: 'dock__credit' }, 'serpico.ai'),
    );
  }
  store.on(['selected', 'complexity', 'layerFilter', 'progress', 'lens'], render);
  store.on(['dockOpen'], (s) => el.classList.toggle('is-open', s.dockOpen));
  return el;
}

export function createToolbar() {
  const el = h('div', { class: 'toolbar', role: 'toolbar', 'aria-label': 'View controls' });
  const slider = h('input', { type: 'range', min: '0', max: '100', value: '0', class: 'explode', title: 'Explode / dissect the machine', 'aria-label': 'Explode view', oninput: (e: Event) => setExplode(Number((e.target as HTMLInputElement).value) / 100) });
  const xray = button('X-ray', { icon: 'eye', small: true, title: 'See through outer shells (X)', onClick: toggleXray });
  const isolate = button('Isolate', { icon: 'focus', small: true, title: 'Dim everything except the selected component and its neighbours (I)', onClick: toggleIsolate });
  const labels = button('Labels', { icon: 'tag', small: true, title: 'Show component labels (L)', onClick: toggleLabels });
  const flow = button('Traffic', { icon: 'zap', small: true, title: 'Ambient data flow (F)', onClick: toggleFlow });
  mount(el,
    h('div', { class: 'toolbar__group' },
      button('Overview', { icon: 'home', small: true, title: 'Overview (0)', onClick: () => setView('overview') }),
      button('Top', { small: true, title: 'Top view', onClick: () => setView('top') }),
      button('Front', { small: true, title: 'Front view', onClick: () => setView('front') }),
      button('Side', { small: true, title: 'Side view', onClick: () => setView('side') }),
    ),
    h('div', { class: 'toolbar__group toolbar__explode' }, h('span', { class: 'toolbar__label' }, icon('split', 14), 'Dissect'), slider),
    h('div', { class: 'toolbar__group' }, xray, isolate, labels, flow),
    h('div', { class: 'toolbar__group' }, button('Reset', { icon: 'rotate', small: true, title: 'Reset view (R)', onClick: resetView })),
  );
  store.on(['explode', 'xray', 'isolate', 'labels', 'ambientFlow', 'selected'], (s) => {
    slider.value = String(Math.round(s.explode * 100));
    xray.classList.toggle('is-on', s.xray);
    isolate.classList.toggle('is-on', s.isolate);
    isolate.disabled = !s.selected;
    labels.classList.toggle('is-on', s.labels);
    flow.classList.toggle('is-on', s.ambientFlow);
  });
  return el;
}

export function createTooltip() {
  const el = h('div', { class: 'tooltip', hidden: true, role: 'status' });
  let x = 0;
  let y = 0;
  function show(id: ComponentId, px: number, py: number) {
    const c = COMPONENT_MAP[id];
    x = px;
    y = py;
    el.hidden = false;
    clear(el);
    mount(el, h('strong', null, c.name), h('span', null, taglineFor(id, store.get().lens)), h('em', null, 'Click to inspect'));
    position();
  }
  function position() {
    const w = el.offsetWidth;
    const hgt = el.offsetHeight;
    const left = Math.min(x + 16, window.innerWidth - w - 12);
    const top = y + 18 + hgt > window.innerHeight ? y - hgt - 12 : y + 18;
    el.style.transform = `translate(${left}px, ${top}px)`;
  }
  return { el, show, hide: () => (el.hidden = true) };
}

export function createToast() {
  const el = h('div', { class: 'toast', hidden: true, role: 'status', 'aria-live': 'polite' });
  let timer = 0;
  store.on(['toast'], (s) => {
    if (!s.toast) return;
    clear(el);
    mount(el, s.toast.icon ? h('span', { class: 'toast__icon' }, s.toast.icon) : null, h('span', null, s.toast.text));
    el.hidden = false;
    el.classList.remove('is-leaving');
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      el.classList.add('is-leaving');
      window.setTimeout(() => (el.hidden = true), 300);
    }, 3200);
  }, false);
  return el;
}
