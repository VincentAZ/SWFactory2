import { store } from '../app/store';
import { ARCHETYPES, FEATURES, blueprintComponents, generateBrief, type BlueprintInput } from '../content/blueprint';
import { COMPONENT_NAMES, COMPONENT_MAP } from '../content/components';
import { h, clear, icon, button, copyToClipboard, mount } from './dom';
import { previewBlueprint, markBlueprintBuilt, select } from '../app/actions';

export function createBlueprintPanel() {
  const el = h('div', { class: 'modepanel' });
  const input: BlueprintInput = { archetype: 'saas', features: [], appName: '', audience: '', oneLiner: '' };
  let brief: string | null = null;

  function render() {
    clear(el);
    const comps = blueprintComponents(input);
    mount(el, 
      h('div', { class: 'modepanel__head' },
        h('h2', null, icon('blueprint', 20), 'Blueprint builder'),
        h('p', { class: 'muted' }, 'Describe your app. Watch the machine light up with the parts you need, then generate a complete brief to hand to your AI coding assistant.'),
      ),
      h('div', { class: 'form' },
        h('label', null, 'App name', h('input', { type: 'text', value: input.appName, placeholder: 'e.g. Bloom', oninput: (e: Event) => { input.appName = (e.target as HTMLInputElement).value; brief = null; } })),
        h('label', null, 'One sentence: what does it do?', h('input', { type: 'text', value: input.oneLiner, placeholder: 'e.g. helps florists take orders and schedule deliveries', oninput: (e: Event) => { input.oneLiner = (e.target as HTMLInputElement).value; brief = null; } })),
        h('label', null, 'Who is it for?', h('input', { type: 'text', value: input.audience, placeholder: 'e.g. independent florists in the US', oninput: (e: Event) => { input.audience = (e.target as HTMLInputElement).value; brief = null; } })),
      ),
      h('h4', null, 'What kind of app?'),
      h('div', { class: 'archetypes' }, ARCHETYPES.map((a) =>
        h('button', { class: `arche ${input.archetype === a.id ? 'is-active' : ''}`, title: a.description, onClick: () => { input.archetype = a.id; brief = null; update(); } },
          h('span', { class: 'arche__icon' }, a.icon), h('span', null, a.name)),
      )),
      h('h4', null, 'Which features?'),
      h('div', { class: 'features' }, FEATURES.map((f) => {
        const on = input.features.includes(f.id);
        return h('button', { class: `feat ${on ? 'is-active' : ''}`, title: f.description, 'aria-pressed': on, onClick: () => {
          input.features = on ? input.features.filter((x) => x !== f.id) : [...input.features, f.id];
          brief = null;
          update();
        } }, h('span', null, f.icon), h('span', null, f.name), on ? icon('check', 12) : null);
      })),
      h('h4', null, `Your machine needs ${comps.length} parts`),
      h('div', { class: 'chips' }, comps.map((c) => h('button', { class: 'chip chip--link', onClick: () => select(c, { focus: true }) }, COMPONENT_MAP[c].shortName))),
      h('div', { class: 'bp__actions' },
        button(brief ? 'Regenerate brief' : 'Generate AI build brief', { icon: 'sparkle', primary: true, onClick: () => { brief = generateBrief(input, COMPONENT_NAMES); markBlueprintBuilt(); store.toast('Brief generated. Copy it into your AI assistant.', '📄'); render(); el.querySelector('.brief')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }),
      ),
      brief ? h('div', { class: 'brief' },
        h('div', { class: 'brief__bar' },
          h('span', null, 'Markdown brief · ', `${brief.split(/\s+/).length} words`),
          h('span', { class: 'grow' }),
          button('Copy', { icon: 'copy', small: true, onClick: async () => { const ok = await copyToClipboard(brief!); store.toast(ok ? 'Brief copied' : 'Could not copy', '📋'); } }),
          button('Download', { icon: 'download', small: true, onClick: () => download(`${(input.appName || 'my-app').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-build-brief.md`, brief!) }),
        ),
        h('pre', { class: 'brief__text' }, brief),
      ) : h('p', { class: 'hint' }, 'The brief includes the stack, non-negotiables, a step-by-step build order, and the questions to ask before writing code.'),
    );
  }

  function update() {
    render();
    if (store.get().mode === 'blueprint') previewBlueprint(blueprintComponents(input));
  }

  function download(name: string, text: string) {
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = h('a', { href: url, download: name });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  store.on(['mode'], (s) => {
    if (s.mode === 'blueprint') update();
  });
  render();
  return { el };
}
