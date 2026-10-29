// Content integrity tests. Bundles the TypeScript content modules with esbuild (shipped with Vite)
// so they can be loaded in plain Node without a browser.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

let C;

before(async () => {
  // keep the bundle inside the project so bare imports like 'three' resolve from node_modules
  const dir = path.resolve('node_modules/.cache/stackworks-tests');
  await mkdir(dir, { recursive: true });
  const outfile = path.join(dir, 'content.mjs');
  await build({
    entryPoints: [path.resolve('src/content/index.ts')],
    bundle: true,
    format: 'esm',
    platform: 'neutral',
    outfile,
    logLevel: 'silent',
    external: ['three'],
  });
  C = await import(pathToFileURL(outfile).href);
});

const IDS = () => new Set(C.COMPONENT_IDS);

test('there are 17 components, each with complete educational content', () => {
  assert.equal(C.COMPONENTS.length, 17);
  for (const c of C.COMPONENTS) {
    assert.ok(c.tagline.length > 20, `${c.id} tagline`);
    assert.ok(c.analogy.length > 20, `${c.id} analogy`);
    assert.ok(c.purpose.length >= 2, `${c.id} purpose paragraphs`);
    assert.ok(c.tech.length >= 2 && c.tech.every((g) => g.items.length >= 2), `${c.id} tech groups`);
    assert.ok(c.examples.length >= 3, `${c.id} examples`);
    assert.ok(c.mistakes.length >= 3, `${c.id} mistakes`);
    assert.ok(c.askAi.length >= 2, `${c.id} askAi groups`);
    assert.ok(c.askAi.flatMap((g) => g.questions).length >= 5, `${c.id} askAi questions`);
    assert.ok(c.quiz.length >= 1, `${c.id} quiz`);
    for (const q of c.quiz) {
      assert.ok(q.options.length >= 3, `${c.id} quiz options`);
      assert.ok(q.answer >= 0 && q.answer < q.options.length, `${c.id} quiz answer index`);
      assert.ok(q.why.length > 10, `${c.id} quiz explanation`);
    }
    for (const g of c.glossary ?? []) assert.ok(C.GLOSSARY_MAP[g], `${c.id} glossary term ${g} exists`);
    assert.ok([1, 2, 3].includes(c.level));
  }
  assert.deepEqual([...IDS()].sort(), [...C.COMPONENT_ORDER].sort());
});

test('layout and pipes reference valid components; every component is connected', () => {
  const ids = IDS();
  for (const id of ids) assert.ok(C.LAYOUT[id], `layout for ${id}`);
  const connected = new Set();
  for (const p of C.PIPES) {
    assert.ok(ids.has(p.from) && ids.has(p.to), `pipe ${p.id} endpoints`);
    assert.ok(p.level >= 1 && p.level <= 3);
    connected.add(p.from);
    connected.add(p.to);
  }
  for (const id of ids) if (id !== 'infra') assert.ok(connected.has(id), `${id} has at least one pipe`);
  const pipeIds = C.PIPES.map((p) => p.id);
  assert.equal(new Set(pipeIds).size, pipeIds.length, 'pipe ids unique');
});

function routeExists(from, to, level) {
  const adj = new Map();
  for (const p of C.PIPES) {
    if (p.level > level || (p.maxLevel !== undefined && level > p.maxLevel)) continue;
    if (!adj.has(p.from)) adj.set(p.from, []);
    if (!adj.has(p.to)) adj.set(p.to, []);
    adj.get(p.from).push(p.to);
    adj.get(p.to).push(p.from);
  }
  const seen = new Set([from]);
  const q = [from];
  while (q.length) {
    const cur = q.shift();
    if (cur === to) return true;
    for (const n of adj.get(cur) ?? []) if (!seen.has(n)) { seen.add(n); q.push(n); }
  }
  return from === to;
}

test('every scenario step is routable through the production machine', () => {
  const ids = IDS();
  for (const s of C.SCENARIOS) {
    assert.ok(s.steps.length >= 5, `${s.id} has enough steps`);
    assert.ok(s.takeaways.length >= 2 && s.askAi.length >= 1, `${s.id} takeaways/askAi`);
    for (const st of s.steps) {
      assert.ok(ids.has(st.from) && ids.has(st.to), `${s.id} step ${st.label}`);
      assert.ok(routeExists(st.from, st.to, 3), `${s.id}: no route ${st.from} -> ${st.to} at level 3`);
      assert.ok(st.narration.length > 30, `${s.id} narration`);
    }
  }
});

