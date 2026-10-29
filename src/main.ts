import './styles/base.css';
import './styles/ui.css';
import { createScene } from './three/scene';
import { Machine } from './three/machine';
import { Interaction } from './three/interaction';
import type { ComponentId } from './app/types';
import { store } from './app/store';
import { runtime } from './app/context';
import { COMPONENT_SHORT_NAMES, COMPONENT_LEVELS } from './content/components';
import { COMPONENT_MAP } from './content/components';
import { select, setComplexity, setExplode, toggleXray, toggleIsolate, toggleLabels, toggleFlow, resetView, setView, endTour, setMode } from './app/actions';
import { tourPlayer } from './app/tourPlayer';
import { scenarioPlayer } from './app/scenarioPlayer';
import { h } from './ui/dom';
import { createPanel } from './ui/panel';
import { createTourOverlay } from './ui/toursPanel';
import { createTopbar, createDock, createToolbar, createTooltip, createToast } from './ui/chrome';
import { openOnboarding, openHelp, openSettings, openSearch } from './ui/overlays';

// ---------------------------------------------------------------------------
// Boot the 3D stage
// ---------------------------------------------------------------------------
const app = document.getElementById('app')!;
const stage = h('div', { class: 'stage' });
app.appendChild(stage);

const scene = createScene(stage);
const machine = new Machine(COMPONENT_SHORT_NAMES, COMPONENT_LEVELS);
scene.scene.add(machine.root);
runtime.scene = scene;
runtime.machine = machine;

const tooltip = createTooltip();
const interaction = new Interaction(scene.renderer.domElement, scene.camera, {
  hover: (id, x, y) => {
    if (id !== store.get().hovered) store.set({ hovered: id });
    if (id) tooltip.show(id, x, y);
    else tooltip.hide();
    scene.renderer.domElement.style.cursor = id ? 'pointer' : '';
  },
  click: (id) => {
    const s = store.get();
    if (s.activeTour) {
      if (id) store.toast(`Exit the tour to inspect ${COMPONENT_MAP[id].shortName}`, '🧭');
      return;
    }
    if (id) select(id);
    else if (s.selected) select(null);
  },
  dblclick: (id) => {
    if (id) select(id, { focus: true });
  },
});
interaction.setPickables(machine.pickables());
machine.labels.onClick((id) => {
  if (!store.get().activeTour) select(id);
});

scene.onFrame.add((dt, t) => {
  machine.update(dt, t);
  interaction.update();
});

// ---------------------------------------------------------------------------
// Store → machine synchronisation
// ---------------------------------------------------------------------------
store.on(['complexity'], (s) => {
  machine.setComplexity(s.complexity);
  syncGhosting();
});
store.on(['explode'], (s) => machine.setExplode(s.explode));
store.on(['xray'], (s) => machine.setXray(s.xray));
store.on(['labels'], (s) => machine.labels.setVisible(s.labels));
store.on(['ambientFlow'], (s) => {
  if (!s.activeScenario) machine.packets.ambient = s.ambientFlow;
});
store.on(['selected'], (s) => machine.setSelected(s.selected));
store.on(['hovered'], (s) => machine.setHovered(s.hovered));
store.on(['spotlight'], (s) => machine.setSpotlight(new Set(s.spotlight)));
store.on(['badges'], (s) => machine.setBadges(s.badges));
store.on(['quality'], (s) => scene.setQuality(s.quality));
store.on(['reduceMotion'], (s) => {
  scene.setReduceMotion(s.reduceMotion);
  machine.packets.ambientRate = s.reduceMotion ? 0.15 : 0.45;
});
store.on(['layerFilter', 'isolate', 'selected', 'ghosted', 'complexity'], syncGhosting, false);
store.on(['activeTour', 'activeScenario'], (s) => {
  interaction.setEnabled(true);
  document.body.classList.toggle('in-tour', !!s.activeTour);
  if (!s.activeScenario) machine.packets.ambient = s.ambientFlow;
});

function syncGhosting() {
  const s = store.get();
  const visible = machine.visibleIds();
  let allowed = new Set<ComponentId>(visible);
  if (s.layerFilter) allowed = new Set(visible.filter((id) => COMPONENT_MAP[id].layer === s.layerFilter || id === 'infra'));
  if (s.isolate && s.selected) {
    const keep = new Set<ComponentId>([s.selected, 'infra']);
    for (const e of machine.pipes.pipes.values()) {
      if (!e.visible) continue;
      if (e.def.from === s.selected) keep.add(e.def.to);
      if (e.def.to === s.selected) keep.add(e.def.from);
    }
    allowed = new Set([...allowed].filter((id) => keep.has(id)));
  }
  for (const g of s.ghosted) allowed.delete(g);
  const ghosted = new Set(visible.filter((id) => !allowed.has(id)));
  machine.setGhosted(ghosted);
}

