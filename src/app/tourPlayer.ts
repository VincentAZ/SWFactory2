import type { ComponentId, Tour, TourStop } from './types';
import { store } from './store';
import { runtime } from './context';
import { TOUR_MAP } from '../content/tours';
import { scenarioPlayer } from './scenarioPlayer';
import { focusOn, frameMany, markTourDone, markExplored, setView, overview } from './actions';

export interface TourStatus {
  tour: Tour;
  index: number;
  stop: TourStop;
}

type Listener = (s: TourStatus | null) => void;

class TourPlayer {
  private status: TourStatus | null = null;
  private listeners = new Set<Listener>();
  private dockWasOpen = true;

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

  start(id: string) {
    const tour = TOUR_MAP[id];
    if (!tour) return;
    scenarioPlayer.stop();
    const s = store.get();
    // tours may need a higher complexity to show their components
    if (s.complexity < tour.level) store.set({ complexity: tour.level });
    this.dockWasOpen = s.dockOpen;
    store.set({ activeTour: { id, stop: 0 }, selected: null, panelOpen: false, dockOpen: false, isolate: false, layerFilter: null, explode: 0, xray: false });
    this.status = { tour, index: 0, stop: tour.stops[0] };
    this.applyStop();
    this.emit();
  }

  end() {
    if (!this.status) return;
    scenarioPlayer.stop();
    runtime.machine.pipes.setHighlighted([]);
    runtime.machine.setSpotlight(new Set());
    store.set({ activeTour: null, explode: 0, xray: false, selected: null, dockOpen: this.dockWasOpen && window.innerWidth > 900 });
    this.status = null;
    this.emit();
  }

  next() {
    if (!this.status) return;
    const { tour, index } = this.status;
    if (index + 1 >= tour.stops.length) {
      markTourDone(tour.id);
      this.end();
      overview();
      return;
    }
    this.goTo(index + 1);
  }

  prev() {
    if (!this.status) return;
    this.goTo(Math.max(0, this.status.index - 1));
  }

  goTo(i: number) {
    if (!this.status) return;
    scenarioPlayer.stop();
    this.status = { tour: this.status.tour, index: i, stop: this.status.tour.stops[i] };
    store.set({ activeTour: { id: this.status.tour.id, stop: i } });
    this.applyStop();
    this.emit();
  }

  playStopScenario() {
    const stop = this.status?.stop;
    if (!stop?.runScenario) return;
    scenarioPlayer.start(stop.runScenario, { autoplay: true });
  }

  private applyStop() {
    const st = this.status!.stop;
    const m = runtime.machine;
    store.set({ explode: st.explode ?? 0, xray: st.xray ?? false });
    m.pipes.setHighlighted(st.highlightPipes ?? []);
    const focus = st.focus ?? 'overview';
    if (focus === 'overview') {
      m.setSpotlight(new Set());
      store.set({ selected: null });
      setView(st.view ?? 'overview');
    } else if (Array.isArray(focus)) {
      m.setSpotlight(new Set(focus));
      store.set({ selected: null });
      frameMany(focus);
      focus.forEach(markExplored);
    } else {
      const id = focus as ComponentId;
      m.setSpotlight(new Set([id]));
      store.set({ selected: id });
      markExplored(id);
      if (st.view === 'closeup' || !st.view) focusOn(id, { elevation: 0.38 });
      else setView(st.view);
    }
  }
}

export const tourPlayer = new TourPlayer();
