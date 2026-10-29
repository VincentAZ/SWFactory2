import { store } from '../app/store';
import { SCENARIOS } from '../content/scenarios';
import { COMPONENT_MAP } from '../content/components';
import { PACKET_COLORS } from '../three/palette';
import { h, clear, icon, button, copyToClipboard, mount } from './dom';
import { scenarioPlayer, type ScenarioStatus } from '../app/scenarioPlayer';
import { select } from '../app/actions';

const LEVEL_NAMES = ['', 'Simple', 'Standard', 'Production'];

export function createScenariosPanel() {
  const el = h('div', { class: 'modepanel' });

  function renderList() {
    clear(el);
    const p = store.get().progress;
    mount(el, 
      h('div', { class: 'modepanel__head' },
        h('h2', null, icon('route', 20), 'Scenarios'),
        h('p', { class: 'muted' }, 'Simulate a real user action and watch requests travel through the machine. Higher complexity levels reveal more stops along the way.'),
      ),
      h('div', { class: 'cards' }, SCENARIOS.map((sc) => {
        const done = p.scenariosDone.includes(sc.id);
        return h('button', { class: `card ${done ? 'is-done' : ''}`, onClick: () => scenarioPlayer.start(sc.id, { autoplay: true }) },
          h('div', { class: 'card__icon' }, sc.icon),
          h('div', { class: 'card__body' },
            h('div', { class: 'card__title' }, sc.title, done ? h('span', { class: 'chip chip--done' }, icon('check', 10), 'done') : null),
            h('p', null, sc.summary),
            h('div', { class: 'card__meta' }, `${sc.steps.length} steps`, ' · best at ', LEVEL_NAMES[sc.level], '+'),
          ),
          icon('play', 16),
        );
      })),
      h('div', { class: 'legend' },
        h('h4', null, 'Packet colors'),
        h('div', { class: 'legend__items' }, (Object.keys(PACKET_COLORS) as (keyof typeof PACKET_COLORS)[]).map((k) =>
          h('span', { class: 'legend__item' }, h('span', { class: 'dot', style: { background: PACKET_COLORS[k] } }), k),
        )),
      ),
    );
  }

  function renderPlayer(s: ScenarioStatus) {
    clear(el);
    const { scenario, step, phase } = s;
    const cur = scenario.steps[Math.max(0, step)];
    const speed = store.get().activeScenario?.speed ?? 1;
    mount(el, 
      h('div', { class: 'player__head' },
        button('All scenarios', { icon: 'chevronLeft', small: true, class: 'btn--ghost', onClick: () => scenarioPlayer.stop() }),
        h('h2', null, scenario.icon, ' ', scenario.title),
      ),
      h('div', { class: 'player__controls' },
        button('', { icon: 'prev', small: true, title: 'Previous step', onClick: () => scenarioPlayer.prev() }),
        button(s.playing ? 'Pause' : phase === 'done' ? 'Replay' : 'Play', {
          icon: s.playing ? 'pause' : 'play',
          primary: true,
          small: true,
          onClick: () => (phase === 'done' ? scenarioPlayer.goTo(0) : scenarioPlayer.togglePlay()),
        }),
        button('', { icon: 'next', small: true, title: 'Next step', onClick: () => scenarioPlayer.next() }),
        button('', { icon: 'focus', small: true, title: 'Follow the action with the camera', class: scenarioPlayer.follow ? 'is-on' : '', onClick: () => scenarioPlayer.toggleFollow() }),
        h('span', { class: 'grow' }),
        h('div', { class: 'seg seg--small' }, [0.5, 1, 2].map((v) => h('button', { class: `seg__btn ${speed === v ? 'is-active' : ''}`, onClick: () => { scenarioPlayer.setSpeed(v); renderPlayer(scenarioPlayer.current!); } }, `${v}×`))),
      ),
      h('div', { class: 'player__current' },
        phase === 'done'
          ? h('div', null,
              h('h3', null, icon('check', 18), 'What to remember'),
              h('ul', { class: 'list' }, scenario.takeaways.map((t) => h('li', null, t))),
              h('h4', null, 'Ask your AI'),
              scenario.askAi.map((q) => h('div', { class: 'ask__item' }, h('p', null, q), button('', { icon: 'copy', small: true, class: 'btn--ghost btn--icon', title: 'Copy', onClick: async () => { await copyToClipboard(q); store.toast('Copied', '📋'); } }))),
            )
          : h('div', null,
              h('div', { class: 'player__route' },
                h('span', { class: 'packet', style: { background: PACKET_COLORS[cur.kind] } }),
                h('span', null, COMPONENT_MAP[cur.from].shortName),
                icon('chevronRight', 12),
                h('span', null, COMPONENT_MAP[cur.to].shortName),
                s.hops.length > 2 ? h('span', { class: 'muted' }, ` via ${s.hops.slice(1, -1).map((hId) => COMPONENT_MAP[hId].shortName).join(' → ')}`) : null,
              ),
              h('h3', null, cur.label),
              h('p', { class: 'player__narration' }, cur.narration),
              cur.insight ? h('div', { class: 'insight' }, icon('sparkle', 14), h('span', null, cur.insight)) : null,
            ),
      ),
      h('ol', { class: 'steps' }, scenario.steps.map((st, i) =>
        h('li', { class: `step ${i === step ? 'is-current' : ''} ${i < step || phase === 'done' ? 'is-past' : ''}`, onClick: () => scenarioPlayer.goTo(i) },
          h('span', { class: 'step__n' }, i + 1),
          h('span', { class: 'step__label' }, st.label),
          h('button', { class: 'step__who', title: COMPONENT_MAP[st.to].name, onClick: (e: Event) => { e.stopPropagation(); select(st.to, { focus: true }); } }, COMPONENT_MAP[st.to].shortName),
        ),
      )),
    );
  }

  scenarioPlayer.on((s) => {
    if (s) renderPlayer(s);
    else renderList();
  });
  store.on(['progress'], () => { if (!scenarioPlayer.current) renderList(); });
  return { el };
}
