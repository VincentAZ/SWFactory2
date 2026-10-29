import type { ComponentContent } from '../app/types';

export const COMPONENTS_B: ComponentContent[] = [
  {
    id: 'auth',
    name: 'Authentication & Authorization',
    shortName: 'Auth',
    layer: 'app',
    level: 2,
    tagline: 'Proves who someone is (authentication) and decides what they are allowed to do (authorization).',
    analogy: 'The ID check at the door and the wristband that says which areas you can enter.',
    purpose: [
      'Authentication answers "who are you?" It handles sign-up, login, password resets, "Sign in with Google", magic links, and two-factor codes. When it succeeds, it issues a token (a signed proof of identity) that the frontend attaches to every later request so the backend knows who is asking.',
      'Authorization answers "are you allowed?" A logged-in user can see their own orders but not someone else\'s; an admin can refund; a free-plan user cannot export. These rules live in the backend and must be checked on every request, not just hidden in the UI.',
      'Getting this wrong is both common and catastrophic, so the strong advice for founders is: do not build login from scratch. Use a managed provider or a mature library, and spend your energy on the authorization rules that are specific to your business.',
    ],
    howItConnects:
      'The API Gateway asks Auth to verify tokens. Auth stores users and sessions in the Database (or in the provider\'s own store) and issues tokens the Frontend keeps and sends with each request.',
    tech: [
      {
        label: 'Managed auth (recommended)',
        items: [
          { name: 'Clerk', note: 'Beautiful drop-in sign-up/login UI; very popular with AI-built apps.' },
          { name: 'Supabase Auth / Firebase Auth', note: 'Comes with the backend-as-a-service; social logins and magic links built in.' },
          { name: 'Auth0 / Okta', note: 'Enterprise-grade; single sign-on for business customers.' },
          { name: 'WorkOS', note: 'Enterprise SSO and directory sync when selling to large companies.' },
        ],
      },
      {
        label: 'Libraries',
        items: [
          { name: 'Auth.js (NextAuth)', note: 'Open-source auth for Next.js apps.' },
          { name: 'Lucia / Better Auth / Passport', note: 'Framework-level libraries if you want full control.' },
        ],
      },
      {
        label: 'Concepts',
        items: [
          { name: 'JWT / session cookies', note: 'Two common ways to carry "who am I" between requests.' },
          { name: 'OAuth 2.0 / OpenID Connect', note: 'The standards behind "Sign in with Google/Apple/GitHub".' },
          { name: 'RBAC', note: 'Role-based access control: users have roles, roles have permissions.' },
        ],
      },
    ],
    examples: [
      '"Sign in with Google" on a new app: Google verifies you, then tells the app your email; the app never sees your Google password.',
      'A SaaS tool where the "Delete workspace" button only works for the owner role, enforced on the server.',
      'A bank asking for a text-message code on a new device: two-factor authentication.',
    ],
    mistakes: [
      'Storing passwords in plain text or with weak hashing. Use a proven library or a provider.',
      'Checking permissions only in the frontend (hiding a button) but not on the API.',
      'Letting users access any record by changing the ID in the URL (broken object-level authorization).',
      'Tokens that never expire, so a stolen token works forever.',
      'Building a custom login system when a provider would have been free and safer.',
    ],
    askAi: [
      {
        label: 'Designing',
        questions: [
          'Should I use a managed auth provider or a library for this app? Compare cost, effort, and risk.',
          'What roles and permissions does my app need? Draw me the table of who can do what.',
          'Do I need social login, magic links, or two-factor authentication for my audience?',
        ],
      },
      {
        label: 'Building',
        questions: [
          'Integrate [Clerk/Supabase Auth] for sign-up, login, password reset, and Google login.',
          'Add authorization checks on every API endpoint so users can only access their own data. Show me each check.',
          'Implement roles (owner, admin, member) and enforce them server-side.',
          'Make tokens expire and refresh safely, and log the user out everywhere when they change their password.',
        ],
      },
      {
        label: 'Verifying',
        questions: [
          'Log in as user A and try to read or edit user B\'s data by changing IDs. Report every endpoint where it works.',
          'What happens if a token is stolen? How quickly can we revoke it?',
        ],
      },
    ],
    quiz: [
      {
        q: 'What is the difference between authentication and authorization?',
        options: [
          'They are the same thing',
          'Authentication proves who you are; authorization decides what you may do',
          'Authentication is for admins; authorization is for users',
          'Authorization happens on the frontend',
        ],
        answer: 1,
        why: 'Login is authentication. Whether a logged-in user can delete a record is authorization, and it must be checked on the server for every request.',
      },
      {
        q: 'The "Delete" button is hidden for non-admins in the UI. Is the feature secure?',
        options: ['Yes', 'No, the API must also check the role on the server', 'Yes, if the button is also disabled', 'Only if the app is on HTTPS'],
        answer: 1,
        why: 'Anyone can send the delete request directly to the API. Hiding UI is a courtesy, not security.',
      },
    ],
    glossary: ['token', 'jwt', 'oauth', 'rbac', 'session'],
  },
  {
    id: 'backend',
    name: 'Backend (Application Server)',
    shortName: 'Backend',
    layer: 'app',
    level: 1,
    tagline: 'The engine room: your business rules run here, on servers you control.',
    analogy: 'The kitchen. Orders come in from the counter, the recipes are followed exactly, and dishes go back out.',
    purpose: [
      'The backend is the code that receives requests from the frontend and does the real work: checking permissions, applying business rules, reading and writing the database, calling other services, and sending back a response. It runs on servers (or serverless functions) in the cloud, where you control the environment and can keep secrets safe.',
      'Everything that must be true for every user, no matter what device they use, belongs here. "A coupon can only be used once", "an invoice total equals the sum of its lines", "only the owner can delete a project": these are backend rules.',
      'When you build with AI, the backend is where you should insist on clarity and tests. Ask for one place per business rule, clear names, and automated tests that prove the rules hold. A well-organized backend is what lets you keep adding features without breaking old ones.',
    ],
    howItConnects:
      'Receives validated requests from the API Gateway. Reads and writes the Database, uses the Cache for speed, puts files in Storage, hands slow work to the Queue, and calls AI and Third-party services. CI/CD deploys new versions of it; Observability watches it.',
    tech: [
      {
        label: 'Languages & frameworks',
        items: [
          { name: 'TypeScript: Node.js with Next.js, Express, Fastify, Hono, NestJS', note: 'Shares a language with the frontend; the most common AI-built stack.' },
          { name: 'Python: FastAPI, Django, Flask', note: 'Great for data and AI-heavy apps.' },
          { name: 'Go, Rust', note: 'High performance; more effort; less necessary for most startups.' },
          { name: 'Ruby on Rails, Laravel (PHP), .NET', note: 'Mature "batteries included" frameworks.' },
        ],
      },
      {
        label: 'Ways to run it',
        items: [
          { name: 'Serverless functions', note: 'Vercel, Netlify, AWS Lambda, Cloudflare Workers: pay per request, no servers to manage.' },
          { name: 'Containers / PaaS', note: 'Render, Railway, Fly.io, Heroku, Google Cloud Run: always-on apps with simple scaling.' },
          { name: 'Backend-as-a-service', note: 'Supabase, Firebase, Convex: database + auth + functions as one product.' },
        ],
      },
    ],
    examples: [
      'When you tap "Book" on a ride-hailing app, the backend finds nearby drivers, calculates the price, charges your card, and notifies the driver.',
      'Shopify\'s backend applies tax rules for thousands of jurisdictions so each store doesn\'t have to.',
      'An AI note-taking app: the backend receives the audio, sends it to a transcription model, saves the result, and emails the summary.',
    ],
    mistakes: [
      'Putting all logic in one giant file. Ask the AI to organize code by feature (orders, users, billing).',
      'No automated tests, so every new feature risks silently breaking an old one.',
      'Doing slow work (sending 1,000 emails, generating a PDF) inside the request, so the user stares at a spinner. Use a queue.',
      'Hardcoding configuration (URLs, keys, limits) instead of using environment variables.',
      'Over-engineering with microservices on day one. A single well-structured app is faster to build and change.',
    ],
    askAi: [
      {
        label: 'Designing',
        questions: [
          'What are the business rules that must be enforced in the backend for my app? List each one in plain English.',
          'Propose a folder structure organized by feature, and explain where each kind of code goes.',
          'Which operations will be slow (over 1 second) and should run in the background instead?',
        ],
      },
      {
        label: 'Building',
        questions: [
          'Implement the backend for feature X with input validation, authorization, and clear error messages. Keep each business rule in one place.',
          'Write automated tests for the business rules you just implemented, including edge cases.',
          'Add structured logging so I can see each request, who made it, and how long it took.',
          'Move all configuration and secrets to environment variables, with a documented example file.',
        ],
      },
      {
        label: 'Verifying',
        questions: [
          'Explain how a request to create an order flows through the code, file by file.',
          'Run the full test suite and summarize anything that fails or is not covered.',
          'What would break if two users did the same action at exactly the same time?',
        ],
      },
    ],
    quiz: [
      {
        q: 'A rule like "a discount code can only be used once per customer" should live where?',
        options: ['In the frontend, next to the checkout button', 'In the backend, enforced on every request', 'In the CDN', 'In the email template'],
        answer: 1,
        why: 'Only the backend can enforce it reliably: it sees every request from every device and controls the database.',
      },
    ],
    glossary: ['server', 'serverless', 'business-logic', 'environment-variable', 'test'],
  },
  {
    id: 'database',
    name: 'Database',
    shortName: 'Database',
    layer: 'data',
    level: 1,
    tagline: 'The organized memory of your app: every user, order, and message, stored so it can be found and trusted.',
    analogy: 'A meticulous filing cabinet with an index card for every record, kept by a clerk who never loses anything.',
    purpose: [
      'A database stores your app\'s structured records and lets the backend find, filter, update, and relate them quickly. Most apps use a relational (SQL) database: data is kept in tables with rows and columns, like linked spreadsheets with strict rules. A "users" table, an "orders" table, and a rule that every order belongs to exactly one user.',
      'The database is the one component that can\'t be casually replaced or restarted, because it holds the truth. That is why backups, migrations (controlled changes to the structure), and constraints (rules the database enforces itself, such as "email must be unique") matter so much.',
      'For founders, the two decisions that matter most are: use a managed database so someone else handles backups and uptime, and design the tables with the AI before writing features. A clear data model is the skeleton of your product.',
    ],
    howItConnects:
      'The Backend (and Auth) read and write the Database. The Cache keeps hot copies of frequent reads. Observability watches its speed and disk usage, and backups copy it to Storage.',
    tech: [
      {
        label: 'Relational (SQL): the default',
        items: [
          { name: 'PostgreSQL', note: 'The best default choice. Open source, powerful, supported everywhere.' },
          { name: 'MySQL / MariaDB', note: 'Also mature and widely used.' },
          { name: 'SQLite', note: 'A single file; perfect for prototypes, desktop apps, and small services.' },
        ],
      },
      {
        label: 'Managed hosting',
        items: [
          { name: 'Supabase', note: 'Hosted Postgres with auth, storage, and realtime; loved by AI-built apps.' },
          { name: 'Neon', note: 'Serverless Postgres with branching (a copy per feature branch).' },
          { name: 'AWS RDS / Google Cloud SQL / Azure Database', note: 'Managed databases from the big clouds.' },
          { name: 'PlanetScale, Turso', note: 'Managed MySQL and SQLite at scale.' },
        ],
      },
      {
        label: 'Other shapes',
        items: [
          { name: 'MongoDB / Firestore / DynamoDB', note: 'Document databases: flexible JSON-like records. Good for some workloads, easy to misuse.' },
          { name: 'Prisma / Drizzle / SQLAlchemy', note: 'ORMs: libraries that let code talk to the database with less raw SQL.' },
          { name: 'Elasticsearch / Meilisearch / Typesense', note: 'Search engines for full-text and fuzzy search.' },
        ],
      },
    ],
    examples: [
      'An e-commerce store: tables for customers, products, orders, order items, and payments, linked by IDs.',
      'Instagram stores billions of posts in sharded Postgres databases.',
      'A startup loses two days of customer data because the database had no automated backups. Managed databases make this a checkbox.',
    ],
    mistakes: [
      'No backups, or backups that were never tested by restoring them.',
      'Storing the same fact in two places so they drift apart (e.g., order total stored separately from its items).',
      'Missing indexes, so queries that were fast with 100 rows crawl at 1 million.',
      'Letting the AI change the database structure without migrations, making it impossible to reproduce elsewhere.',
      'Storing files (images, PDFs) inside the database instead of in file storage.',
      'Picking a document database because it felt flexible, then struggling with relationships that SQL handles natively.',
    ],
    askAi: [
      {
        label: 'Designing',
        questions: [
          'Design the data model for my app: list each table, its columns, and how tables relate. Explain it in plain English first.',
          'Should this app use PostgreSQL or something else? Why?',
          'Which fields must be unique, required, or constrained, and what should happen when a parent record is deleted?',
        ],
      },
      {
        label: 'Building',
        questions: [
          'Set up a managed Postgres database with migrations, and seed it with realistic sample data.',
          'Add indexes for the queries the app runs most often and explain each one.',
          'Set up automated daily backups and show me how to restore one.',
          'Never expose raw database errors to users; map them to friendly messages.',
        ],
      },
      {
        label: 'Verifying',
        questions: [
          'Generate 100,000 fake records and tell me which screens become slow.',
          'Restore last night\'s backup to a test database and confirm the data is complete.',
          'Which queries are the slowest right now and how would you speed them up?',
        ],
      },
    ],
    quiz: [
      {
        q: 'What is a database "migration"?',
        options: [
          'Moving the database to another country',
          'A controlled, versioned change to the database structure (like adding a column)',
          'Copying data to the cache',
          'Deleting old records',
        ],
        answer: 1,
        why: 'Migrations are scripted structure changes you can apply in order on any copy of the database, which keeps development, testing, and production in sync.',
      },
      {
        q: 'Where should user-uploaded photos be stored?',
        options: ['Inside the database table as binary data', 'In file/object storage, with only the file\'s URL in the database', 'In the frontend code', 'In the cache'],
        answer: 1,
        why: 'Databases are for structured records. Large files belong in object storage; the database keeps a reference to them.',
      },
    ],
    glossary: ['sql', 'table', 'index', 'migration', 'orm', 'backup'],
  },
  {
    id: 'cache',
    name: 'Cache',
    shortName: 'Cache',
    layer: 'data',
    level: 2,
    tagline: 'A fast, temporary copy of things you need often, so you don\'t rebuild or re-fetch them every time.',
    analogy: 'The sticky notes on the kitchen wall: today\'s specials written once, so nobody has to ask the chef again.',
    purpose: [
      'Some data is requested constantly but changes rarely: the product catalog, a user\'s profile, the result of an expensive calculation. A cache keeps a copy in very fast memory, so the backend can answer in a millisecond instead of querying the database or a slow external service.',
      'Caches are temporary by design. Each entry has a time-to-live (TTL) after which it is thrown away and fetched fresh. The art is choosing what to cache, for how long, and how to "invalidate" it when the real thing changes.',
      'Caches appear at every level of the machine: the browser caches images, the CDN caches pages, the backend caches query results, and the database caches its own hot data. A dedicated cache server like Redis is also used for things like rate limit counters, sessions, and live leaderboards.',
    ],
    howItConnects:
      'The Backend checks the Cache before hitting the Database. If the value is there (a "hit"), it answers immediately; if not (a "miss"), it asks the Database and stores the answer for next time.',
    tech: [
      {
        label: 'Cache servers',
        items: [
          { name: 'Redis', note: 'The standard in-memory data store. Caching, sessions, counters, queues.' },
          { name: 'Upstash', note: 'Serverless Redis that works well with Vercel and edge functions.' },
          { name: 'Memcached', note: 'Simpler, older, still solid for pure caching.' },
        ],
      },
      {
        label: 'Built-in caching',
        items: [
          { name: 'HTTP cache headers', note: 'Tell browsers and CDNs how long a response may be reused.' },
          { name: 'Framework caching', note: 'Next.js data cache, React Query / SWR on the client.' },
          { name: 'CDN caching', note: 'Cloudflare, Vercel, CloudFront cache full responses at the edge.' },
        ],
      },
    ],
    examples: [
      'A news site caches its homepage for 60 seconds; a million readers hit the cache, the database is touched once a minute.',
      'A product page that takes 800ms to compute is cached per product and served in 5ms until the product is edited.',
      'Rate limiting ("max 10 login attempts per minute") is typically a counter in Redis.',
    ],
    mistakes: [
      'Caching private data without the user ID in the key, so one user sees another user\'s data.',
      'Never invalidating the cache, so users see stale prices or old names after an edit.',
      'Adding a cache before measuring. Many "slow" apps just need a database index.',
      'Treating the cache as a database: if it can be lost at any moment, nothing irreplaceable should live only there.',
    ],
    askAi: [
      {
        label: 'Designing',
        questions: [
          'Which data in my app is read far more often than it changes, and is safe to cache? For how long?',
          'Do I need a Redis server now, or are HTTP cache headers and framework caching enough?',
        ],
      },
      {
        label: 'Building',
        questions: [
          'Cache the response of endpoint X for N seconds, keyed by user where the data is personal, and invalidate it when the data changes.',
          'Set correct cache headers for static assets (long) and dynamic pages (none).',
          'Use Redis for rate limiting and sessions so the backend stays stateless.',
        ],
      },
      {
        label: 'Verifying',
        questions: [
          'Show me cache hit and miss rates. Is the cache actually helping?',
          'Edit a product and confirm the change is visible everywhere within N seconds.',
        ],
      },
    ],
    quiz: [
      {
        q: 'What is a "cache hit"?',
        options: ['An error in the cache', 'The requested value was found in the cache, so the slow source was skipped', 'The cache was cleared', 'A security attack on the cache'],
        answer: 1,
        why: 'A hit means the cache had the answer. A miss means it did not, so the backend fetches from the real source and stores the result.',
      },
    ],
    glossary: ['cache', 'ttl', 'invalidation', 'redis'],
  },
  {
    id: 'storage',
    name: 'File & Object Storage',
    shortName: 'Storage',
    layer: 'data',
    level: 2,
    tagline: 'A bottomless warehouse for files: images, videos, PDFs, backups, and anything too big for a database row.',
    analogy: 'The warehouse out back. Everything gets a shelf label, and the warehouse never runs out of shelves.',
    purpose: [
      'Object storage holds files of any size and serves them by URL. Instead of putting a 5 MB photo in the database, the app uploads it to storage, gets back an address like `https://files.yourapp.com/photos/abc.jpg`, and stores only that address in the database. Storage is cheap, nearly unlimited, and extremely durable (copies are kept in several places).',
      'Uploads usually go directly from the user\'s device to storage using a short-lived "signed URL" the backend issues, so large files don\'t flow through your servers. Downloads are served through the CDN for speed.',
      'Storage is also where backups, exported reports, generated PDFs, and logs end up. Permissions matter here: a public "bucket" has leaked millions of records at companies that should have known better.',
    ],
    howItConnects:
      'The Backend issues signed upload URLs and records file locations in the Database. The CDN serves files to users. Background Workers process uploads (resize images, scan documents) and write results back.',
    tech: [
      {
        label: 'Object storage',
        items: [
          { name: 'Amazon S3', note: 'The original and the standard everyone copies; the "S3 API" is universal.' },
          { name: 'Cloudflare R2', note: 'S3-compatible with no fees for downloads; great for media-heavy apps.' },
          { name: 'Google Cloud Storage / Azure Blob', note: 'The other big clouds\' equivalents.' },
          { name: 'Supabase Storage / Firebase Storage', note: 'Bundled with the backend-as-a-service, with permission rules built in.' },
        ],
      },
      {
        label: 'Media handling',
        items: [
          { name: 'Cloudinary / imgix / Cloudflare Images', note: 'Resize, crop, and optimize images on the fly.' },
          { name: 'Mux / Cloudflare Stream', note: 'Video upload, encoding, and streaming as a service.' },
          { name: 'UploadThing / Uppy', note: 'Drop-in upload widgets and APIs.' },
        ],
      },
    ],
    examples: [
      'Dropbox and Google Drive are, at heart, object storage with a very polished frontend.',
      'An insurance app stores photos of car damage in S3 and only the claim record in Postgres.',
      'A podcast app uploads audio to R2 and streams it worldwide through the CDN for almost nothing.',
    ],
    mistakes: [
      'Making the storage bucket public by accident. Default to private; serve through signed URLs or the CDN.',
      'Uploading through the backend server, which ties up memory and times out on big files.',
      'Not validating file type and size, allowing someone to upload a 10 GB "profile picture" or a malicious file.',
      'Deleting a database record but leaving the file behind (or vice versa).',
    ],
    askAi: [
      {
        label: 'Designing',
        questions: [
          'What files will users upload, how big can they be, and who should be allowed to see each one?',
          'Should uploads go through my server or directly to storage with a signed URL?',
        ],
      },
      {
        label: 'Building',
        questions: [
          'Implement image uploads using signed URLs to a private bucket, record the file in the database, and serve it via the CDN.',
          'Validate file type and size on both client and server, and generate thumbnails in a background job.',
          'Make sure files are deleted from storage when their record is deleted.',
        ],
      },
      {
        label: 'Verifying',
        questions: [
          'Confirm the bucket is private and that a file URL cannot be guessed or accessed without permission.',
          'Upload a 50 MB file on a slow connection. What does the user see?',
        ],
      },
    ],
    quiz: [
      {
        q: 'What does the database store when a user uploads a photo to object storage?',
        options: ['The full photo', 'Nothing', 'A reference (URL or key) to where the photo lives, plus metadata', 'A compressed copy'],
        answer: 2,
        why: 'The file lives in storage; the database keeps the pointer and facts about it (who uploaded, when, size).',
      },
    ],
    glossary: ['bucket', 'signed-url', 'object-storage'],
  },
  {
    id: 'queue',
    name: 'Queue & Background Workers',
    shortName: 'Queue',
    layer: 'app',
    level: 3,
    tagline: 'A waiting line for slow jobs, and the workers who process them while users carry on.',
    analogy: 'The order tickets clipped on the kitchen rail: the waiter does not stand in the kitchen while the meal cooks.',
    purpose: [
      'Some work takes too long or is too unreliable to do while a user waits: sending 5,000 emails, generating a video, calling a slow AI model, syncing with a partner\'s API. Instead, the backend writes a small "job" onto a queue and returns immediately with "we\'re on it". Separate worker processes pick jobs off the queue and do the work.',
      'Queues make apps feel fast and make them resilient: if a job fails, it can be retried automatically; if a flood of jobs arrives, they wait in line instead of crashing the server; if a worker dies, another picks up where it left off.',
      'Scheduled jobs ("every night at 2am, send a summary email") are the same idea on a timer. Most modern platforms offer this as a managed feature so you don\'t have to run worker servers yourself.',
    ],
    howItConnects:
      'The Backend enqueues jobs. Workers pull them, often calling AI Services or Third-party APIs, writing results to the Database and Storage, and notifying users when done.',
    tech: [
      {
        label: 'Managed job platforms',
        items: [
          { name: 'Inngest', note: 'Event-driven functions with retries and scheduling; integrates with Vercel and others.' },
          { name: 'Trigger.dev', note: 'Long-running background jobs in TypeScript.' },
          { name: 'QStash (Upstash)', note: 'Serverless message queue and scheduler.' },
          { name: 'AWS SQS + Lambda / Google Cloud Tasks', note: 'Cloud-native queues.' },
        ],
      },
      {
        label: 'Libraries & brokers',
        items: [
          { name: 'BullMQ (Redis)', note: 'Popular Node.js job queue on top of Redis.' },
          { name: 'Celery (Python)', note: 'The classic Python task queue.' },
          { name: 'RabbitMQ / Kafka', note: 'Heavy-duty message brokers for high volume or event streaming.' },
          { name: 'Cron', note: 'The decades-old scheduler; most platforms offer "cron jobs".' },
        ],
      },
    ],
    examples: [
      'You export a big report and get an email with a download link ten minutes later: a background job.',
      'When you upload a video to YouTube, "processing" is a queue of transcoding jobs.',
      'A webhook from Stripe arrives; the backend queues "fulfil order" so the webhook returns instantly and the work retries if it fails.',
    ],
    mistakes: [
      'Doing slow work in the request and raising the server timeout instead of using a queue.',
      'Jobs that are not safe to retry (sending the same email twice, charging the card twice). Make jobs idempotent.',
      'No dead-letter handling, so failed jobs vanish silently.',
      'Introducing a queue system before the app has any slow work. Add it when you need it.',
    ],
    askAi: [
      {
        label: 'Designing',
        questions: [
          'Which operations in my app should run in the background, and what should the user see while they wait?',
          'What is the simplest background job setup for my hosting platform?',
        ],
      },
      {
        label: 'Building',
        questions: [
          'Move the X operation into a background job with retries, and show progress to the user.',
          'Make each job idempotent so a retry never duplicates emails, charges, or records.',
          'Add a nightly scheduled job that does Y, and alert me if it fails.',
        ],
      },
      {
        label: 'Verifying',
        questions: [
          'Force a job to fail. Does it retry? Where can I see failed jobs?',
          'Queue 1,000 jobs at once. How long until they finish and does the app stay responsive?',
        ],
      },
    ],
    quiz: [
      {
        q: 'Why should "send a welcome email" run as a background job rather than inside the sign-up request?',
        options: [
          'Emails are illegal to send during requests',
          'So sign-up responds instantly and a slow or failing email service does not block or break the sign-up',
          'Because queues are cheaper than servers',
          'It should not; emails must be sent immediately',
        ],
        answer: 1,
        why: 'The user cares about getting into the app. The email can be sent a second later and retried if the email provider is down.',
      },
    ],
    glossary: ['queue', 'worker', 'idempotent', 'cron'],
  },
];
