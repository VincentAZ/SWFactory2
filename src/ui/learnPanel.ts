import { store } from '../app/store';
import { LEVELS } from '../content/levels';
import type { Mission, Complexity } from '../app/types';
import { h, clear, icon, button, mount } from './dom';
import { missionDone, levelCompletion, setLevelManually, setMode, startTourById, openDecision } from '../app/actions';
import { scenarioPlayer } from '../app/scenarioPlayer';
import { COMPONENTS } from '../content/components';

export function createLearnPanel() {
  const el = h('div', { class: 'modepanel' });

  function go(m: Mission) {
    switch (m.kind) {
      case 'tour':
        setMode('tours');
        startTourById(m.target!);
        break;
      case 'scenario':
        setMode('scenarios');
        scenarioPlayer.start(m.target!, { autoplay: true });
        break;
      case 'explore':
        setMode('explore');
        store.set({ dockOpen: true });
        break;
      case 'quiz':
        setMode('explore');
        store.set({ dockOpen: true });
        store.toast('Open any component and try its Quiz tab', '🧠');
        break;
      case 'decision':
        setMode('decisions');
        if (m.target) openDecision(m.target);
        break;
      case 'blueprint':
        setMode('blueprint');
        break;
    }
  }

  function render() {
    clear(el);
    const p = store.get().progress;
    mount(el, 
      h('div', { class: 'modepanel__head' },
        h('h2', null, icon('graduation', 20), 'My learning path'),
        h('p', { class: 'muted' }, 'Three levels. Each unlocks a more complete machine. Finish the missions, or jump ahead if you are impatient.'),
      ),
      h('div', { class: 'stats' },
        stat(p.explored.length, COMPONENTS.length, 'components explored'),
        stat(p.quizzesPassed.length, COMPONENTS.length, 'quizzes passed'),
        stat(p.toursDone.length, 6, 'tours done'),
        stat(p.scenariosDone.length, 8, 'scenarios run'),
      ),
      LEVELS.map((l) => {
        const { done, total } = levelCompletion(l.level);
        const unlocked = l.level <= p.level;
        const current = l.level === p.level;
        return h('section', { class: `level ${current ? 'is-current' : ''} ${unlocked ? '' : 'is-locked'}` },
          h('div', { class: 'level__head' },
            h('div', { class: 'level__badge' }, unlocked ? l.level : icon('lock', 14)),
            h('div', { class: 'grow' },
              h('h3', null, `Level ${l.level}: ${l.name}`, current ? h('span', { class: 'chip chip--done' }, 'current') : null),
              h('p', { class: 'muted' }, l.subtitle),
            ),
            !current ? button(unlocked ? 'Revisit' : 'Jump here', { small: true, onClick: () => setLevelManually(l.level as Complexity) }) : null,
          ),
          h('div', { class: 'progress' }, h('div', { class: 'progress__bar', style: { width: `${(done / total) * 100}%` } })),
          h('p', { class: 'muted small' }, `${done} of ${total} missions`),
          h('p', null, l.description),
          h('ul', { class: 'missions' }, l.missions.map((m) => {
            const ok = missionDone(m);
            return h('li', { class: `mission ${ok ? 'is-done' : ''}` },
              h('span', { class: 'mission__check' }, ok ? icon('check', 12) : null),
              h('span', { class: 'grow' }, m.title),
              !ok ? button('Go', { small: true, class: 'btn--ghost', onClick: () => go(m) }) : null,
            );
          })),
        );
      }),
      h('div', { class: 'danger' }, button('Reset my progress', { small: true, class: 'btn--ghost', onClick: () => {
        if (confirm('Reset all progress? This clears explored components, quizzes, tours, and your level.')) {
          store.updateProgress(() => ({ explored: [], toursDone: [], scenariosDone: [], quizzesPassed: [], decisionsTried: [], blueprintsBuilt: 0, level: 1, onboarded: true }));
          setLevelManually(1);
        }
      } })),
    );
  }

  function stat(n: number, of: number, label: string) {
    return h('div', { class: 'stat' }, h('div', { class: 'stat__n' }, n, h('span', null, `/${of}`)), h('div', { class: 'stat__label' }, label));
  }

  store.on(['progress', 'mode'], render);
  return { el };
}