// ---------------------------------------------------------------------------
// UI
// ---------------------------------------------------------------------------
const topbar = createTopbar({ onSearch: openSearch, onSettings: openSettings, onHelp: openHelp });
const dock = createDock();
const panel = createPanel();
const toolbar = createToolbar();
const tourOverlay = createTourOverlay();
const toast = createToast();
const scrim = h('div', { class: 'dock-scrim', onClick: () => store.set({ dockOpen: false }) });
app.append(topbar, dock, scrim, panel, toolbar, tourOverlay, tooltip.el, toast);

function updateViewOffset() {
  const s = store.get();
  const narrow = window.innerWidth <= 900;
  const panelOpen = app.classList.contains('panel-open');
  const dockW = s.dockOpen && !narrow ? 280 : 0;
  const panelW = panelOpen && !narrow ? (window.innerWidth <= 1180 ? 404 : 444) : 0;
  const x = (panelW - dockW) / 2;
  const y = panelOpen && narrow ? stage.clientHeight * 0.26 : 0;
  scene.setViewOffset(x, y);
}
store.on(['dockOpen'], (s) => {
  app.classList.toggle('dock-open', s.dockOpen);
  updateViewOffset();
});
store.on(['panelOpen', 'selected', 'mode', 'activeTour'], (s) => {
  const open = s.panelOpen && ((!!s.selected && !s.activeTour) || s.mode !== 'explore');
  app.classList.toggle('panel-open', open);
  updateViewOffset();
});
window.addEventListener('resize', updateViewOffset);

// ---------------------------------------------------------------------------
// Keyboard shortcuts
// ---------------------------------------------------------------------------
window.addEventListener('keydown', (e) => {
  const target = e.target as HTMLElement;
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const s = store.get();
  switch (e.key) {
    case 'Escape':
      if (s.activeTour) endTour();
      else if (s.activeScenario) scenarioPlayer.stop();
      else if (s.selected) select(null);
      else if (s.panelOpen) store.set({ panelOpen: false });
      break;
    case '/':
      e.preventDefault();
      openSearch();
      break;
    case '?':
      openHelp();
      break;
    case '1':
    case '2':
    case '3':
      setComplexity(Number(e.key) as 1 | 2 | 3);
      break;
    case 'ArrowRight':
      if (s.activeTour) tourPlayer.next();
      else if (s.activeScenario) scenarioPlayer.next();
      break;
    case 'ArrowLeft':
      if (s.activeTour) tourPlayer.prev();
      else if (s.activeScenario) scenarioPlayer.prev();
      break;
    case ' ':
      if (s.activeScenario) {
        e.preventDefault();
        scenarioPlayer.togglePlay();
      } else if (s.activeTour) {
        e.preventDefault();
        tourPlayer.next();
      }
      break;
    case 'x':
    case 'X':
      toggleXray();
      break;
    case 'e':
    case 'E':
      setExplode(s.explode > 0.5 ? 0 : 1);
      break;
    case 'i':
    case 'I':
      if (s.selected) toggleIsolate();
      break;
    case 'l':
    case 'L':
      toggleLabels();
      break;
    case 'f':
    case 'F':
      toggleFlow();
      break;
    case 'r':
    case 'R':
      resetView();
      break;
    case '0':
      setView('overview');
      break;
  }
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
const params = new URLSearchParams(location.search);
const focusParam = params.get('focus') as ComponentId | null;
const levelParam = params.get('level');
if (levelParam) setComplexity(Number(levelParam) as 1 | 2 | 3);
machine.snap();
setView('overview');
if (focusParam && COMPONENT_MAP[focusParam]) {
  store.updateProgress((p) => ({ ...p, onboarded: true }));
  select(focusParam);
} else if (params.get('mode')) {
  store.updateProgress((p) => ({ ...p, onboarded: true }));
  setMode(params.get('mode') as 'explore');
} else if (!store.get().progress.onboarded) {
  setTimeout(openOnboarding, 500);
}

// expose for debugging / automated checks
(window as unknown as { __stackworks: unknown }).__stackworks = { store, machine, scene, scenarioPlayer, tourPlayer };
