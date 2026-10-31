import * as THREE from 'three';
import type { ComponentId, Complexity, LayerId, ReadingLens } from './types';
import { store, type Mode, type ViewPreset } from './store';
import { runtime } from './context';
import { worldCenter } from '../three/layout';
import { COMPONENT_MAP } from '../content/components';
import { LEVELS } from '../content/levels';
import { DECISION_MAP } from '../content/decisions';
import { scenarioPlayer } from './scenarioPlayer';

// ---------------------------------------------------------------------------
// Selection & camera
// ---------------------------------------------------------------------------

export function select(id: ComponentId | null, opts: { focus?: boolean; openPanel?: boolean } = {}) {
  const s = store.get();
  if (id && s.activeTour) return; // tours own the camera & panel
  store.set({ selected: id, panelOpen: id ? (opts.openPanel ?? true) : s.panelOpen && s.mode !== 'explore' });
  if (id) {
    if (opts.focus ?? true) focusOn(id);
    markExplored(id);
  }
}

export function focusOn(id: ComponentId, opts: { elevation?: number; azimuth?: number; duration?: number; tight?: boolean } = {}) {
  const m = runtime.machine;
  const center = m.worldPosition(id);
  const r = id === 'infra' ? 20 : m.radiusOf(id) * (opts.tight ? 1.0 : 1.25);
  // keep the subject slightly off-center when the side panel is open on wide screens
  runtime.scene.frame(center, r, {
    elevation: opts.elevation ?? (id === 'infra' ? 0.6 : 0.42),
    azimuth: opts.azimuth,
    duration: opts.duration,
  });
}

export function frameMany(ids: ComponentId[], opts: { minRadius?: number; elevation?: number; azimuth?: number; duration?: number } = {}) {
  const m = runtime.machine;
  const box = new THREE.Box3();
  for (const id of ids) {
    if (id === 'infra') continue;
    const p = m.worldPosition(id);
    const r = m.radiusOf(id);
    box.expandByPoint(new THREE.Vector3(p.x - r, p.y - r, p.z - r));
    box.expandByPoint(new THREE.Vector3(p.x + r, p.y + r, p.z + r));
  }
  if (box.isEmpty()) return;
  const c = new THREE.Vector3();
  box.getCenter(c);
  const sphere = new THREE.Sphere();
  box.getBoundingSphere(sphere);
  runtime.scene.frame(c, Math.max(opts.minRadius ?? 0, sphere.radius * 1.05), { elevation: opts.elevation ?? 0.5, azimuth: opts.azimuth, duration: opts.duration });
}

/** Frame whatever is currently visible (the machine grows with complexity) */
export function overview(opts: { duration?: number } = {}) {
  const ids = runtime.machine.visibleIds().filter((id) => id !== 'infra');
  frameMany(ids, { minRadius: 12, elevation: 0.58, azimuth: -0.55, duration: opts.duration });
}

export function setView(view: ViewPreset) {
  const s = store.get();
  if (view === 'closeup' && s.selected) focusOn(s.selected);
  else if (view === 'overview') overview();
  else runtime.scene.preset(view, worldCenter());
}

export function resetView() {
  store.set({ explode: 0, xray: false, isolate: false, layerFilter: null, selected: null, panelOpen: store.get().mode !== 'explore' });
  overview();
}

// ---------------------------------------------------------------------------
// Modes and view toggles
// ---------------------------------------------------------------------------

export function setMode(mode: Mode) {
  const s = store.get();
  if (s.mode === mode && s.panelOpen) {
    // toggling the active tab closes the panel in explore mode
    if (mode === 'explore') store.set({ panelOpen: !!s.selected });
    return;
  }
  if (s.activeTour && mode !== 'tours') endTour();
  if (s.activeScenario && mode !== 'scenarios' && mode !== 'tours') scenarioPlayer.stop();
  if (s.activeDecision && mode !== 'decisions') clearDecision();
  if (mode !== 'blueprint') clearBlueprintPreview();
  store.set({ mode, panelOpen: mode !== 'explore' || !!s.selected });
}

export function setComplexity(level: Complexity) {
  const before = store.get().complexity;
  store.set({ complexity: level });
  const s = store.get();
  if (s.selected && !runtime.machine.isVisible(s.selected)) select(null);
  // reframe so the grown (or shrunk) machine fits, unless the user is looking at something specific
  if (before !== level && !s.selected && !s.activeTour && !s.activeScenario) overview();
}

export function setExplode(v: number) {
  store.set({ explode: Math.max(0, Math.min(1, v)) });
}
export function toggleXray() {
  store.set({ xray: !store.get().xray });
}
export function toggleIsolate() {
  store.set({ isolate: !store.get().isolate });
}
export function toggleLabels() {
  store.set({ labels: !store.get().labels });
}
export function toggleFlow() {
  store.set({ ambientFlow: !store.get().ambientFlow });
}
export function setLayerFilter(layer: LayerId | null) {
  store.set({ layerFilter: store.get().layerFilter === layer ? null : layer });
}
/** Reading lens: Founder (plain-language, analogy-first) or Builder (technical). Copy only. */
export function setLens(lens: ReadingLens) {
  store.set({ lens });
}
export function togglePanel(open?: boolean) {
  store.set({ panelOpen: open ?? !store.get().panelOpen });
}
export function toggleDock(open?: boolean) {
  store.set({ dockOpen: open ?? !store.get().dockOpen });
}

// ---------------------------------------------------------------------------
// Decisions & blueprint spotlight
// ---------------------------------------------------------------------------

