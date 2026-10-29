import { store, type Quality } from '../app/store';
import { COMPONENTS } from '../content/components';
import { GLOSSARY } from '../content/glossary';
import { SCENARIOS } from '../content/scenarios';
import { TOURS } from '../content/tours';
import { DECISIONS } from '../content/decisions';
import { h, clear, icon, button, mount } from './dom';
import { select, setMode, startTourById, openDecision, finishOnboarding } from '../app/actions';
import { scenarioPlayer } from '../app/scenarioPlayer';
import { runtime } from '../app/context';

function modal(title: string, body: HTMLElement, opts: { onClose?: () => void; wide?: boolean } = {}) {
  const close = () => { el.classList.add('is-leaving'); setTimeout(() => el.remove(), 180); opts.onClose?.(); };
  const el = h('div', { class: 'modal-backdrop', onClick: (e: Event) => { if (e.target === el) close(); } },
    h('div', { class: `modal ${opts.wide ? 'modal--wide' : ''}`, role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
      h('div', { class: 'modal__head' }, h('h2', null, title), h('span', { class: 'grow' }), button('', { icon: 'close', class: 'btn--ghost btn--icon', title: 'Close', onClick: close })),
      body,
    ),
  );
  const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { close(); window.removeEventListener('keydown', onKey); } };
  window.addEventListener('keydown', onKey);
  document.body.appendChild(el);
  return { el, close };
}

export function openOnboarding() {
  const body = h('div', { class: 'onboard' },
    h('p', { class: 'lead' }, 'Every app you use is a machine made of the same parts. This exhibit lets you walk around one, take it apart, watch data flow through it, and learn exactly what to ask an AI when you build your own.'),
    h('ul', { class: 'onboard__list' },
      h('li', null, h('strong', null, 'Drag'), ' to rotate · ', h('strong', null, 'scroll'), ' to zoom · ', h('strong', null, 'click'), ' any part to open its story'),
      h('li', null, h('strong', null, 'Tours'), ' walk you through. ', h('strong', null, 'Scenarios'), ' simulate real user actions.'),
      h('li', null, h('strong', null, 'Decision lab'), ' and ', h('strong', null, 'Blueprint'), ' let you design your own app and generate an AI build brief.'),
      h('li', null, 'The machine starts simple and grows as you level up.'),
    ),
    h('div', { class: 'onboard__actions' },
      button('Start the 5-minute tour', { icon: 'play', primary: true, onClick: () => { m.close(); finishOnboarding(true); } }),
      button('Explore on my own', { icon: 'compass', onClick: () => { m.close(); finishOnboarding(false); } }),
    ),
  );
  const m = modal('Welcome to StackWorks', body);
}

export function openHelp() {
  const rows: [string, string][] = [
    ['Drag / scroll', 'Rotate and zoom the machine'],
    ['Click part', 'Open its explanation'],
    ['Esc', 'Close panel, deselect, or exit a tour'],
    ['/', 'Search components, terms, scenarios'],
    ['1 · 2 · 3', 'Set complexity: Simple, Standard, Production'],
    ['← →', 'Previous / next stop in a tour or scenario'],
    ['Space', 'Play / pause the running scenario'],
    ['X', 'Toggle X-ray'],
    ['E', 'Toggle exploded (dissected) view'],
    ['I', 'Isolate the selected component'],
    ['L', 'Toggle labels'],
    ['F', 'Toggle ambient traffic'],
    ['R / 0', 'Reset view / overview'],
    ['?', 'This help'],
  ];
  const body = h('div', null,
    h('p', { class: 'muted' }, 'StackWorks is an interactive exhibit for nontechnical founders. It teaches how client-server applications work and what to ask an AI assistant that writes the code.'),
    h('table', { class: 'shortcuts' }, rows.map(([k, v]) => h('tr', null, h('td', null, h('kbd', null, k)), h('td', null, v)))),
    h('p', { class: 'muted small' }, 'Built with Three.js and TypeScript. No data leaves your browser; progress is stored locally.'),
  );
  modal('Help & shortcuts', body);
}

