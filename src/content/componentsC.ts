import type { ComponentContent } from '../app/types';

export const COMPONENTS_C: ComponentContent[] = [
  {
    id: 'ai',
    name: 'AI Services',
    shortName: 'AI',
    layer: 'app',
    level: 2,
    tagline: 'Language, vision, and reasoning models your app calls to understand, generate, and decide.',
    analogy: 'A brilliant consultant on call: give them a clear brief and the right documents, and they produce a draft in seconds.',
    purpose: [
      'AI integration means your backend sends text, images, or audio to a model (hosted by a provider or run by you) and gets back generated text, structured data, classifications, embeddings, or images. Chat assistants, summarizers, document extraction, search that understands meaning, and content generation are all built on this.',
      'The model is just one piece. Around it sits the prompt (your instructions), retrieval (fetching your own data to include as context, often called RAG), tools (letting the model call functions in your app), guardrails (checking outputs before they reach users), and evaluation (measuring whether answers are actually good).',
      'Two warnings matter for founders: AI calls cost money per token and take seconds, so they belong behind your backend with rate limits and caching; and models can be wrong with great confidence, so anything important needs verification or a human in the loop.',
    ],
    howItConnects:
      'The Backend (or a Worker for long jobs) calls AI providers over HTTPS, usually streaming the answer back to the Frontend token by token. Retrieval pulls context from the Database or a vector index. Observability tracks cost, latency, and quality.',
    tech: [
      {
        label: 'Model providers',
        items: [
          { name: 'Anthropic (Claude)', note: 'Strong at reasoning, coding, long documents, and agents. Clear safety behaviour.' },
          { name: 'OpenAI (GPT)', note: 'Broad ecosystem; text, vision, audio, and image generation.' },
          { name: 'Google (Gemini)', note: 'Multimodal models with very large context; integrated with Google Cloud.' },
          { name: 'Open models (Llama, Mistral, Qwen, DeepSeek)', note: 'Run yourself or via hosts like Together, Groq, Fireworks for cost or privacy.' },
        ],
      },
      {
        label: 'Building blocks',
        items: [
          { name: 'Vercel AI SDK / LangChain / LlamaIndex', note: 'Libraries for streaming, tools, and retrieval pipelines.' },
          { name: 'pgvector / Pinecone / Weaviate', note: 'Vector databases for semantic search and RAG.' },
          { name: 'Structured outputs & tool calling', note: 'Make the model return JSON that fits your schema, or call your functions.' },
          { name: 'Evals: Braintrust, LangSmith, Promptfoo', note: 'Test suites for prompts so changes don\'t silently degrade quality.' },
        ],
      },
    ],
    examples: [
      'Notion AI summarizing a page: the page text is sent as context with an instruction to summarize.',
      'A customer-support bot that searches your help docs (retrieval) and answers with citations.',
      'An invoice app that photographs a receipt and extracts vendor, date, and total as structured JSON.',
      'Claude Code or Cursor writing your app\'s code: the same model APIs, pointed at your repository.',
    ],
    mistakes: [
      'Calling the AI provider from the frontend with your API key (anyone can steal it and run up your bill).',
      'No limits per user, so one script can spend your monthly budget overnight.',
      'Shipping without evaluating outputs. "It worked on my three examples" is not a test.',
      'Sending private customer data to a provider without checking their data policy and your own privacy promises.',
      'Using the biggest, most expensive model for every call when a small one would do.',
      'Letting the model take real actions (send email, delete, pay) without confirmation or guardrails.',
    ],
    askAi: [
      {
        label: 'Designing',
        questions: [
          'Which features in my app genuinely need AI, and which are better as plain rules? Be honest.',
          'For each AI feature: what is the input, what exact output shape do we want, and how will we know if it is wrong?',
          'Which provider and model size fit each feature, and what will it cost per 1,000 users per month?',
          'What user data will be sent to the model, and is that compatible with our privacy policy?',
        ],
      },
      {
        label: 'Building',
        questions: [
          'Implement the AI call on the backend with streaming to the UI, a per-user rate limit, and a spending cap.',
          'Use structured output so the model returns JSON matching this schema, and validate it before saving.',
          'Add retrieval: search my own documents and include the top results as context, with citations in the answer.',
          'Write the system prompt for this feature and explain each instruction in it.',
          'Cache identical requests and fall back gracefully when the provider is slow or down.',
        ],
      },
      {
        label: 'Verifying',
        questions: [
          'Build an evaluation set of 30 realistic inputs with expected outputs, run it, and report the pass rate.',
          'Try to make the assistant misbehave (ignore instructions, reveal the prompt, act outside its scope). What happens?',
          'Show me the cost and latency per request over the last day.',
        ],
      },
    ],
    quiz: [
      {
        q: 'What is "RAG" (retrieval-augmented generation) in plain terms?',
        options: [
          'Training your own model from scratch',
          'Finding relevant pieces of your own data and including them in the prompt so the model answers from them',
          'A faster kind of GPU',
          'Letting users rate answers',
        ],
        answer: 1,
        why: 'Models don\'t know your private data. Retrieval fetches the relevant bits at request time and hands them to the model as context.',
      },
      {
        q: 'Where should the call to the AI provider happen?',
        options: ['In the browser, for speed', 'On the backend, so the key stays secret and you can add limits', 'In the CDN', 'In the database'],
        answer: 1,
        why: 'Keys shipped to the browser are public, and only the backend can enforce per-user limits and log costs.',
      },
    ],
    glossary: ['llm', 'token', 'prompt', 'rag', 'embedding', 'eval'],
  },
  {
    id: 'third-party',
    name: 'Third-party Services',
    shortName: '3rd-party',
    layer: 'app',
    level: 2,
    tagline: 'Payments, email, SMS, maps, and other businesses you plug into instead of rebuilding.',
    analogy: 'The suppliers and utilities: you don\'t generate your own electricity or run your own bank.',
    purpose: [
      'A huge part of any modern app is not written by you at all. Taking a card payment, sending an email or text, showing a map, verifying an address, running analytics, sending push notifications: each is a mature business with an API you can call. Using them costs pennies and saves months.',
      'Integrations have a shape: you get an API key (kept on the backend), call their API when something happens in your app, and they call you back via webhooks when something happens on their side ("payment succeeded", "email bounced"). Your backend must verify those webhooks really came from them.',
      'The trade-off is dependence: their outage is your outage, their price change is your cost, their rules are your rules. Pick well-known providers, keep the integration in one well-labelled place in the code, and never make a payment or email provider the only record of what happened.',
    ],
    howItConnects:
      'The Backend and Workers call third-party APIs. Webhooks from those services arrive through the API Gateway. Results are recorded in the Database.',
    tech: [
      {
        label: 'Money',
        items: [
          { name: 'Stripe', note: 'Payments, subscriptions, invoices, and tax. The default for startups.' },
          { name: 'Paddle / Lemon Squeezy', note: '"Merchant of record": they handle global sales tax for you.' },
          { name: 'PayPal, Adyen, Square', note: 'Alternatives depending on region and business type.' },
        ],
      },
      {
        label: 'Communication',
        items: [
          { name: 'Resend / Postmark / SendGrid', note: 'Transactional email (receipts, resets).' },
          { name: 'Twilio', note: 'SMS, voice, and WhatsApp.' },
          { name: 'OneSignal / Firebase Cloud Messaging / Expo Push', note: 'Push notifications.' },
          { name: 'Slack / Discord APIs', note: 'Post into team channels or build bots.' },
        ],
      },
      {
        label: 'Everything else',
        items: [
          { name: 'Google Maps / Mapbox', note: 'Maps, geocoding, directions.' },
          { name: 'Plaid', note: 'Bank account connections.' },
          { name: 'Algolia', note: 'Hosted search.' },
          { name: 'Zapier / Make / n8n', note: 'Glue between services without code.' },
        ],
      },
    ],
    examples: [
      'A subscription box startup: Stripe for billing, Resend for emails, Twilio for delivery texts, Google Maps for addresses.',
      'When Stripe confirms a payment, it sends a webhook; the backend marks the order paid and queues the fulfilment.',
      'A marketplace losing a day of sales because its email provider silently suspended the account. Monitor your providers.',
    ],
    mistakes: [
      'Trusting webhooks without verifying their signature; attackers can fake a "payment succeeded".',
      'Putting provider keys in the frontend or in the code repository.',
      'Building payments yourself. Never. Use a provider.',
      'Spreading integration code across the app so swapping providers becomes a rewrite.',
      'Not handling failures: what happens when the email API is down for an hour?',
    ],
    askAi: [
      {
        label: 'Designing',
        questions: [
          'Which parts of my app should I buy from a provider instead of building? List the provider, price, and risk for each.',
          'For payments, should I use Stripe directly or a merchant-of-record like Paddle, given where my customers are?',
        ],
      },
      {
        label: 'Building',
        questions: [
          'Integrate Stripe Checkout for subscriptions, with a webhook handler that verifies signatures and updates the user\'s plan.',
          'Put each integration in its own module behind a simple interface so we can swap providers later.',
          'Send transactional emails via [Resend] from background jobs with retries and logging.',
        ],
      },
      {
        label: 'Verifying',
        questions: [
          'Simulate a failed payment, a refund, and a cancelled subscription. Does the app handle each correctly?',
          'Send a fake webhook without a valid signature. Is it rejected?',
          'What happens to the user if the email provider is down during sign-up?',
        ],
      },
    ],
    quiz: [
      {
        q: 'What is a webhook?',
        options: [
          'A way for your app to call a provider',
          'A way for a provider to call your app when something happens on their side',
          'A fishing tool used by developers',
          'A type of database connection',
        ],
        answer: 1,
        why: 'APIs are you calling them. Webhooks are them calling you, for example "the payment succeeded". Always verify who sent it.',
      },
    ],
    glossary: ['webhook', 'api-key', 'integration'],
  },
  {
    id: 'observability',
    name: 'Observability',
    shortName: 'Monitoring',
    layer: 'platform',
    level: 3,
    tagline: 'Logs, metrics, traces, and alerts: how you know what the machine is doing and when it breaks.',
    analogy: 'The control tower: radar, gauges, and an alarm bell that rings before passengers notice anything.',
    purpose: [
      'Once real users are on your app, "does it work?" becomes a question you need answered every minute, automatically. Observability is the set of tools that collect what the system is doing: logs (what happened), metrics (how much and how fast), traces (the path of one request through every component), and errors (what blew up, with the exact line).',
      'From these come alerts: "error rate above 2%", "checkout latency over 3 seconds", "disk 90% full". Good alerts page a human only when users are affected; bad alerts cry wolf until everyone ignores them.',
      'For a founder, observability is also the business dashboard: sign-ups per day, AI spend per customer, which features are used. Set it up early; the day you need it is the day you can\'t add it.',
    ],
    howItConnects:
      'Taps into every component: the Backend, Database, Load Balancer, Workers, and Frontend all send logs and metrics here. Alerts go to people via email, Slack, or paging; incidents often trigger a rollback through CI/CD.',
    tech: [
      {
        label: 'Error tracking',
        items: [
          { name: 'Sentry', note: 'The default for catching exceptions in frontend and backend, with stack traces and user context.' },
          { name: 'Bugsnag / Rollbar', note: 'Alternatives.' },
        ],
      },
      {
        label: 'Logs, metrics & traces',
        items: [
          { name: 'Datadog', note: 'Everything in one place; powerful and expensive.' },
          { name: 'Grafana + Prometheus + Loki', note: 'Open-source stack; Grafana Cloud hosts it for you.' },
          { name: 'Better Stack / Axiom / Highlight', note: 'Simpler, startup-friendly logging and monitoring.' },
          { name: 'OpenTelemetry', note: 'The standard for emitting traces so you are not locked into a vendor.' },
        ],
      },
      {
        label: 'Uptime & alerts',
        items: [
          { name: 'Better Uptime / UptimeRobot / Checkly', note: 'Ping your site from outside and alert if it is down.' },
          { name: 'PagerDuty / Opsgenie', note: 'On-call rotations and escalation for teams.' },
          { name: 'Platform dashboards', note: 'Vercel, Render, Supabase all show basic metrics and logs.' },
        ],
      },
    ],
    examples: [
      'Sentry emails you: "TypeError in checkout.ts line 42, affecting 37 users in the last hour" with the exact inputs.',
      'A trace shows a request spending 2.8 of its 3 seconds waiting on one database query; one index fixes it.',
      'An uptime monitor texts you at 3am that the site is down, ten minutes before the first customer complaint.',
    ],
    mistakes: [
      'No error tracking, so bugs are discovered from angry emails.',
      'Logging sensitive data (passwords, card numbers, full tokens) into log files that many people can read.',
      'Alerts on everything, so the important one is missed.',
      'Only monitoring the backend and not the frontend, where most user-facing errors occur.',
      'Not tracking cost metrics for AI and cloud until the bill arrives.',
    ],
    askAi: [
      {
        label: 'Designing',
        questions: [
          'What are the five numbers I should watch daily to know my app is healthy, and what thresholds should alert me?',
          'Which monitoring tools fit my stack and budget right now?',
        ],
      },
      {
        label: 'Building',
        questions: [
          'Add Sentry to the frontend and backend, with user context, and make sure no sensitive data is captured.',
          'Add structured logging with a request ID that follows each request through every component.',
          'Set up an uptime check and an alert to my email/Slack when the error rate or latency exceeds the thresholds we agreed.',
          'Create a simple dashboard with sign-ups, active users, errors, latency, and AI spend.',
        ],
      },
      {
        label: 'Verifying',
        questions: [
          'Trigger a deliberate error in production-like conditions. Did we get alerted, and does the alert show enough to fix it?',
          'Search the logs for any passwords, tokens, or card numbers.',
        ],
      },
    ],
    quiz: [
      {
        q: 'What is a "trace" in observability?',
        options: [
          'A copy of the database',
          'The recorded path and timing of one request as it passes through each component',
          'A list of users',
          'A screenshot of an error',
        ],
        answer: 1,
        why: 'Traces show where time is spent for one request end to end, which is how you find the slow component.',
      },
    ],
    glossary: ['log', 'metric', 'trace', 'alert', 'uptime'],
  },
  {
    id: 'cicd',
    name: 'Version Control & CI/CD',
    shortName: 'CI/CD',
    layer: 'platform',
    level: 3,
    tagline: 'How code gets from an idea to running in production: saved, tested, and shipped automatically.',
    analogy: 'The assembly line and launch pad: every change is inspected, boxed, and launched the same safe way.',
    purpose: [
      'Version control (Git, usually hosted on GitHub) records every change to your code with who made it and why, and lets you work on new features in "branches" without disturbing what is live. It is also your undo button: any version can be restored.',
      'CI (continuous integration) runs automatically whenever code changes: it installs the app, runs the tests, checks formatting and security, and reports pass or fail. CD (continuous delivery/deployment) takes a passing version and puts it into production, often with a preview environment first so you can click around before real users see it.',
      'For an AI-built app, this pipeline is your safety net. The AI writes code quickly; CI catches what it broke; preview deployments let you check the result; one-click rollback saves you when something slips through. Environments (development, staging, production) keep experiments away from real customers.',
    ],
    howItConnects:
      'Pulls code from the repository, runs tests, builds the Frontend and Backend, and deploys them onto the Cloud Infrastructure. Observability feeds back whether the release is healthy; a bad release is rolled back here.',
    tech: [
      {
        label: 'Version control',
        items: [
          { name: 'Git + GitHub', note: 'Industry standard. Pull requests are where code is reviewed before merging.' },
          { name: 'GitLab / Bitbucket', note: 'Alternatives with built-in CI.' },
        ],
      },
      {
        label: 'CI/CD',
        items: [
          { name: 'GitHub Actions', note: 'Workflows defined in your repo; free tier is generous.' },
          { name: 'Vercel / Netlify / Render deploys', note: 'Connect the repo; every push gets a preview URL; main goes to production.' },
          { name: 'Docker', note: 'Packages your app and its dependencies so it runs the same everywhere.' },
          { name: 'Expo EAS / Fastlane', note: 'Build and submit mobile apps to the app stores.' },
        ],
      },
      {
        label: 'Quality gates',
        items: [
          { name: 'Vitest / Jest / Pytest / Playwright', note: 'Unit and end-to-end test runners.' },
          { name: 'ESLint / Prettier / TypeScript', note: 'Catch mistakes and keep code consistent.' },
          { name: 'Feature flags (LaunchDarkly, PostHog)', note: 'Ship code dark and turn it on for some users.' },
        ],
      },
    ],
    examples: [
      'A founder asks the AI for a new feature; it opens a pull request; CI runs 200 tests; a preview link appears; the founder clicks around and merges; it is live in 3 minutes.',
      'A deploy breaks checkout; Observability alerts; one click rolls back to the previous version while the fix is made.',
      'Mobile apps: the pipeline builds the iOS and Android binaries and submits them to the stores for review.',
    ],
    mistakes: [
      'Editing code directly on the production server (no history, no tests, no rollback).',
      'No tests in CI, so the pipeline just deploys whatever was written.',
      'One environment: experimenting on the same database real customers use.',
      'Secrets stored in the repository instead of in the CI/hosting platform\'s secret store.',
      'No rollback plan. Every deploy should be one click to undo.',
    ],
    askAi: [
      {
        label: 'Designing',
        questions: [
          'Set up a workflow where every change is tested automatically and I get a preview link before it goes live. What tools will you use?',
          'What environments do we need (dev, staging, production) and how do we keep their data separate?',
        ],
      },
      {
        label: 'Building',
        questions: [
          'Initialize a Git repository on GitHub with a clear README and a .gitignore, and commit the current code.',
          'Create a GitHub Actions workflow that installs, lints, type-checks, and tests on every pull request.',
          'Connect the repo to [Vercel/Render] so pull requests get preview deployments and main deploys to production.',
          'Add database migrations to the deploy step and make sure a failed migration stops the deploy.',
        ],
      },
      {
        label: 'Verifying',
        questions: [
          'Show me how to roll back the last deployment, then do it on staging to prove it works.',
          'Introduce a deliberate failing test. Does the pipeline block the deploy?',
        ],
      },
    ],
    quiz: [
      {
        q: 'What does CI (continuous integration) do when you push new code?',
        options: [
          'Emails your customers',
          'Automatically builds and tests the code and reports whether it passes',
          'Deletes old code',
          'Increases the server size',
        ],
        answer: 1,
        why: 'CI is the automatic inspection line. CD then ships versions that pass.',
      },
      {
        q: 'Your AI assistant says a feature is done. What is the safest way to check before customers see it?',
        options: ['Trust it', 'Open the preview deployment and click through it; check CI passed', 'Deploy to production and watch', 'Read every line of code yourself'],
        answer: 1,
        why: 'Preview environments plus automated tests are the founder\'s review tools. You verify behaviour; CI verifies code.',
      },
    ],
    glossary: ['git', 'repository', 'pull-request', 'ci', 'deploy', 'rollback', 'environment'],
  },
  {
    id: 'infra',
    name: 'Cloud Infrastructure',
    shortName: 'Cloud',
    layer: 'platform',
    level: 1,
    tagline: 'The rented machines, networks, and regions everything runs on. You pay by the hour, not by the building.',
    analogy: 'The land, power, and plumbing under the whole factory. You lease it by the hour and can grow the building overnight.',
    purpose: [
      'Every server, database, queue, and storage bucket in this machine is ultimately a program running on a computer in a data center. Cloud providers rent those computers by the second, in regions around the world, with networking, storage, and security built in. You never buy hardware; you describe what you need and it appears.',
      'There are layers of abstraction. At the bottom, raw virtual machines (you manage everything). In the middle, containers and Kubernetes (you package the app; the platform runs it). At the top, platform-as-a-service and serverless (you push code; the platform does the rest). Most startups should start at the top and move down only when they have a reason.',
      'The founder\'s concerns are cost (set budgets and alerts; the cloud bills for everything), region (keep data near users and inside legal boundaries), and lock-in (convenient platform features can make moving later expensive). Infrastructure-as-code keeps your setup written down and reproducible instead of clicked together in a console.',
    ],
    howItConnects:
      'Everything in the machine sits on top of it: the Backend, Database, Cache, Storage, Workers, and Load Balancer are all resources provisioned here. CI/CD deploys onto it; Observability reports on it.',
    tech: [
      {
        label: 'Big clouds',
        items: [
          { name: 'AWS', note: 'The largest; every service imaginable; steep learning curve.' },
          { name: 'Google Cloud', note: 'Strong data, AI, and Kubernetes offerings.' },
          { name: 'Microsoft Azure', note: 'Common in enterprises already on Microsoft.' },
        ],
      },
      {
        label: 'Developer-friendly platforms (start here)',
        items: [
          { name: 'Vercel / Netlify', note: 'Frontends and serverless backends with zero ops.' },
          { name: 'Render / Railway / Fly.io', note: 'Run containers, databases, and workers with simple pricing.' },
          { name: 'Supabase / Firebase / Convex', note: 'Backend-as-a-service: database, auth, storage, functions in one.' },
          { name: 'Cloudflare', note: 'Workers, R2, D1, and a global edge network.' },
        ],
      },
      {
        label: 'Infrastructure tooling',
        items: [
          { name: 'Docker', note: 'Package the app so it runs identically anywhere.' },
          { name: 'Kubernetes', note: 'Orchestrates many containers; powerful; overkill for most startups.' },
          { name: 'Terraform / Pulumi / SST', note: 'Infrastructure-as-code: your cloud setup as reviewable files.' },
        ],
      },
    ],
    examples: [
      'Netflix runs almost entirely on AWS; Spotify on Google Cloud; most startups on a PaaS like Vercel + Supabase until they outgrow it.',
      'A startup gets a surprise $12,000 bill because a misconfigured job ran in a loop over a weekend. Budget alerts would have caught it.',
      'A European health app must keep patient data in EU regions to comply with GDPR.',
    ],
    mistakes: [
      'Starting on raw AWS with Kubernetes because "that\'s what big companies do". Use a PaaS first.',
      'No billing alerts. The cloud will happily let you spend money you don\'t have.',
      'Clicking resources together in a console with no record of what was created or why.',
      'Running production and development on the same resources.',
      'Choosing a region far from your users, adding latency to every request.',
    ],
    askAi: [
      {
        label: 'Designing',
        questions: [
          'Given my app, team of one, and budget, which hosting platform should I start on, and when would I outgrow it?',
          'Which region should we deploy to, considering where users are and any data residency laws?',
          'Estimate the monthly infrastructure cost at 100, 1,000, and 10,000 users.',
        ],
      },
      {
        label: 'Building',
        questions: [
          'Deploy the app to [platform] with separate staging and production environments and their own databases.',
          'Set up billing alerts at $X and $Y, and explain what resources cost the most.',
          'Write the infrastructure as code (or document the platform settings) so we can recreate the setup.',
        ],
      },
      {
        label: 'Verifying',
        questions: [
          'If our hosting platform disappeared tomorrow, what would it take to run the app elsewhere?',
          'Show me the current monthly cost breakdown by component.',
        ],
      },
    ],
    quiz: [
      {
        q: 'What is "platform-as-a-service" (PaaS)?',
        options: [
          'Renting raw machines you fully manage',
          'A hosting model where you push your code and the platform handles servers, scaling, and deploys',
          'A type of database',
          'A design tool',
        ],
        answer: 1,
        why: 'PaaS platforms like Vercel, Render, and Railway hide the servers. It is the right starting point for most new products.',
      },
    ],
    glossary: ['cloud', 'region', 'container', 'paas', 'iac'],
  },
];
