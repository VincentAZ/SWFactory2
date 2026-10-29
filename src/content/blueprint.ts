import type { BlueprintArchetype, BlueprintFeature, ComponentId } from '../app/types';

export const ARCHETYPES: BlueprintArchetype[] = [
  {
    id: 'saas',
    name: 'SaaS tool',
    icon: '🧰',
    description: 'A subscription web app for businesses or professionals: dashboards, records, team accounts.',
    baseComponents: ['users', 'frontend', 'dns-cdn', 'api-gateway', 'auth', 'backend', 'database', 'cicd', 'observability', 'infra'],
    mustHaves: ['Team/workspace accounts with roles', 'Subscription billing', 'Audit-friendly data model', 'Export of user data'],
  },
  {
    id: 'marketplace',
    name: 'Marketplace',
    icon: '🛒',
    description: 'Two-sided: buyers and sellers, listings, search, payments with payouts.',
    baseComponents: ['users', 'frontend', 'dns-cdn', 'api-gateway', 'auth', 'backend', 'database', 'storage', 'third-party', 'cache', 'cicd', 'observability', 'infra'],
    mustHaves: ['Listings with photos', 'Search and filters', 'Payments and seller payouts', 'Reviews and messaging', 'Fraud and dispute handling'],
  },
  {
    id: 'ai-assistant',
    name: 'AI assistant / copilot',
    icon: '✨',
    description: 'A product whose core value is an AI that chats, answers from documents, or generates content.',
    baseComponents: ['users', 'frontend', 'dns-cdn', 'api-gateway', 'auth', 'backend', 'database', 'ai', 'queue', 'cicd', 'observability', 'infra'],
    mustHaves: ['Streaming chat interface', 'Retrieval over the user\'s own documents', 'Usage limits and cost tracking', 'Evaluation set for answer quality'],
  },
  {
    id: 'community',
    name: 'Social / community',
    icon: '💬',
    description: 'Profiles, posts, feeds, follows, notifications. Often mobile-first.',
    baseComponents: ['users', 'frontend', 'dns-cdn', 'api-gateway', 'auth', 'backend', 'database', 'cache', 'storage', 'queue', 'cicd', 'observability', 'infra'],
    mustHaves: ['Profiles and follows', 'Feed generation', 'Media uploads', 'Notifications', 'Moderation and reporting'],
  },
  {
    id: 'booking',
    name: 'Booking / scheduling',
    icon: '📅',
    description: 'Appointments, reservations, or classes with availability, reminders, and payments.',
    baseComponents: ['users', 'frontend', 'dns-cdn', 'api-gateway', 'auth', 'backend', 'database', 'third-party', 'queue', 'cicd', 'observability', 'infra'],
    mustHaves: ['Availability and time zones', 'Double-booking prevention', 'Reminders by email/SMS', 'Deposits or payments', 'Cancellation rules'],
  },
  {
    id: 'content',
    name: 'Content / media',
    icon: '🎬',
    description: 'Publishing articles, courses, podcasts, or video to an audience, possibly behind a paywall.',
    baseComponents: ['users', 'frontend', 'dns-cdn', 'backend', 'database', 'storage', 'cache', 'cicd', 'observability', 'infra'],
    mustHaves: ['Fast public pages (CDN cached)', 'Media hosting and streaming', 'Search', 'Optional membership paywall'],
  },
];