export function openSettings() {
  const s = store.get();
  const qualities: { v: Quality; label: string }[] = [
    { v: 'auto', label: 'Auto' },
    { v: 'high', label: 'High' },
    { v: 'balanced', label: 'Balanced' },
    { v: 'low', label: 'Low' },
  ];
  const seg = h('div', { class: 'seg' }, qualities.map((q) => h('button', { class: `seg__btn ${s.quality === q.v ? 'is-active' : ''}`, onClick: (e: Event) => {
    store.set({ quality: q.v });
    seg.querySelectorAll('.seg__btn').forEach((b) => b.classList.remove('is-active'));
    (e.currentTarget as HTMLElement).classList.add('is-active');
  } }, q.label)));
  const fps = h('span', { class: 'muted' }, `${Math.round(runtime.scene.fps())} fps`);
  const body = h('div', { class: 'settings' },
    h('label', { class: 'setting' }, h('span', null, 'Render quality', h('small', null, 'Auto lowers quality if the frame rate drops. ', fps)), seg),
    h('label', { class: 'setting' }, h('input', { type: 'checkbox', checked: s.reduceMotion, onchange: (e: Event) => store.set({ reduceMotion: (e.target as HTMLInputElement).checked }) }), h('span', null, 'Reduce motion', h('small', null, 'Instant camera moves and shorter animations'))),
    h('label', { class: 'setting' }, h('input', { type: 'checkbox', checked: s.labels, onchange: (e: Event) => store.set({ labels: (e.target as HTMLInputElement).checked }) }), h('span', null, 'Show labels')),
    h('label', { class: 'setting' }, h('input', { type: 'checkbox', checked: s.ambientFlow, onchange: (e: Event) => store.set({ ambientFlow: (e.target as HTMLInputElement).checked }) }), h('span', null, 'Ambient traffic', h('small', null, 'Background packets flowing through the pipes'))),
  );
  modal('Settings', body);
}

interface Hit { kind: string; title: string; sub: string; go: () => void }

export function openSearch() {
  const input = h('input', { type: 'search', placeholder: 'Search components, terms, scenarios, tours, decisions…', 'aria-label': 'Search', autocomplete: 'off' });
  const list = h('div', { class: 'search__results' });
  let hits: Hit[] = [];
  let cursor = 0;

  function all(): Hit[] {
    const out: Hit[] = [];
    for (const c of COMPONENTS) out.push({ kind: 'Component', title: c.name, sub: c.tagline, go: () => { setMode('explore'); select(c.id); } });
    for (const g of GLOSSARY) out.push({ kind: 'Term', title: g.term, sub: g.def, go: () => { store.toast(`${g.term}: ${g.def}`, '📖'); } });
    for (const sc of SCENARIOS) out.push({ kind: 'Scenario', title: sc.title, sub: sc.summary, go: () => { setMode('scenarios'); scenarioPlayer.start(sc.id, { autoplay: true }); } });
    for (const t of TOURS) out.push({ kind: 'Tour', title: t.title, sub: t.summary, go: () => { setMode('tours'); startTourById(t.id); } });
    for (const d of DECISIONS) out.push({ kind: 'Decision', title: d.title, sub: d.question, go: () => { setMode('decisions'); openDecision(d.id); } });
    return out;
  }
  const index = all();

  function update() {
    const q = input.value.trim().toLowerCase();
    hits = q ? index.filter((x) => (x.title + ' ' + x.sub + ' ' + x.kind).toLowerCase().includes(q)).slice(0, 12) : index.filter((x) => x.kind === 'Component').slice(0, 8);
    cursor = 0;
    renderList();
  }
  function renderList() {
    clear(list);
    if (!hits.length) mount(list, h('p', { class: 'muted' }, 'No matches.'));
    hits.forEach((x, i) => mount(list, h('button', { class: `search__hit ${i === cursor ? 'is-active' : ''}`, onClick: () => { m.close(); x.go(); } },
      h('span', { class: 'search__kind' }, x.kind), h('span', { class: 'search__title' }, x.title), h('span', { class: 'search__sub' }, x.sub))));
  }
  input.addEventListener('input', update);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { cursor = Math.min(hits.length - 1, cursor + 1); renderList(); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { cursor = Math.max(0, cursor - 1); renderList(); e.preventDefault(); }
    else if (e.key === 'Enter' && hits[cursor]) { m.close(); hits[cursor].go(); }
  });
  const body = h('div', { class: 'search' }, h('div', { class: 'search__box' }, icon('search', 18), input), list);
  const m = modal('Search', body, { wide: true });
  update();
  setTimeout(() => input.focus(), 30);
}