export function openDecision(id: string) {
  store.set({ activeDecision: { id, option: null }, spotlight: [], ghosted: [], badges: {} });
}

export function chooseOption(decisionId: string, optionId: string) {
  const d = DECISION_MAP[decisionId];
  const o = d?.options.find((x) => x.id === optionId);
  if (!d || !o) return;
  const badges: Partial<Record<ComponentId, string>> = {};
  if (o.badge) for (const c of o.spotlight) badges[c] = o.badge;
  store.set({ activeDecision: { id: decisionId, option: optionId }, spotlight: o.spotlight, ghosted: o.removes ?? [], badges });
  markDecisionTried(decisionId);
  if (o.spotlight.length) frameMany([...o.spotlight, ...(o.removes ?? [])]);
}

export function clearDecision() {
  store.set({ activeDecision: null, spotlight: [], ghosted: [], badges: {} });
}

let blueprintTimer: number | null = null;
export function previewBlueprint(components: ComponentId[]) {
  if (blueprintTimer) window.clearInterval(blueprintTimer);
  const all = runtime.machine.visibleIds();
  const target = components.filter((c) => all.includes(c));
  const ghosted = all.filter((c) => !target.includes(c) && c !== 'infra');
  store.set({ ghosted, spotlight: [], badges: {} });
  let i = 0;
  blueprintTimer = window.setInterval(() => {
    i++;
    store.set({ spotlight: target.slice(0, i) });
    if (i >= target.length && blueprintTimer) {
      window.clearInterval(blueprintTimer);
      blueprintTimer = null;
    }
  }, 140);
}

export function clearBlueprintPreview() {
  if (blueprintTimer) {
    window.clearInterval(blueprintTimer);
    blueprintTimer = null;
  }
  if (store.get().mode === 'blueprint') store.set({ ghosted: [], spotlight: [], badges: {} });
}

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------

export function markExplored(id: ComponentId) {
  const p = store.get().progress;
  if (p.explored.includes(id)) return;
  store.updateProgress((pr) => ({ ...pr, explored: [...pr.explored, id] }));
  checkLevelUp();
}
export function markTourDone(id: string) {
  const p = store.get().progress;
  if (p.toursDone.includes(id)) return;
  store.updateProgress((pr) => ({ ...pr, toursDone: [...pr.toursDone, id] }));
  store.toast('Tour complete', '🎉');
  checkLevelUp();
}
export function markScenarioDone(id: string) {
  const p = store.get().progress;
  if (p.scenariosDone.includes(id)) return;
  store.updateProgress((pr) => ({ ...pr, scenariosDone: [...pr.scenariosDone, id] }));
  checkLevelUp();
}
export function markQuizPassed(id: ComponentId) {
  const p = store.get().progress;
  if (p.quizzesPassed.includes(id)) return;
  store.updateProgress((pr) => ({ ...pr, quizzesPassed: [...pr.quizzesPassed, id] }));
  store.toast(`Quiz passed: ${COMPONENT_MAP[id].shortName}`, '✅');
  checkLevelUp();
}
export function markDecisionTried(id: string) {
  const p = store.get().progress;
  if (p.decisionsTried.includes(id)) return;
  store.updateProgress((pr) => ({ ...pr, decisionsTried: [...pr.decisionsTried, id] }));
  checkLevelUp();
}
export function markBlueprintBuilt() {
  store.updateProgress((pr) => ({ ...pr, blueprintsBuilt: pr.blueprintsBuilt + 1 }));
  checkLevelUp();
}

export function missionDone(m: { kind: string; target?: string; count?: number }): boolean {
  const p = store.get().progress;
  switch (m.kind) {
    case 'tour':
      return p.toursDone.includes(m.target!);
    case 'scenario':
      return p.scenariosDone.includes(m.target!);
    case 'explore':
      return p.explored.length >= (m.count ?? 1);
    case 'quiz':
      return p.quizzesPassed.length >= (m.count ?? 1);
    case 'decision':
      return m.target ? p.decisionsTried.includes(m.target) : p.decisionsTried.length >= (m.count ?? 1);
    case 'blueprint':
      return p.blueprintsBuilt > 0;
  }
  return false;
}

export function levelCompletion(level: Complexity): { done: number; total: number } {
  const l = LEVELS.find((x) => x.level === level)!;
  const done = l.missions.filter(missionDone).length;
  return { done, total: l.missions.length };
}

function checkLevelUp() {
  const p = store.get().progress;
  const { done, total } = levelCompletion(p.level);
  if (done >= total && p.level < 3) {
    const next = (p.level + 1) as Complexity;
    store.updateProgress((pr) => ({ ...pr, level: next }));
    const name = LEVELS.find((l) => l.level === next)!.name;
    store.toast(`Level up! You are now a ${name}. The machine has grown.`, '🏆');
    setComplexity(next);
  }
}

export function setLevelManually(level: Complexity) {
  store.updateProgress((pr) => ({ ...pr, level }));
  setComplexity(level);
}

export function finishOnboarding(startTour: boolean) {
  store.updateProgress((pr) => ({ ...pr, onboarded: true }));
  if (startTour) {
    setMode('tours');
    startTourById('big-picture');
  }
}

// ---------------------------------------------------------------------------
// Tours (implementation lives in tourPlayer to avoid cycles)
// ---------------------------------------------------------------------------
import { tourPlayer } from './tourPlayer';
export function startTourById(id: string) {
  tourPlayer.start(id);
}
export function endTour() {
  tourPlayer.end();
}
