import type { ComponentContent } from '../app/types';

export const COMPONENTS_A: ComponentContent[] = [
  {
    id: 'users',
    name: 'People & Devices',
    shortName: 'Users',
    layer: 'client',
    level: 1,
    tagline: 'Where every request begins: a real person tapping a real screen.',
    analogy: 'The customers walking up to the counter. Everything in the machine exists to serve them.',
    purpose: [
      'Your users are not part of your software, but they are the reason it exists and the source of every action it takes. A person opens a phone, laptop, tablet, or even a voice assistant, and asks your app to do something: show me my orders, upload this photo, answer this question.',
      'Each device is different. Phones have small screens, flaky connections, and batteries. Laptops have big screens and keyboards. Users switch devices mid-task and expect to pick up where they left off. Good products treat the device as a window into the same account, not as the place where data lives.',
      'An important mindset for a founder: your app is only ever running on hardware you don\'t control. Anything you send to a device can be inspected, so secrets must stay on the server, and anything a device sends back must be verified before you trust it.',
    ],
    howItConnects:
      'Users interact with the Frontend, which runs on their device. Before any network request can leave the device, it looks up your address using DNS, then travels across the internet to your servers.',
    tech: [
      {
        label: 'Platforms your users live on',
        items: [
          { name: 'Web browsers', note: 'Chrome, Safari, Edge, Firefox. Reach anyone with a link; no install needed.' },
          { name: 'iOS & Android', note: 'Native or cross-platform mobile apps distributed through the App Store and Google Play.' },
          { name: 'Desktop', note: 'Electron or Tauri apps wrap web technology into installable desktop software.' },
          { name: 'Messaging & voice', note: 'Slack, WhatsApp, SMS, and voice assistants can also be "front doors" into your product.' },
        ],
      },
      {
        label: 'Understanding users',
        items: [
          { name: 'PostHog / Mixpanel / Amplitude', note: 'Product analytics: which features people use and where they drop off.' },
          { name: 'Hotjar / FullStory', note: 'Session replays and heatmaps to watch how people actually navigate.' },
        ],
      },
    ],
    examples: [
      'A shopper on a phone opens your store from an Instagram link while on a train with a weak signal.',
      'An office manager uses your scheduling tool on a desktop browser all day with 15 tabs open.',
      'The same person checks their account on a tablet at night and expects their cart to still be there.',
    ],
    mistakes: [
      'Designing only for your own device and a fast office connection. Most of the world is on a mid-range phone and mobile data.',
      'Trusting data from the device. Prices, permissions, and limits must be checked again on the server.',
      'Assuming people read instructions. Users guess, tap the biggest button, and leave if confused.',
      'Forgetting that a "user" might be a bot, a scraper, or an attacker pretending to be a person.',
    ],
    askAi: [
      {
        label: 'Designing',
        questions: [
          'Who are my primary users and what devices and network conditions should we design for first?',
          'Should this be a web app, a mobile app, or both to start, given my audience and budget?',
          'What are the three most important things a user must be able to do in the first 60 seconds?',
        ],
      },
      {
        label: 'Building',
        questions: [
          'Make the app work well on a small phone screen and on a slow connection. What specifically will you change?',
          'Which user inputs are we trusting without checking them on the server? List them and fix each one.',
          'Add basic product analytics so I can see which screens people use and where they leave.',
        ],
      },
      {
        label: 'Verifying',
        questions: [
          'Walk me through what a new user sees step by step, from opening the link to completing their first task.',
          'What happens if the user loses internet connection halfway through a form?',
        ],
      },
    ],
    quiz: [
      {
        q: 'Why must a price be checked on the server even if the app already shows it correctly on the phone?',
        options: [
          'Because phones round numbers differently',
          'Because anything on the device can be modified by the user before it is sent back',
          'Because servers are faster at arithmetic',
          'It does not need to be checked twice',
        ],
        answer: 1,
        why: 'The device is outside your control. A user (or attacker) can change the request to say the price is $0. The server must be the source of truth.',
      },
    ],
    glossary: ['client', 'request'],
  },
  {
    id: 'frontend',
    name: 'Frontend',
    shortName: 'Frontend',
    layer: 'client',
    level: 1,
    tagline: 'The part of your app people can see and touch. It runs on their device.',
    analogy: 'The storefront and the menu. It looks like the whole restaurant to the customer, but the kitchen is somewhere else.',
    purpose: [
      'The frontend is the screens, buttons, forms, and animations that make up your product\'s experience. It is code that is downloaded to the user\'s device and runs there, in a browser or as an installed app. When a user taps "Buy", the frontend collects what they chose, shows a loading spinner, and sends a request to the backend.',
      'A modern frontend is usually built as a collection of reusable components (a button, a product card, a checkout form) that are composed into pages. Frameworks like React, Vue, or Svelte manage keeping the screen in sync with data as it changes.',
      'For AI-built apps, the frontend is where most of your taste shows. You can describe the look and the flow in plain language, but you should also ask for consistency: one set of colors, spacing, and fonts applied everywhere, plus loading, empty, and error states for every screen.',
    ],
    howItConnects:
      'The frontend files (HTML, CSS, JavaScript) are delivered to the device by the CDN. Once running, the frontend talks to your backend through the API, sending requests and rendering the responses.',
    tech: [
      {
        label: 'Web frameworks',
        items: [
          { name: 'React + Next.js', note: 'The most common choice today. Huge ecosystem; AI tools know it extremely well.' },
          { name: 'Vue + Nuxt', note: 'Friendly and well-documented; popular with smaller teams.' },
          { name: 'Svelte + SvelteKit', note: 'Less code, very fast; smaller community.' },
          { name: 'Plain HTML/CSS/JS', note: 'Perfectly fine for simple sites and landing pages.' },
        ],
      },
      {
        label: 'Mobile',
        items: [
          { name: 'React Native + Expo', note: 'One JavaScript codebase for iOS and Android; shares skills with web React.' },
          { name: 'Flutter', note: 'Google\'s toolkit; one Dart codebase, very polished UI.' },
          { name: 'SwiftUI / Jetpack Compose', note: 'Native toolkits for the best platform fit, but two separate codebases.' },
        ],
      },
      {
        label: 'Styling & components',
        items: [
          { name: 'Tailwind CSS', note: 'Utility classes; AI assistants are very fluent in it.' },
          { name: 'shadcn/ui, Radix, MUI', note: 'Pre-built accessible components so you are not redesigning a dropdown.' },
        ],
      },
    ],
    examples: [
      'Airbnb\'s search page: the map, filters, and listing cards are all frontend, updating instantly as you drag the map.',
      'A banking app\'s balance screen: the layout is frontend; the actual balance number comes from the backend each time.',
      'Google Docs: the editor runs in your browser; every keystroke is sent to the backend to be saved and shared.',
    ],
    mistakes: [
      'Putting secret keys (payment, AI, database) in frontend code. Anyone can open developer tools and read them.',
      'Doing security or pricing logic in the frontend. It can be bypassed in seconds.',
      'No loading, empty, or error states. Screens that just go blank feel broken.',
      'Rebuilding common components from scratch instead of using an accessible component library.',
      'Ignoring accessibility: keyboard navigation, screen readers, and color contrast.',
    ],
    askAi: [
      {
        label: 'Designing',
        questions: [
          'Propose a simple, consistent design system for my app: colors, type scale, spacing, and the 10 components I\'ll need most.',
          'List every screen my app needs for the core user journey, and what data each screen needs from the backend.',
          'What should the user see while data is loading, when there is nothing to show, and when something fails?',
        ],
      },
      {
        label: 'Building',
        questions: [
          'Build this screen with React and Tailwind using the design system we agreed on. Include loading, empty, and error states.',
          'Are any API keys or secrets included in frontend code? Move them to the server.',
          'Make the app responsive: show me how each screen adapts to a phone, a tablet, and a desktop.',
          'Add form validation with clear inline error messages, and make sure the server validates the same rules.',
        ],
      },
      {
        label: 'Verifying',
        questions: [
          'Run an accessibility check (keyboard navigation, labels, contrast) and fix what you find.',
          'Measure the page load size and time. What are the three biggest things we can trim?',
        ],
      },
    ],
    quiz: [
      {
        q: 'Where does frontend code actually run?',
        options: ['On your cloud servers', 'On the user\'s device, in their browser or app', 'Inside the database', 'On the CDN'],
        answer: 1,
        why: 'The CDN only delivers the files. Once downloaded, the frontend runs on the user\'s own device, which is why it can never be trusted with secrets.',
      },
      {
        q: 'Your AI assistant put the OpenAI API key directly in the React code so the chat feature works. What should you do?',
        options: [
          'Nothing, it works',
          'Ask it to move the call to the backend so the key stays on the server',
          'Rename the key so it is harder to find',
          'Put the key in a comment instead',
        ],
        answer: 1,
        why: 'Any key shipped to the browser is public. The frontend should call your backend, and your backend should call OpenAI with the secret key.',
      },
    ],
    glossary: ['component', 'framework', 'client'],
  },
  {
    id: 'dns-cdn',
    name: 'DNS & CDN',
    shortName: 'DNS/CDN',
    layer: 'edge',
    level: 2,
    tagline: 'Turns your app\'s name into an address, and serves files from a location near the user.',
    analogy: 'The phone book plus a chain of local warehouses: find the shop, then collect the goods from the nearest branch.',
    purpose: [
      'DNS (Domain Name System) is the internet\'s address book. When someone types yourapp.com, DNS translates that name into the numeric address of a server. You control this by setting records at your domain registrar or DNS provider. Without DNS, users would have to remember numbers.',
      'A CDN (Content Delivery Network) is a worldwide network of servers that keeps copies of your static files (images, JavaScript, CSS, videos) close to users. Someone in Tokyo gets your logo from a server in Tokyo, not from your origin server in Virginia. That makes pages load faster and protects your main servers from heavy traffic.',
      'Modern CDN providers also sit in front of your backend as a shield: they terminate HTTPS, absorb traffic spikes, cache API responses, and block attacks. In many small apps the CDN and the hosting platform are the same product and you barely notice it exists.',
    ],
    howItConnects:
      'The user\'s device asks DNS for your address first. The CDN then delivers the frontend files, pulling them from File Storage or your hosting platform, and forwards dynamic requests on toward the Security layer and your backend.',
    tech: [
      {
        label: 'DNS & domains',
        items: [
          { name: 'Cloudflare DNS', note: 'Fast, free, with a built-in CDN and security features.' },
          { name: 'AWS Route 53', note: 'The AWS option; integrates with everything else in AWS.' },
          { name: 'Namecheap / GoDaddy / Porkbun', note: 'Common registrars for buying the domain itself.' },
        ],
      },
      {
        label: 'CDNs',
        items: [
          { name: 'Cloudflare', note: 'The default for most startups; CDN + DNS + WAF in one.' },
          { name: 'Vercel / Netlify Edge', note: 'Built into the hosting platform; zero configuration for web apps.' },
          { name: 'AWS CloudFront', note: 'Pairs with S3 for serving uploaded files globally.' },
          { name: 'Fastly / Akamai', note: 'Enterprise-grade; used by very large media sites.' },
        ],
      },
    ],
    examples: [
      'Netflix streams video through its own CDN (Open Connect) with servers inside ISPs so the video never travels far.',
      'A small Shopify store: images and the theme are served from a CDN; checkout requests go to Shopify\'s backend.',
      'When a company "moves to a new website", switching DNS to the new server is the moment the change goes live.',
    ],
    mistakes: [
      'Forgetting that DNS changes take time to spread (minutes to a day). Plan launches accordingly.',
      'Caching things that should not be cached, like personalized pages, so one user sees another\'s data.',
      'Letting the domain registration expire. Set auto-renew and use a company email, not a personal one.',
      'Serving large uploaded images directly from the backend instead of through a CDN.',
    ],
    askAi: [
      {
        label: 'Designing',
        questions: [
          'Which parts of my app are static (same for everyone) and could be served from a CDN?',
          'Should I use Cloudflare in front of my app? What would it protect me from and what would it cost?',
        ],
      },
      {
        label: 'Building',
        questions: [
          'Set up the DNS records so myapp.com and www.myapp.com point to the hosting platform, with HTTPS.',
          'Configure caching headers so static assets are cached for a long time but HTML and API responses are not.',
          'Serve user-uploaded images through the CDN with automatic resizing.',
        ],
      },
      {
        label: 'Verifying',
        questions: [
          'Test the site from another region and tell me how long the first load takes and what is slowing it down.',
          'Confirm no personalized content is being cached by the CDN.',
        ],
      },
    ],
    quiz: [
      {
        q: 'What does DNS do?',
        options: ['Encrypts traffic', 'Translates a domain name into a server address', 'Stores your images', 'Checks passwords'],
        answer: 1,
        why: 'DNS is the address book. Encryption is HTTPS/TLS, file storage is a separate component, and passwords are handled by authentication.',
      },
    ],
    glossary: ['cdn', 'dns', 'cache'],
  },
  {
    id: 'security',
    name: 'Security Shield',
    shortName: 'Security',
    layer: 'edge',
    level: 3,
    tagline: 'Encrypts traffic, blocks attacks, and keeps secrets secret.',
    analogy: 'The security gate at the front of the building: it checks for obvious trouble before anyone reaches the lobby.',
    purpose: [
      'Security isn\'t one box; it is a set of practices that run through the whole machine. But a few pieces sit at the front door. HTTPS (TLS) encrypts traffic so nobody between the user and your server can read or alter it. A Web Application Firewall (WAF) inspects incoming requests and blocks known attack patterns. Rate limiting stops one client from hammering your app thousands of times a second. DDoS protection absorbs floods of junk traffic.',
      'Behind the gate, security continues: input validation (never trust what users send), secrets management (API keys live in a vault, not in code), least privilege (each part of the system gets only the access it needs), and dependency updates (the libraries you use get patched).',
      'For a nontechnical founder, the key insight is that most breaches come from basic mistakes, not genius hackers: a leaked key, a default password, a form that lets someone type database commands. Asking your AI assistant the right security questions prevents most of them.',
    ],
    howItConnects:
      'Traffic from the CDN passes through the shield before reaching the Load Balancer. The shield also protects the services behind it by hiding them from the public internet entirely.',
    tech: [
      {
        label: 'Edge protection',
        items: [
          { name: 'Cloudflare WAF & DDoS', note: 'Free tier covers a lot; one toggle protects your whole domain.' },
          { name: 'AWS WAF + Shield', note: 'For apps hosted on AWS.' },
          { name: 'Let\'s Encrypt', note: 'Free HTTPS certificates; most platforms set this up automatically.' },
        ],
      },
      {
        label: 'Secrets & access',
        items: [
          { name: 'Platform environment variables', note: 'Vercel, Render, Fly, and AWS all have a secure place for keys.' },
          { name: 'Doppler / 1Password / HashiCorp Vault', note: 'Dedicated secret managers for teams.' },
          { name: 'Snyk / Dependabot', note: 'Automatically flag vulnerable libraries in your code.' },
        ],
      },
      {
        label: 'Standards worth knowing',
        items: [
          { name: 'OWASP Top 10', note: 'The most common web vulnerabilities; ask AI to check your app against it.' },
          { name: 'SOC 2 / GDPR / HIPAA', note: 'Compliance regimes you may need depending on customers and data.' },
        ],
      },
    ],
    examples: [
      'The padlock icon in the browser means TLS is working: your login details are encrypted in transit.',
      'In 2023, a Toyota data leak happened because an access key was accidentally published in public code.',
      'A WAF would block a request where someone types `\' OR 1=1 --` into a login form hoping to trick the database.',
    ],
    mistakes: [
      'Committing API keys or passwords into the code repository (even once; history is forever).',
      'Running without HTTPS, or only on some pages.',
      'Not validating user input on the server, enabling injection attacks.',
      'Giving one all-powerful database password to every part of the system.',
      'Never updating dependencies; old versions with known holes are the easiest target.',
    ],
    askAi: [
      {
        label: 'Designing',
        questions: [
          'What are the most likely ways someone could attack an app like mine, and what is the cheapest defense for each?',
          'What personal data will we store, and what are our legal obligations for it (GDPR, CCPA, etc.)?',
          'Where should every secret (API keys, database passwords) live, and how do we rotate one if it leaks?',
        ],
      },
      {
        label: 'Building',
        questions: [
          'Review the whole codebase for hardcoded secrets and move them to environment variables.',
          'Add rate limiting to the login and signup endpoints and to any endpoint that calls a paid API.',
          'Validate and sanitize all user input on the server. Show me where you added checks.',
          'Set security headers (CSP, HSTS, etc.) and explain each in one sentence.',
        ],
      },
      {
        label: 'Verifying',
        questions: [
          'Audit the app against the OWASP Top 10 and give me a prioritized list of findings.',
          'Try to access another user\'s data by changing IDs in the URL. Does it work? Fix it if so.',
          'Which dependencies have known vulnerabilities? Update them.',
        ],
      },
    ],
    quiz: [
      {
        q: 'Which of these is the most common real-world cause of a data breach in small apps?',
        options: ['Quantum computers breaking encryption', 'A secret key or password leaked in code or config', 'Too many users', 'Using an old laptop'],
        answer: 1,
        why: 'Leaked credentials and basic input mistakes cause far more breaches than sophisticated attacks.',
      },
      {
        q: 'What does the padlock icon in a browser indicate?',
        options: ['The site has no bugs', 'Traffic between you and the server is encrypted (HTTPS)', 'The site is owned by a bank', 'Your password is strong'],
        answer: 1,
        why: 'HTTPS/TLS encrypts the connection. It says nothing about the site\'s quality or trustworthiness.',
      },
    ],
    glossary: ['https', 'waf', 'rate-limit', 'secret'],
  },
  {
    id: 'load-balancer',
    name: 'Load Balancer',
    shortName: 'Load Balancer',
    layer: 'edge',
    level: 3,
    tagline: 'Spreads incoming traffic across several copies of your backend so no single one is overwhelmed.',
    analogy: 'The host at a busy restaurant seating guests at whichever table is free.',
    purpose: [
      'A single server can only handle so many requests at once. When your app grows, you run several identical copies of the backend. The load balancer stands in front of them, accepting every request and handing it to a healthy copy. If one copy crashes, the load balancer stops sending traffic there until it recovers.',
      'This gives you two things founders care about: capacity (add more copies to serve more users) and resilience (one failure doesn\'t take down the app). It also enables zero-downtime deployments: new versions are added, old ones drained, and users never notice.',
      'Most hosting platforms include a load balancer invisibly. If you use Vercel, Render, Fly.io, or AWS App Runner, you get one by turning on "more instances" or "autoscaling". You only need to think about it directly on bare cloud infrastructure.',
    ],
    howItConnects:
      'Sits between the Security layer and the API Gateway / backend copies. It performs "health checks" on each backend copy and reports metrics to Observability.',
    tech: [
      {
        label: 'Managed',
        items: [
          { name: 'Platform autoscaling', note: 'Vercel, Render, Railway, Fly.io: just set min/max instances.' },
          { name: 'AWS ALB / GCP Load Balancing / Azure Front Door', note: 'Cloud-native load balancers with health checks and TLS.' },
          { name: 'Cloudflare Load Balancing', note: 'Balance across regions or providers at the DNS/edge level.' },
        ],
      },
      {
        label: 'Self-managed',
        items: [
          { name: 'NGINX / HAProxy / Caddy / Traefik', note: 'Battle-tested software load balancers you run yourself.' },
          { name: 'Kubernetes Ingress', note: 'If you are on Kubernetes, this is the load balancer entry point.' },
        ],
      },
    ],
    examples: [
      'On Black Friday a retailer scales from 4 to 40 backend copies; the load balancer spreads the shoppers evenly.',
      'A deployment goes wrong: the new copy fails health checks, so the load balancer keeps sending users to the old copy.',
      'A ticketing site crashes at launch because it ran a single server with no balancer in front.',
    ],
    mistakes: [
      'Keeping important state (like a user\'s session or an uploaded file) in memory on one server. The next request may land on a different copy.',
      'No health check, so the balancer keeps sending traffic to a crashed instance.',
      'Scaling the backend without scaling the database, which becomes the new bottleneck.',
      'Paying for a load balancer and multiple instances for an app with 20 users. Start simple.',
    ],
    askAi: [
      {
        label: 'Designing',
        questions: [
          'At what point will a single server not be enough for my app, and what signals will tell us?',
          'Does my hosting platform handle load balancing and scaling automatically? What do I need to configure?',
        ],
      },
      {
        label: 'Building',
        questions: [
          'Make the backend stateless so any request can be served by any copy: sessions, uploads, and caches must live outside the server.',
          'Add a /health endpoint that reports whether the database and cache are reachable.',
          'Configure autoscaling with a sensible minimum and maximum so a traffic spike does not surprise me with a huge bill.',
        ],
      },
      {
        label: 'Verifying',
        questions: [
          'Run a load test simulating 500 concurrent users and tell me where it breaks first.',
          'Kill one backend instance during a test. Do users notice?',
        ],
      },
    ],
    quiz: [
      {
        q: 'Why must a backend be "stateless" to work behind a load balancer?',
        options: [
          'Because stateless code is shorter',
          'Because each request might go to a different server copy, so nothing can depend on what one copy remembered',
          'Because load balancers cannot read memory',
          'It does not need to be stateless',
        ],
        answer: 1,
        why: 'If server A remembers you are logged in but your next request goes to server B, you appear logged out. Shared state must live in the database or cache.',
      },
    ],
    glossary: ['scaling', 'stateless', 'health-check'],
  },
  {
    id: 'api-gateway',
    name: 'API Gateway',
    shortName: 'API',
    layer: 'app',
    level: 2,
    tagline: 'The menu of things your app can ask the backend to do, and the doorway requests pass through.',
    analogy: 'The ordering counter with a printed menu. You can only order what is on it, and every order is written down the same way.',
    purpose: [
      'An API (Application Programming Interface) is the agreed set of requests your backend understands: "get my profile", "create an order", "list products". Each one is a URL and a shape of data. The frontend, your mobile app, and partners all talk to the backend through this same menu, which is why the API is the contract that holds the whole product together.',
      'An API gateway is the single doorway those requests pass through. It can check the user\'s identity token, enforce limits ("100 requests per minute"), log every call, route each request to the right service, and reject anything malformed before it touches your business logic.',
      'In a small app the "gateway" is simply the first few lines of your backend code (a router plus middleware). As you grow, or when you expose an API to customers, it becomes a dedicated product.',
    ],
    howItConnects:
      'Receives traffic from the Load Balancer, asks Authentication to verify the caller, then routes the request to the Backend. It is also where third parties and webhooks enter your system.',
    tech: [
      {
        label: 'API styles',
        items: [
          { name: 'REST (JSON over HTTP)', note: 'The default. Simple URLs like GET /orders/123. AI tools generate it reliably.' },
          { name: 'GraphQL', note: 'The client asks for exactly the fields it needs. Powerful, more complex to run.' },
          { name: 'tRPC / RPC', note: 'Type-safe calls when frontend and backend are both TypeScript.' },
          { name: 'Webhooks', note: 'The reverse: other services call your API when something happens (a payment succeeded).' },
        ],
      },
      {
        label: 'Gateways & tooling',
        items: [
          { name: 'Framework routers', note: 'Express, Fastify, Hono, Next.js route handlers, FastAPI. Enough for most apps.' },
          { name: 'Kong / AWS API Gateway / Apigee', note: 'Dedicated gateways with auth, quotas, analytics, and billing.' },
          { name: 'OpenAPI (Swagger)', note: 'A standard way to document your API; AI can generate clients from it.' },
        ],
      },
    ],
    examples: [
      'Stripe\'s API is the product: developers call "create a charge" and Stripe\'s backend does the rest.',
      'Your mobile app and web app both call the same /api/orders endpoint, so a bug fix helps both at once.',
      'Twitter/X limiting how many posts a free API key can read per day is rate limiting at the gateway.',
    ],
    mistakes: [
      'Exposing internal details in the API (database IDs, server errors) that attackers can use.',
      'Changing the API without versioning, breaking the mobile app that is already installed on thousands of phones.',
      'No rate limits, so one buggy client or bot can run up a huge AI or database bill.',
      'Inconsistent naming and error formats, making every new feature harder to build.',
    ],
    askAi: [
      {
        label: 'Designing',
        questions: [
          'List every API endpoint my app needs for the core features, with the request and response shape for each.',
          'Should we use REST or GraphQL for this app? Give me the trade-offs in plain language.',
          'How should the API handle errors so the frontend can show helpful messages?',
        ],
      },
      {
        label: 'Building',
        questions: [
          'Implement the API with consistent naming, input validation, and a standard error format.',
          'Add authentication middleware so every endpoint except login/signup requires a valid user.',
          'Generate OpenAPI documentation for the API and keep it updated as we add endpoints.',
          'Add a rate limit of N requests per minute per user on expensive endpoints.',
        ],
      },
      {
        label: 'Verifying',
        questions: [
          'Write automated tests that call every endpoint with valid and invalid data.',
          'What happens if I call the API without a token? With an expired token? With someone else\'s ID?',
        ],
      },
    ],
    quiz: [
      {
        q: 'What is an API, in plain terms?',
        options: [
          'A type of database',
          'The agreed list of requests a backend understands, and the format for each',
          'A design file for the app\'s screens',
          'A cloud provider',
        ],
        answer: 1,
        why: 'An API is the contract between the frontend (or partners) and the backend: what you can ask for and what you get back.',
      },
    ],
    glossary: ['api', 'endpoint', 'rest', 'webhook', 'rate-limit'],
  },
];
