import { store } from '../app/store';
import { TOURS } from '../content/tours';
import { h, clear, icon, button, mount } from './dom';
import { startTourById } from '../app/actions';
import { tourPlayer } from '../app/tourPlayer';
import { scenarioPlayer } from '../app/scenarioPlayer';

const LEVEL_NAMES = ['', 'Explorer', 'Builder', 'Architect'];

export function createToursPanel() {
  const el = h('div', { class: 'modepanel' });
  function render() {
    clear(el);
    const p = store.get().progress;
    mount(el, 
      h('div', { class: 'modepanel__head' },
        h('h2', null, icon('map', 20), 'Guided tours'),
        h('p', { class: 'muted' }, 'Narrated walks through the machine. The camera moves for you; read at your own pace. Press → to advance.'),
      ),
      h('div', { class: 'cards' }, TOURS.map((t) => {
        const done = p.toursDone.includes(t.id);
        return h('button', { class: `card ${done ? 'is-done' : ''}`, onClick: () => startTourById(t.id) },
          h('div', { class: 'card__icon' }, t.icon),
          h('div', { class: 'card__body' },
            h('div', { class: 'card__title' }, t.title, done ? h('span', { class: 'chip chip--done' }, icon('check', 10), 'done') : null),
            h('p', null, t.summary),
            h('div', { class: 'card__meta' }, `${t.minutes} min`, ' · ', `${t.stops.length} stops`, ' · ', LEVEL_NAMES[t.level]),
          ),
          icon('chevronRight', 16),
        );
      })),
    );
  }
  store.on(['progress'], render);
  return { el };
}

/** The floating tour card shown over the 3D view while a tour is active */
export function createTourOverlay() {
  const el = h('div', { class: 'tourcard', hidden: true, role: 'dialog', 'aria-live': 'polite' });
  let scenarioNarration: HTMLElement | null = null;

  function render() {
    clear(el);
    const st = tourPlayer.current;
    if (!st) {
      el.hidden = true;
      return;
    }
    el.hidden = false;
    const { tour, index, stop } = st;
    const last = index === tour.stops.length - 1;
    scenarioNarration = h('div', { class: 'tourcard__scenario', hidden: true });
    mount(el, 
      h('div', { class: 'tourcard__top' },
        h('span', { class: 'tourcard__tour' }, tour.icon, ' ', tour.title),
        h('span', { class: 'grow' }),
        h('span', { class: 'tourcard__count' }, `${index + 1} / ${tour.stops.length}`),
        button('', { icon: 'close', small: true, class: 'btn--ghost btn--icon', title: 'Exit tour', onClick: () => tourPlayer.end() }),
      ),
      h('h3', { class: 'tourcard__title' }, stop.title),
      h('p', { class: 'tourcard__body' }, stop.body),
      stop.callouts?.length ? h('ul', { class: 'callouts' }, stop.callouts.map((c) => h('li', null, c))) : null,
      stop.runScenario ? h('div', { class: 'tourcard__play' },
        button('Play the scenario', { icon: 'play', primary: true, small: true, onClick: () => tourPlayer.playStopScenario() }),
        scenarioNarration,
      ) : null,
      h('div', { class: 'tourcard__nav' },
        button('Back', { icon: 'chevronLeft', small: true, onClick: () => tourPlayer.prev(), class: index === 0 ? 'is-disabled' : '' }),
        h('div', { class: 'dots' }, tour.stops.map((_, i) => h('button', { class: `dot-btn ${i === index ? 'is-active' : ''} ${i < index ? 'is-past' : ''}`, title: tour.stops[i].title, onClick: () => tourPlayer.goTo(i) }))),
        button(last ? 'Finish' : 'Next', { icon: last ? 'check' : 'chevronRight', primary: true, small: true, onClick: () => tourPlayer.next() }),
      ),
    );
  }

  tourPlayer.on(render);
  scenarioPlayer.on((s) => {
    if (!scenarioNarration || !tourPlayer.current) return;
    if (!s) {
      scenarioNarration.hidden = true;
      return;
    }
    scenarioNarration.hidden = false;
    const step = s.scenario.steps[Math.max(0, s.step)];
    clear(scenarioNarration);
    mount(scenarioNarration, 
      h('div', { class: 'tourcard__steplabel' }, s.phase === 'done' ? 'Scenario complete' : `Step ${s.step + 1}/${s.scenario.steps.length}: ${step.label}`),
      h('p', null, s.phase === 'done' ? s.scenario.takeaways[0] : step.narration),
    );
  });
  return el;
}