export const FEATURES: BlueprintFeature[] = [
  {
    id: 'payments',
    name: 'Payments & subscriptions',
    icon: '💳',
    description: 'Take one-time payments or recurring subscriptions.',
    adds: ['third-party', 'queue'],
    briefLine: 'Payments via Stripe (Checkout + webhooks). Subscription plans with upgrade/downgrade. Orders marked paid only via verified webhooks; fulfilment runs as background jobs.',
    askAi: 'Integrate Stripe with signature-verified webhooks and idempotent order handling.',
  },
  {
    id: 'uploads',
    name: 'File uploads',
    icon: '🖼️',
    description: 'Users upload images, documents, or video.',
    adds: ['storage', 'queue', 'dns-cdn'],
    briefLine: 'Direct-to-storage uploads with signed URLs to a private bucket; type and size validation; thumbnails/processing as background jobs; served via CDN.',
    askAi: 'Implement signed-URL uploads to a private bucket with background processing.',
  },
  {
    id: 'ai',
    name: 'AI features',
    icon: '✨',
    description: 'Chat, summarization, extraction, or generation using an LLM.',
    adds: ['ai', 'queue'],
    briefLine: 'AI calls only from the backend with streaming to the UI; structured outputs validated before saving; per-user rate limits and spending caps; cost and latency logged; an evaluation set of realistic inputs.',
    askAi: 'Implement the AI feature on the backend with streaming, limits, cost logging, and an eval set.',
  },
  {
    id: 'realtime',
    name: 'Real-time updates',
    icon: '⚡',
    description: 'Live chat, collaborative editing, or instantly updating dashboards.',
    adds: ['cache', 'load-balancer'],
    briefLine: 'Real-time updates via WebSockets or server-sent events (or the platform\'s realtime service); shared state in Redis so multiple backend copies stay in sync.',
    askAi: 'Add real-time updates using the simplest option for our hosting platform, and keep the backend stateless.',
  },
  {
    id: 'mobile',
    name: 'Mobile app',
    icon: '📱',
    description: 'Native iOS/Android apps in addition to (or instead of) the web.',
    adds: ['cicd'],
    briefLine: 'Mobile app with Expo (React Native) sharing the API client and types with the web app; push notifications; EAS builds and store submission in CI.',
    askAi: 'Set up an Expo mobile app that shares the API client with the web app, with push notifications and store builds.',
  },
  {
    id: 'notifications',
    name: 'Email, SMS & push',
    icon: '🔔',
    description: 'Transactional messages: receipts, reminders, alerts.',
    adds: ['third-party', 'queue'],
    briefLine: 'Transactional email via Resend/Postmark, SMS via Twilio, push via Expo/OneSignal; all sent from background jobs with retries; user notification preferences.',
    askAi: 'Send all notifications from background jobs with retries and respect user preferences.',
  },
  {
    id: 'teams',
    name: 'Teams & roles',
    icon: '👥',
    description: 'Workspaces with multiple members and permission levels.',
    adds: ['auth'],
    briefLine: 'Workspaces/organizations with invitations; roles (owner, admin, member) enforced server-side on every endpoint; data scoped per workspace.',
    askAi: 'Implement workspaces with roles enforced on the server and scope every query by workspace.',
  },
  {
    id: 'search',
    name: 'Search',
    icon: '🔎',
    description: 'Users search across listings, documents, or messages.',
    adds: ['database', 'cache'],
    briefLine: 'Search with Postgres full-text search to start (or Meilisearch/Typesense later); results cached briefly; typo tolerance and filters.',
    askAi: 'Implement search with Postgres full-text search, with filters and sensible ranking.',
  },
  {
    id: 'scale',
    name: 'Expecting high traffic',
    icon: '📈',
    description: 'Launch campaigns, viral potential, or an existing audience.',
    adds: ['load-balancer', 'cache', 'security', 'dns-cdn'],
    briefLine: 'Stateless backend behind autoscaling with a maximum; CDN and cache for public content; WAF and rate limiting; budget alerts; a load test before launch.',
    askAi: 'Run a load test at 20x expected traffic and fix the first bottleneck.',
  },
];

export const BLUEPRINT_ORDER: ComponentId[] = [
  'users',
  'frontend',
  'dns-cdn',
  'security',
  'load-balancer',
  'api-gateway',
  'auth',
  'backend',
  'database',
  'cache',
  'storage',
  'queue',
  'ai',
  'third-party',
  'observability',
  'cicd',
  'infra',
];

export interface BlueprintInput {
  archetype: string;
  features: string[];
  appName: string;
  audience: string;
  oneLiner: string;
}

export function blueprintComponents(input: BlueprintInput): ComponentId[] {
  const arch = ARCHETYPES.find((a) => a.id === input.archetype) ?? ARCHETYPES[0];
  const set = new Set<ComponentId>(arch.baseComponents);
  for (const f of input.features) {
    const feat = FEATURES.find((x) => x.id === f);
    feat?.adds.forEach((c) => set.add(c));
  }
  return BLUEPRINT_ORDER.filter((c) => set.has(c));
}

