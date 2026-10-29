import { store } from '../app/store';
import { DECISIONS, DECISION_MAP } from '../content/decisions';
import { COMPONENT_MAP } from '../content/components';
import type { DecisionMetrics } from '../app/types';
import { h, clear, icon, button, copyToClipboard, mount } from './dom';
import { openDecision, chooseOption, clearDecision } from '../app/actions';

const METRICS: { key: keyof DecisionMetrics; label: string; hint: string; invert?: boolean }[] = [
  { key: 'speedToLaunch', label: 'Speed to launch', hint: 'How fast you can ship a first version' },
  { key: 'cost', label: 'Cost', hint: 'Money spent early on (more dots = more expensive)', invert: true },
  { key: 'complexity', label: 'Complexity', hint: 'How much there is to understand and operate (more dots = harder)', invert: true },
  { key: 'scalability', label: 'Scales to', hint: 'How far it goes before you must change it' },
  { key: 'control', label: 'Control', hint: 'How much you can customize and own' },
];

export function createDecisionsPanel() {
  const el = h('div', { class: 'modepanel' });

  function renderList() {
    clear(el);
    const p = store.get().progress;
    mount(el, 
      h('div', { class: 'modepanel__head' },
        h('h2', null, icon('flask', 20), 'Decision lab'),
        h('p', { class: 'muted' }, 'The architecture choices founders actually face. Pick an option, see what it does to the machine, and compare the trade-offs.'),
      ),
      h('div', { class: 'cards' }, DECISIONS.map((d) => {
        const done = p.decisionsTried.includes(d.id);
        return h('button', { class: `card ${done ? 'is-done' : ''}`, onClick: () => { openDecision(d.id); renderActive(); } },
          h('div', { class: 'card__body' },
            h('div', { class: 'card__title' }, d.title, done ? h('span', { class: 'chip chip--done' }, icon('check', 10), 'tried') : null),
            h('p', null, d.question),
          ),
          icon('chevronRight', 16),
        );
      })),
    );
  }

  function renderActive() {
    const a = store.get().activeDecision;
    if (!a) return renderList();
    const d = DECISION_MAP[a.id];
    const chosen = d.options.find((o) => o.id === a.option) ?? null;
    clear(el);
    mount(el, 
      h('div', { class: 'player__head' },
        button('All decisions', { icon: 'chevronLeft', small: true, class: 'btn--ghost', onClick: () => { clearDecision(); renderList(); } }),
        h('h2', null, d.title),
      ),
      h('p', { class: 'lead' }, d.question),
      h('p', { class: 'muted' }, d.context),
      h('div', { class: 'options' }, d.options.map((o) =>
        h('button', { class: `option ${chosen?.id === o.id ? 'is-active' : ''}`, onClick: () => { chooseOption(d.id, o.id); renderActive(); } },
          h('div', { class: 'option__title' }, o.label),
          h('p', null, o.summary),
        ),
      )),
      chosen
        ? h('div', { class: 'consequence' },
            h('h3', null, 'Consequences of ', h('em', null, chosen.label)),
            h('div', { class: 'metrics' },
              h('div', { class: 'metrics__row metrics__row--head' }, h('span', null), d.options.map((o) => h('span', { class: `metrics__col ${o.id === chosen.id ? 'is-active' : ''}` }, o.label))),
              METRICS.map((m) => h('div', { class: 'metrics__row', title: m.hint },
                h('span', { class: 'metrics__label' }, m.label),
                d.options.map((o) => h('span', { class: `metrics__col ${o.id === chosen.id ? 'is-active' : ''}` }, dots(o.metrics[m.key], m.invert))),
              )),
            ),
            h('div', { class: 'proscons' },
              h('div', null, h('h4', null, 'Why you would'), h('ul', { class: 'list list--pro' }, chosen.pros.map((x) => h('li', null, x)))),
              h('div', null, h('h4', null, 'Why you would not'), h('ul', { class: 'list list--con' }, chosen.cons.map((x) => h('li', null, x)))),
            ),
            h('p', null, h('strong', null, 'Best for: '), chosen.bestFor),
            h('div', { class: 'machine-effect' },
              h('h4', null, 'In the machine'),
              h('p', null,
                'Spotlit: ', chosen.spotlight.map((c) => COMPONENT_MAP[c].shortName).join(', '),
                chosen.removes?.length ? ['. Dimmed: ', chosen.removes.map((c) => COMPONENT_MAP[c].shortName).join(', ')] : null,
                '.',
              ),
            ),
            h('div', { class: 'insight' }, icon('sparkle', 14), h('span', null, h('strong', null, 'Rule of thumb: '), d.rule)),
            h('div', { class: 'ask__item' },
              h('p', null, chosen.askAi),
              button('', { icon: 'copy', small: true, class: 'btn--ghost btn--icon', title: 'Copy', onClick: async () => { await copyToClipboard(chosen.askAi); store.toast('Copied', '📋'); } }),
            ),
          )
        : h('p', { class: 'hint' }, icon('chevronDown', 14), 'Pick an option above to see its consequences.'),
    );
  }

  function dots(n: number, invert?: boolean) {
    const wrap = h('span', { class: `dots-meter ${invert ? 'is-cost' : ''}`, 'aria-label': `${n} of 5` });
    for (let i = 1; i <= 5; i++) mount(wrap, h('i', { class: i <= n ? 'on' : '' }));
    return wrap;
  }

  store.on(['activeDecision', 'mode'], (s) => {
    if (s.mode !== 'decisions') return;
    if (s.activeDecision) renderActive();
    else renderList();
  });
  return { el };
}
