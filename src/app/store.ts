import type { ComponentId, Complexity, LayerId, ReadingLens } from './types';

export type Mode = 'explore' | 'tours' | 'scenarios' | 'decisions' | 'blueprint' | 'learn';
export type ViewPreset = 'overview' | 'top' | 'front' | 'side' | 'closeup';
export type Quality = 'auto' | 'high' | 'balanced' | 'low';

export interface Progress {
  explored: ComponentId[];
  toursDone: string[];
  scenariosDone: string[];
  quizzesPassed: ComponentId[];
  decisionsTried: string[];
  blueprintsBuilt: number;
  level: Complexity;
  onboarded: boolean;
}

export interface State {
  mode: Mode;
  selected: ComponentId | null;
  hovered: ComponentId | null;
  complexity: Complexity;
  explode: number; // 0..1
  xray: boolean;
  isolate: boolean;
  labels: boolean;
  ambientFlow: boolean;
  layerFilter: LayerId | null;
  quality: Quality;
  reduceMotion: boolean;
  /** which voice the component copy is shown in; copy variants only */
  lens: ReadingLens;
  panelOpen: boolean;
  dockOpen: boolean;
  activeTour: { id: string; stop: number } | null;
  activeScenario: { id: string; step: number; playing: boolean; speed: number } | null;
  activeDecision: { id: string; option: string | null } | null;
  spotlight: ComponentId[]; // components highlighted by decision/blueprint
  ghosted: ComponentId[]; // components dimmed by decision/blueprint
  badges: Partial<Record<ComponentId, string>>;
  progress: Progress;
  toast: { id: number; text: string; icon?: string } | null;
}

type Listener = (state: State, prev: State, changed: Set<keyof State>) => void;

const STORAGE_KEY = 'stackworks.progress.v1';
const LENS_KEY = 'stackworks.lens.v1';

function loadProgress(): Progress {
  const base: Progress = {
    explored: [],
    toursDone: [],
    scenariosDone: [],
    quizzesPassed: [],
    decisionsTried: [],
    blueprintsBuilt: 0,
    level: 1,
    onboarded: false,
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    return { ...base, ...JSON.parse(raw) };
  } catch {
    return base;
  }
}

function saveProgress(p: Progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

function loadLens(): ReadingLens {
  try {
    const raw = localStorage.getItem(LENS_KEY);
    return raw === 'builder' ? 'builder' : 'founder';
  } catch {
    return 'founder';
  }
}

function saveLens(l: ReadingLens) {
  try {
    localStorage.setItem(LENS_KEY, l);
  } catch {
    /* ignore */
  }
}

const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const initialProgress = loadProgress();

const initial: State = {
  mode: 'explore',
  selected: null,
  hovered: null,
  complexity: initialProgress.onboarded ? initialProgress.level : 1,
  explode: 0,
  xray: false,
  isolate: false,
  labels: true,
  ambientFlow: true,
  layerFilter: null,
  quality: 'auto',
  reduceMotion: !!prefersReducedMotion,
  lens: loadLens(),
  panelOpen: false,
  dockOpen: typeof window !== 'undefined' ? window.innerWidth > 900 : true,
  activeTour: null,
  activeScenario: null,
  activeDecision: null,
  spotlight: [],
  ghosted: [],
  badges: {},
  progress: initialProgress,
  toast: null,
};

class Store {
  private state: State = initial;
  private listeners = new Set<Listener>();

  get(): State {
    return this.state;
  }

  set(patch: Partial<State>) {
    const prev = this.state;
    const changed = new Set<keyof State>();
    for (const k of Object.keys(patch) as (keyof State)[]) {
      if (prev[k] !== patch[k]) changed.add(k);
    }
    if (changed.size === 0) return;
    this.state = { ...prev, ...patch };
    if (changed.has('progress')) saveProgress(this.state.progress);
    if (changed.has('lens')) saveLens(this.state.lens);
    for (const l of this.listeners) l(this.state, prev, changed);
  }

  subscribe(l: Listener): () => void {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  }

  /** subscribe to a subset of keys */
  on(keys: (keyof State)[], fn: (s: State) => void, immediate = true): () => void {
    const unsub = this.subscribe((s, _p, changed) => {
      if (keys.some((k) => changed.has(k))) fn(s);
    });
    if (immediate) fn(this.state);
    return unsub;
  }

  updateProgress(fn: (p: Progress) => Progress) {
    this.set({ progress: fn(this.state.progress) });
  }

  private toastId = 0;
  toast(text: string, icon?: string) {
    this.set({ toast: { id: ++this.toastId, text, icon } });
  }
}

export const store = new Store();