test('the level-1 machine connects its four essentials', () => {
  const l1 = C.COMPONENTS.filter((c) => c.level === 1).map((c) => c.id);
  assert.deepEqual(l1.sort(), ['backend', 'database', 'frontend', 'infra', 'users']);
  assert.ok(routeExists('users', 'database', 1));
  for (const id of l1) assert.ok(C.LAYOUT_SIMPLE[id], `simple layout for ${id}`);
});

test('tours reference valid components, pipes and scenarios', () => {
  const ids = IDS();
  const pipeIds = new Set(C.PIPES.map((p) => p.id));
  const scenarioIds = new Set(C.SCENARIOS.map((s) => s.id));
  for (const t of C.TOURS) {
    assert.ok(t.stops.length >= 5, `${t.id} stops`);
    for (const st of t.stops) {
      const f = st.focus ?? 'overview';
      const focusIds = f === 'overview' ? [] : Array.isArray(f) ? f : [f];
      for (const id of focusIds) assert.ok(ids.has(id), `${t.id}/${st.title} focus ${id}`);
      for (const p of st.highlightPipes ?? []) assert.ok(pipeIds.has(p), `${t.id}/${st.title} pipe ${p}`);
      if (st.runScenario) assert.ok(scenarioIds.has(st.runScenario), `${t.id} scenario ${st.runScenario}`);
    }
  }
});

test('decisions have three options with metrics in range and valid component references', () => {
  const ids = IDS();
  for (const d of C.DECISIONS) {
    assert.equal(d.options.length, 3, `${d.id} options`);
    for (const o of d.options) {
      for (const [k, v] of Object.entries(o.metrics)) assert.ok(v >= 1 && v <= 5, `${d.id}/${o.id} metric ${k}`);
      for (const c of [...o.spotlight, ...(o.removes ?? [])]) assert.ok(ids.has(c), `${d.id}/${o.id} component ${c}`);
      assert.ok(o.pros.length >= 2 && o.cons.length >= 2 && o.askAi.length > 20);
    }
  }
});

test('blueprint generates a complete brief and component list', () => {
  const ids = IDS();
  for (const a of C.ARCHETYPES) for (const c of a.baseComponents) assert.ok(ids.has(c), `${a.id} ${c}`);
  for (const f of C.FEATURES) for (const c of f.adds) assert.ok(ids.has(c), `${f.id} ${c}`);
  const input = { archetype: 'marketplace', features: ['payments', 'ai', 'uploads'], appName: 'Bloom', audience: 'florists', oneLiner: 'takes flower orders' };
  const comps = C.blueprintComponents(input);
  assert.ok(comps.includes('third-party') && comps.includes('ai') && comps.includes('storage'));
  const names = Object.fromEntries(C.COMPONENTS.map((c) => [c.id, c.name]));
  const brief = C.generateBrief(input, names);
  assert.match(brief, /# Build brief: Bloom/);
  assert.match(brief, /Stripe/);
  assert.match(brief, /No secrets in frontend code/);
  assert.ok(brief.split('\n').filter((l) => /^\d+\. /.test(l)).length >= 8, 'build order steps');
});

test('learning levels reference real tours, scenarios and decisions', () => {
  const tourIds = new Set(C.TOURS.map((t) => t.id));
  const scenarioIds = new Set(C.SCENARIOS.map((s) => s.id));
  const decisionIds = new Set(C.DECISIONS.map((d) => d.id));
  assert.equal(C.LEVELS.length, 3);
  for (const l of C.LEVELS) for (const m of l.missions) {
    if (m.kind === 'tour') assert.ok(tourIds.has(m.target), m.id);
    if (m.kind === 'scenario') assert.ok(scenarioIds.has(m.target), m.id);
    if (m.kind === 'decision' && m.target) assert.ok(decisionIds.has(m.target), m.id);
  }
});