/** Generate a complete AI build brief (markdown) */
export function generateBrief(input: BlueprintInput, componentNames: Record<ComponentId, string>): string {
  const arch = ARCHETYPES.find((a) => a.id === input.archetype) ?? ARCHETYPES[0];
  const feats = FEATURES.filter((f) => input.features.includes(f.id));
  const comps = blueprintComponents(input);
  const name = input.appName.trim() || 'My App';
  const audience = input.audience.trim() || 'our target users';
  const oneLiner = input.oneLiner.trim() || `${arch.description}`;
  const hasAi = input.features.includes('ai');
  const hasPayments = input.features.includes('payments');
  const hasUploads = input.features.includes('uploads');
  const hasMobile = input.features.includes('mobile');

  const lines: string[] = [];
  lines.push(`# Build brief: ${name}`);
  lines.push('');
  lines.push(`You are my senior engineering partner. I am a nontechnical founder; you will write 100% of the code. Work in small steps, explain decisions in plain English, and ask me before making irreversible choices. Treat this brief as the source of truth and tell me when something in it is a bad idea.`);
  lines.push('');
  lines.push('## 1. What we are building');
  lines.push(`**${name}** is a ${arch.name.toLowerCase()}: ${oneLiner}`);
  lines.push(`**Primary users:** ${audience}.`);
  lines.push('');
  lines.push('## 2. Must-have capabilities');
  for (const m of arch.mustHaves) lines.push(`- ${m}`);
  for (const f of feats) lines.push(`- ${f.name}: ${f.description}`);
  lines.push('');
  lines.push('## 3. Architecture (keep it simple)');
  lines.push(`Start as a **modular monolith**: one codebase organized by feature, deployed to a platform-as-a-service. Components we need, in the order they will be touched by a request:`);
  for (const c of comps) lines.push(`- **${componentNames[c]}**`);
  lines.push('');
  lines.push('**Recommended stack (change only with a reason):**');
  lines.push(`- Frontend: ${hasMobile ? 'Next.js (web) + Expo/React Native (mobile) sharing types and API client' : 'Next.js with TypeScript and Tailwind, responsive, installable as a PWA'}`);
  lines.push('- Backend: TypeScript route handlers / API in the same repo, organized by feature');
  lines.push('- Database: managed PostgreSQL (Supabase or Neon) with migrations and daily backups');
  lines.push('- Auth: a managed provider (Clerk or Supabase Auth). Never custom password handling.');
  if (hasUploads) lines.push('- Files: private object storage (S3/R2/Supabase Storage) with signed URLs, served via CDN');
  if (hasPayments) lines.push('- Payments: Stripe Checkout + webhooks (signature-verified, idempotent)');
  if (hasAi) lines.push('- AI: provider API called only from the backend, with streaming, structured outputs, per-user limits, cost logging');
  if (comps.includes('queue')) lines.push('- Background jobs: a managed job platform (Inngest/Trigger.dev) or the platform\'s queues, with retries and idempotency');
  if (comps.includes('cache')) lines.push('- Cache: HTTP/CDN caching first; Redis (Upstash) only for sessions, rate limits, or measured hot spots');
  lines.push('- Hosting: Vercel (web) or Render/Railway/Fly.io (app + workers), with staging and production environments');
  lines.push('- Pipeline: GitHub + GitHub Actions (lint, type-check, tests on every PR) + preview deployments');
  lines.push('- Observability: Sentry (errors), uptime monitoring, and a simple metrics dashboard including costs');
  lines.push('');
  lines.push('## 4. Non-negotiables');
  lines.push('- No secrets in frontend code or in the repository; use environment variables.');
  lines.push('- Every API endpoint validates input and checks authorization on the server.');
  lines.push('- Money and permissions are computed on the server; the client\'s values are never trusted.');
  lines.push('- Every feature ships with automated tests that run in CI.');
  lines.push('- Loading, empty, and error states on every screen.');
  lines.push('- Accessibility basics: keyboard navigation, labels, contrast.');
  if (hasAi) lines.push('- AI outputs that matter are validated or confirmed by a human before action is taken.');
  lines.push('');
  lines.push('## 5. Build order (one pull request per step)');
  const steps: string[] = [
    'Product brief review: list every screen and every business rule in plain English. Wait for my approval.',
    'Data model: tables, relationships, constraints. Explain it before writing SQL. Wait for approval.',
    'Repository, CI, staging/production environments, error tracking. Deploy a "hello world" through the full pipeline.',
    'Authentication and the account/profile screens.',
    'The single most important user journey, end to end, with tests.',
  ];
  if (hasUploads) steps.push('File uploads with signed URLs and background processing.');
  if (hasPayments) steps.push('Payments and subscriptions with webhooks; test failed payments, refunds, duplicates.');
  if (hasAi) steps.push('The AI feature behind the backend with streaming and limits; build a 30-example evaluation set and report the pass rate.');
  if (input.features.includes('notifications')) steps.push('Notifications from background jobs with user preferences.');
  if (input.features.includes('teams')) steps.push('Workspaces, invitations, and roles enforced on every endpoint.');
  if (input.features.includes('search')) steps.push('Search with filters and ranking.');
  if (input.features.includes('realtime')) steps.push('Real-time updates, keeping the backend stateless.');
  if (hasMobile) steps.push('Mobile app sharing the API client, with push notifications and store builds.');
  if (input.features.includes('scale')) steps.push('Load test at 20x expected traffic; add CDN/cache/WAF/autoscaling limits as needed; budget alerts.');
  steps.push('Security review against the OWASP Top 10; try to access other users\' data; fix findings.');
  steps.push('Launch checklist: backups tested, alerts firing, rollback rehearsed, cost dashboard live.');
  steps.forEach((s, i) => lines.push(`${i + 1}. ${s}`));
  lines.push('');
  lines.push('## 6. How to work with me');
  lines.push('- Before each step: tell me what you will build and what decisions you need from me.');
  lines.push('- After each step: explain what changed, show me the preview link, show test results, and list anything you are unsure about.');
  lines.push('- If I ask for something that is a security or architecture mistake, say so and propose the safer version.');
  lines.push('');
  lines.push('## 7. Questions to answer before writing code');
  const qs = new Set<string>([
    'Which hosting platform fits this app and my budget, and when would we outgrow it?',
    'What will this cost per month at 100, 1,000, and 10,000 users?',
    'What are the three riskiest parts of this plan and how do we de-risk them first?',
  ]);
  for (const f of feats) qs.add(f.askAi);
  for (const q of qs) lines.push(`- ${q}`);
  lines.push('');
  lines.push('_Generated with StackWorks, the interactive software-architecture exhibit._');
  return lines.join('\n');
}
