import type { ComponentId, ComponentContent } from '../app/types';
import { store } from '../app/store';
import { COMPONENT_MAP, COMPONENT_ORDER } from '../content/components';
import { LAYERS } from '../content/layers';
import { PIPES } from '../three/layout';
import { SCENARIOS } from '../content/scenarios';
import { GLOSSARY_MAP } from '../content/glossary';
import { h, clear, icon, button, copyToClipboard, mount } from './dom';
import { select, toggleIsolate, focusOn, markQuizPassed, setMode } from '../app/actions';
import { scenarioPlayer } from '../app/scenarioPlayer';

type Tab = 'overview' | 'tech' | 'examples' | 'ask' | 'quiz';
const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'tech', label: 'Technologies' },
  { id: 'examples', label: 'Examples & mistakes' },
  { id: 'ask', label: 'Ask the AI' },
  { id: 'quiz', label: 'Quiz' },
];

export function createInspector() {
  const el = h('div', { class: 'inspector' });
  let currentId: ComponentId | null = null;
  let tab: Tab = 'overview';

  function render() {
    clear(el);
    if (!currentId) return;
    const c = COMPONENT_MAP[currentId];
    const layer = LAYERS[c.layer];
    const s = store.get();

    const back = s.mode !== 'explore'
      ? button('Back', { icon: 'chevronLeft', small: true, class: 'btn--ghost', onClick: () => select(null) })
      : null;

    mount(el, 
      h('div', { class: 'insp__head', style: { '--accent': layer.color } as unknown as Record<string, string> },
        h('div', { class: 'insp__topline' },
          back,
          h('span', { class: 'chip chip--layer', style: { background: layer.color } }, layer.name),
          h('span', { class: 'chip chip--level' }, `Level ${c.level}`),
          h('span', { class: 'grow' }),
          button('', { icon: 'close', small: true, class: 'btn--ghost btn--icon', title: 'Close', onClick: () => select(null) }),
        ),
        h('h2', { class: 'insp__title' }, c.name),
        h('p', { class: 'insp__tagline' }, c.tagline),
        h('div', { class: 'insp__actions' },
          button('Focus', { icon: 'focus', small: true, onClick: () => focusOn(c.id) }),
          button(s.isolate ? 'Show all' : 'Isolate', { icon: 'eye', small: true, onClick: toggleIsolate, class: s.isolate ? 'is-on' : '' }),
          featuringScenario(c.id),
        ),
      ),
      h('div', { class: 'tabs', role: 'tablist' },
        TABS.map((t) =>
          h('button', { class: `tab ${tab === t.id ? 'is-active' : ''}`, role: 'tab', 'aria-selected': tab === t.id, onClick: () => { tab = t.id; render(); } },
            t.label,
            t.id === 'quiz' && s.progress.quizzesPassed.includes(c.id) ? icon('check', 12) : null,
          ),
        ),
      ),
      h('div', { class: 'insp__body' }, renderTab(c, tab)),
    );
  }

  function featuringScenario(id: ComponentId) {
    const sc = SCENARIOS.find((s) => s.steps.some((st) => st.from === id || st.to === id));
    if (!sc) return null;
    return button(`Watch: ${sc.title}`, {
      icon: 'play',
      small: true,
      onClick: () => {
        setMode('scenarios');
        scenarioPlayer.start(sc.id, { autoplay: true });
      },
    });
  }

  function renderTab(c: ComponentContent, t: Tab): HTMLElement {
    switch (t) {
      case 'overview':
        return h('div', null,
          h('blockquote', { class: 'analogy' }, h('span', { class: 'analogy__label' }, 'Think of it as'), c.analogy),
          c.purpose.map((p) => h('p', null, p)),
          h('h4', null, 'How it connects'),
          h('p', null, c.howItConnects),
          h('div', { class: 'chips' }, neighbours(c.id).map((n) =>
            h('button', { class: 'chip chip--link', onClick: () => select(n) }, h('span', { class: 'dot', style: { background: LAYERS[COMPONENT_MAP[n].layer].color } }), COMPONENT_MAP[n].shortName),
          )),
          c.glossary?.length ? h('details', { class: 'glossary' },
            h('summary', null, icon('book', 14), 'Words to know'),
            h('dl', null, c.glossary.filter((g) => GLOSSARY_MAP[g]).map((g) => [h('dt', null, GLOSSARY_MAP[g].term), h('dd', null, GLOSSARY_MAP[g].def)])),
          ) : null,
        );
      case 'tech':
        return h('div', null,
          h('p', { class: 'muted' }, 'Popular, well-supported options. AI coding tools know these well, which matters more than any benchmark.'),
          c.tech.map((g) => h('section', { class: 'techgroup' },
            h('h4', null, g.label),
            h('ul', { class: 'vendors' }, g.items.map((v) => h('li', null, h('strong', null, v.name), h('span', null, v.note)))),
          )),
        );
      case 'examples':
        return h('div', null,
          h('h4', null, 'In the real world'),
          h('ul', { class: 'list list--examples' }, c.examples.map((e) => h('li', null, e))),
          h('h4', null, h('span', { class: 'warn' }, icon('alert', 14)), 'Common mistakes'),
          h('ul', { class: 'list list--mistakes' }, c.mistakes.map((e) => h('li', null, e))),
        );
      case 'ask':
        return renderAsk(c);
      case 'quiz':
        return renderQuiz(c);
    }
  }

  function renderAsk(c: ComponentContent): HTMLElement {
    const all = c.askAi.flatMap((g) => g.questions);
    return h('div', { class: 'ask' },
      h('p', { class: 'muted' }, 'Copy these into your AI coding assistant. Replace anything in [brackets] with your own choice. The best results come from asking one clear question at a time.'),
      h('div', { class: 'ask__toolbar' },
        button('Copy all questions', { icon: 'copy', small: true, onClick: async () => { const ok = await copyToClipboard(all.map((q) => `- ${q}`).join('\n')); store.toast(ok ? 'Copied all questions' : 'Could not copy', ok ? '📋' : '⚠️'); } }),
      ),
      c.askAi.map((g) => h('section', { class: 'askgroup' },
        h('h4', null, g.label),
        g.questions.map((q) => h('div', { class: 'ask__item' },
          h('p', null, q),
          button('', { icon: 'copy', small: true, class: 'btn--ghost btn--icon', title: 'Copy question', onClick: async () => { const ok = await copyToClipboard(q); store.toast(ok ? 'Copied' : 'Could not copy', '📋'); } }),
        )),
      )),
    );
  }

  function renderQuiz(c: ComponentContent): HTMLElement {
    const answers = new Map<number, number>();
    const wrap = h('div', { class: 'quiz' });
    const passed = store.get().progress.quizzesPassed.includes(c.id);
    const status = h('div', { class: 'quiz__status' }, passed ? [icon('check', 14), 'You passed this quiz.'] : 'Answer every question correctly to pass.');
    mount(wrap, status);
    c.quiz.forEach((q, qi) => {
      const block = h('div', { class: 'quiz__q' }, h('p', { class: 'quiz__question' }, `${qi + 1}. ${q.q}`));
      const why = h('p', { class: 'quiz__why' });
      const opts = q.options.map((o, oi) =>
        h('button', { class: 'quiz__opt', onClick: () => {
          answers.set(qi, oi);
          opts.forEach((b, i) => {
            b.classList.toggle('is-correct', i === q.answer && answers.get(qi) !== undefined);
            b.classList.toggle('is-wrong', i === oi && oi !== q.answer);
            b.classList.toggle('is-picked', i === oi);
          });
          why.textContent = (oi === q.answer ? 'Correct. ' : 'Not quite. ') + q.why;
          why.classList.add('is-visible');
          if (c.quiz.every((qq, i) => answers.get(i) === qq.answer)) {
            markQuizPassed(c.id);
            status.replaceChildren(icon('check', 14), 'You passed this quiz.');
          }
        } }, o),
      );
      mount(block, h('div', { class: 'quiz__opts' }, opts), why);
      mount(wrap, block);
    });
    return wrap;
  }

  function neighbours(id: ComponentId): ComponentId[] {
    const level = store.get().complexity;
    const set = new Set<ComponentId>();
    for (const p of PIPES) {
      if (p.level > level) continue;
      if (p.from === id) set.add(p.to);
      if (p.to === id) set.add(p.from);
    }
    return COMPONENT_ORDER.filter((c) => set.has(c));
  }

  store.on(['selected', 'mode', 'isolate'], (s) => {
    if (s.selected !== currentId) tab = 'overview';
    currentId = s.selected;
    render();
  });
  store.on(['progress'], () => { if (currentId && tab !== 'quiz') render(); }, false);

  return { el };
}
