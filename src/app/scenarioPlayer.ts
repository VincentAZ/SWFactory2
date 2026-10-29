import type { ComponentId, Scenario } from '../app/types';
import { store } from './store';
import { runtime } from './context';
import { SCENARIO_MAP } from '../content/scenarios';
import { frameMany, markScenarioDone } from './actions';

export interface ScenarioStatus {
  scenario: Scenario;
  step: number; // current step index
  playing: boolean;
  phase: 'idle' | 'running' | 'done';
  hops: ComponentId[];
}

type Listener = (s: ScenarioStatus | null) => void;

class ScenarioPlayer {
  private status: ScenarioStatus | null = null;
  private listeners = new Set<Listener>();
  private runId = 0;
  private stepRunning = false;
  private onFinish: (() => void) | null = null;
  /** move the camera to frame each step's route */
  follow = true;

  toggleFollow() {
    this.follow = !this.follow;
    this.emit();
    if (this.follow && this.status && this.status.hops.length) frameMany(this.status.hops, { minRadius: 7, elevation: 0.5 });
  }

  on(l: Listener) {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  }
  private emit() {
    for (const l of this.listeners) l(this.status);
  }

  get current() {
    return this.status;
  }

  start(id: string, opts: { autoplay?: boolean; onFinish?: () => void } = {}) {
    const scenario = SCENARIO_MAP[id];
    if (!scenario) return;
    this.stop(false);
    this.onFinish = opts.onFinish ?? null;
    if (store.get().complexity < scenario.level) {
      store.set({ complexity: scenario.level });
      store.toast(`Switched to ${['', 'Simple', 'Standard', 'Production'][scenario.level]} complexity to show every stop`, '⚙️');
    }
    this.status = { scenario, step: -1, playing: opts.autoplay ?? true, phase: 'idle', hops: [] };
    store.set({ activeScenario: { id, step: 0, playing: this.status.playing, speed: 1 } });
    runtime.machine.packets.ambient = false;
    this.emit();
    this.next();
  }

  stop(clearStore = true) {
    this.runId++;
    this.stepRunning = false;
    runtime.machine.packets.clear();
    runtime.machine.pipes.setHighlighted([]);
    runtime.machine.setSpotlight(new Set());
    runtime.machine.packets.ambient = store.get().ambientFlow;
    this.status = null;
    if (clearStore) store.set({ activeScenario: null });
    this.emit();
  }

  togglePlay() {
    if (!this.status) return;
    this.status.playing = !this.status.playing;
    store.set({ activeScenario: { ...store.get().activeScenario!, playing: this.status.playing } });
    this.emit();
    if (this.status.playing && !this.stepRunning) this.next();
  }

  setSpeed(speed: number) {
    const a = store.get().activeScenario;
    if (a) store.set({ activeScenario: { ...a, speed } });
  }

  goTo(step: number) {
    if (!this.status) return;
    const s = this.status;
    this.runId++;
    runtime.machine.packets.clear();
    s.step = Math.max(-1, Math.min(s.scenario.steps.length - 1, step)) - 1;
    this.stepRunning = false;
    this.next(true);
  }

  prev() {
    if (!this.status) return;
    this.goTo(this.status.step - 1);
  }

  async next(force = false) {
    const s = this.status;
    if (!s) return;
    if (this.stepRunning && !force) {
      // skip ahead: cancel current step
      this.runId++;
      runtime.machine.packets.clear();
    }
    if (s.step + 1 >= s.scenario.steps.length) {
      s.phase = 'done';
      s.playing = false;
      runtime.machine.pipes.setHighlighted([]);
      runtime.machine.setSpotlight(new Set());
      store.set({ activeScenario: { ...store.get().activeScenario!, playing: false, step: s.step } });
      this.emit();
      markScenarioDone(s.scenario.id);
      this.onFinish?.();
      return;
    }
    s.step++;
    s.phase = 'running';
    const step = s.scenario.steps[s.step];
    const id = ++this.runId;
    this.stepRunning = true;
    store.set({ activeScenario: { ...store.get().activeScenario!, step: s.step } });

    const machine = runtime.machine;
    const from = machine.isVisible(step.from) ? step.from : nearestVisible(step.from);
    const to = machine.isVisible(step.to) ? step.to : nearestVisible(step.to);
    const route = from && to ? machine.pipes.route(from, to) : null;
    const hops = route && from ? machine.pipes.routeNodes(from, route) : [];
    s.hops = hops;
    machine.pipes.setHighlighted(route ? route.map((r) => r.pipeId) : []);
    machine.setSpotlight(new Set([to ?? step.to, step.focus].filter(Boolean) as ComponentId[]));
    if (this.follow) {
      const frameIds = hops.length ? hops : ([from, to].filter(Boolean) as ComponentId[]);
      if (frameIds.length) frameMany(frameIds, { minRadius: 7, elevation: 0.5 });
    }
    this.emit();

    const speed = store.get().activeScenario?.speed ?? 1;
    const reduce = store.get().reduceMotion;
    const baseDuration = step.duration ?? Math.max(1.2, (route?.length ?? 1) * 0.9);
    const duration = reduce ? baseDuration * 0.5 : baseDuration / speed;
    if (route && route.length && from) {
      await machine.packets.send(from, route, step.kind, {
        count: step.count ?? 3,
        duration,
        stagger: step.kind === 'stream' ? 0.12 : 0.22,
        onHop: (node) => machine.pulse(node),
      });
      if (id !== this.runId) return;
      machine.pulse(to ?? step.to);
    } else {
      await wait(Math.max(0.6, duration) * 1000);
      if (id !== this.runId) return;
    }
    // linger so the narration can be read
    const lingerMs = reduce ? 900 : Math.max(1600, 2600 / speed);
    await wait(lingerMs);
    if (id !== this.runId) return;
    this.stepRunning = false;
    if (s.playing) this.next();
  }
}

function nearestVisible(id: ComponentId): ComponentId | null {
  // fallback when a component is hidden at the current complexity level
  const fallback: Partial<Record<ComponentId, ComponentId[]>> = {
    'dns-cdn': ['frontend'],
    security: ['dns-cdn', 'frontend'],
    'load-balancer': ['api-gateway', 'backend'],
    'api-gateway': ['backend'],
    auth: ['backend'],
    cache: ['database'],
    storage: ['database'],
    queue: ['backend'],
    ai: ['backend'],
    'third-party': ['backend'],
    observability: ['infra'],
    cicd: ['infra'],
  };
  for (const alt of fallback[id] ?? []) if (runtime.machine.isVisible(alt)) return alt;
  return runtime.machine.isVisible('backend') ? 'backend' : null;
}

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export const scenarioPlayer = new ScenarioPlayer();
