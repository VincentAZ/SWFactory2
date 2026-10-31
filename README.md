# StackWorks

**Live:** https://stackworks-dusky.vercel.app · **Source:** https://github.com/VincentAZ/SWFactory2

**An interactive 3D museum exhibit that teaches nontechnical founders how modern software applications work, and what to ask an AI that writes the code.**

StackWorks turns the client-server software stack into a friendly mechanical machine you can walk around, take apart, and run. Seventeen stations (people and devices, frontend, DNS/CDN, security, load balancer, API gateway, auth, backend, database, cache, storage, queue and workers, AI services, third-party APIs, observability, CI/CD, cloud infrastructure) sit on a platform connected by glass pipes. Data travels through the pipes as glowing packets.

## What you can do

- **Explore.** Rotate, zoom, click any station. Each opens a plain-English story: purpose, how it connects, technologies and vendors, real-world examples, common mistakes, a quiz, and the questions you should ask an AI when designing, building, and verifying that part.
- **Reading lens.** Every station's copy comes in two voices. **Founder** (the default) is analogy-first and plain-language: a "Think of it as" metaphor, a 2–3 sentence description with no unexplained jargon, an "In the real world" example from a small-business app, and 2–3 copy-paste "Ask your AI" prompts. **Builder** is the fuller technical version. The toggle lives in the left dock, the station header, and Settings; it changes copy only.
- **Dissect.** An explode slider separates the machine into layers. X-ray reveals the internals. Isolate dims everything except one component and its neighbours. Layer filters highlight client, edge, application, data, or platform.
- **Grow.** A complexity dial (Simple → Standard → Production) adds components and pipes. The machine physically grows: parts glide to new positions and the platform expands.
- **Scenarios.** Eight simulations (open the app, sign up and log in, upload a photo, ask the AI assistant, buy something, ship a feature, something breaks at 3am, go viral). Requests travel station to station with narration, insights, takeaways, and prompts for your AI assistant. Routes get longer as complexity increases.
- **Tours.** Six narrated camera tours, from a 5-minute big picture to "Building it with AI", the founder's workflow for directing an AI to write 100% of the code.
- **Decision lab.** Eight real architecture decisions (hosting model, monolith vs microservices, database type, auth strategy, AI hosting, background work, caching, web vs mobile). Pick an option and see its consequences in the machine and across five trade-off metrics.
- **Blueprint builder.** Describe your app (archetype plus features). The machine lights up with the parts you need, and the app generates a complete Markdown build brief to paste into Claude Code, Cursor, or any AI coding assistant.
- **Learning path.** Three levels (Explorer, Builder, Architect) with missions. Progress is stored locally; finishing a level unlocks the next, bigger machine.

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-checks, then bundles to dist/
npm run preview    # serves dist/ on http://localhost:4173
npm test           # content-integrity tests (node --test)
```

Optional visual smoke test (requires Google Chrome at `/usr/bin/google-chrome`):

```bash
npm run preview &
node scripts/shoot.mjs http://localhost:4173/ /tmp/sw-shots
```

URL parameters are handy for deep links: `?focus=backend`, `?mode=scenarios`, `?level=3`.

## Keyboard

`/` search · `?` help · `1 2 3` complexity · `← →` tour/scenario steps · `Space` play/pause · `X` x-ray · `E` explode · `I` isolate · `L` labels · `F` ambient traffic · `R` reset · `Esc` close/exit.

## Technology

- **Three.js** (WebGL) with a custom procedural machine: every part is built from primitives in code, no external models or textures. Soft shadows, a room environment for reflections, and a bloom pass for packets.
- **TypeScript + Vite**, no UI framework. A small store (`src/app/store.ts`) drives both the 3D scene and the DOM panels.
- **Performance:** instanced packets, cached geometries, capped pixel ratio, and adaptive quality that lowers resolution and then disables bloom if the frame rate drops. Rendering pauses when the tab is hidden. Reduced-motion preference is respected.
- **No backend, no tracking.** Progress and the reading-lens choice live in `localStorage`.

## Project layout

```
src/
  app/        store, actions, scenario player, tour player
  three/      scene & post-processing, machine assembly, parts/, pipes, packets, labels, interaction
  content/    all educational content: components (A/B/C), founder-lens copy, glossary, scenarios, tours, decisions, blueprint, levels
  ui/         DOM panels: inspector, tours, scenarios, decision lab, blueprint, learning path, chrome, overlays, lens toggle
  styles/     base.css (stage, labels) and ui.css (panels, controls)
tests/        content-integrity tests
scripts/      headless visual smoke test
```

## Editing the content

Everything a learner reads lives in `src/content/`.

- **Builder lens** (the technical copy) is in `componentsA/B/C.ts`. Each component entry has: `tagline`, `analogy`, `purpose` paragraphs, `howItConnects`, `tech` groups with vendors, `examples`, `mistakes`, `askAi` question groups (Designing / Building / Verifying), and `quiz` questions.
- **Founder lens** (the default, plain-language copy) is in `founder.ts`, keyed by component id: `tagline`, `analogy`, `description` (2–3 sentences), `realWorld`, and 2–3 `askAi` prompts. The content test enforces the sentence count and flags unexplained acronyms.
- Tours, scenarios, and decisions have a single copy, written to the same plain-language standard: any term a Salesforce-literate non-engineer wouldn't know is explained in-line on first use. Scenarios are lists of steps (`from`, `to`, packet `kind`, `narration`, optional `insight`); the machine routes each step through whatever pipes exist at the current complexity level.

Run `npm test` after editing to catch broken references.
