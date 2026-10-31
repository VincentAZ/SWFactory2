import type { ComponentId, FounderCopy } from '../app/types';

/**
 * Founder-lens copy for every component.
 *
 * The Builder lens is the original copy in componentsA/B/C. This file holds the plain-language
 * variant shown by default: one everyday "Think of it as" metaphor, a 2–3 sentence description
 * with no unexplained jargon, one "In the real world" example from a small-business app, and
 * 2–3 copy-paste prompts for the founder's AI coding assistant.
 *
 * Standard: any term a Salesforce-literate non-engineer wouldn't know is replaced or explained
 * in-line on first use. Keep descriptions to 2–3 sentences (the content test enforces this).
 */
export const FOUNDER_COPY: Record<ComponentId, FounderCopy> = {
  users: {
    tagline: 'The customers and staff who use your app, on whatever phone or laptop they happen to have.',
    analogy: 'The customers walking in the door. Everything else in the building exists to serve them.',
    description:
      'Your users are the people who open your app on a phone, laptop, or tablet and ask it to do something. Their device is theirs, not yours: it may be old, slow, or on bad Wi-Fi, and anything your app sends to it can be seen and changed by whoever is holding it. That is why every important check happens on your side, not theirs.',
    realWorld:
      'A booking tool for a hair salon: the owner uses it on the front-desk iPad, the stylists check it on their phones between clients, and customers book from a link on Instagram while riding the bus.',
    askAi: [
      'Who are my main users, and what devices and internet conditions should we design for first?',
      'Make the app work well on a small phone screen and a slow connection. Tell me exactly what you changed.',
      'Which values coming from the user\'s device are we trusting without double-checking on the server? List them and fix each one.',
    ],
  },
  frontend: {
    tagline: 'The screens people see and tap. It runs on their device, not yours.',
    analogy: 'The shopfront. It is everything the customer sees and touches, but the real work happens out back.',
    description:
      'The frontend is the screens, buttons, and forms of your app. It is sent to the user\'s device and runs there, which is why it looks like the whole product to them. It collects what the person wants and passes the request to the backend, which does the real work and keeps the secrets.',
    realWorld:
      'In a small-business CRM (customer relationship manager), the contact list, the deal board you drag cards across, and the "Add note" form are all frontend. The notes themselves are saved by the backend.',
    askAi: [
      'List every screen my app needs for the main thing a user does, and what information each screen shows.',
      'Build the [contact list] screen so it works on phone and desktop, with clear messages for loading, empty, and error states.',
      'Are any passwords, keys, or secrets included in the frontend code? Move them to the server.',
    ],
  },
  'dns-cdn': {
    tagline: 'Turns your web address into a location, and hands out your app\'s files from somewhere nearby.',
    analogy: 'The phone book and a chain of local depots. One finds the shop; the other hands you the goods from the nearest branch.',
    description:
      'When someone types your web address, DNS (the internet\'s address book) looks up which computer to send them to. A CDN (a network of servers around the world) then delivers your app\'s pages, pictures, and code from the server closest to that person, so it loads fast. Most hosting services set both up for you.',
    realWorld:
      'A booking tool for a yoga studio: when a client in Denver opens the schedule, the studio logo and the app itself arrive from a server in Denver, even though the studio\'s data lives on a server in Virginia.',
    askAi: [
      'Point my domain name at the app, with the secure padlock (HTTPS) turned on. What do I need to set at the company I bought the domain from?',
      'Which parts of my app are the same for everyone and could be served from a CDN to make it faster?',
      'Check that nothing personal (like a logged-in user\'s page) is being kept as a copy and shown to the wrong person.',
    ],
  },
  security: {
    tagline: 'Locks the doors, checks the mail, and keeps your keys out of sight.',
    analogy: 'The security desk in the lobby. It checks for trouble before anyone reaches the offices.',
    description:
      'This is the set of protections at the front door of your app: traffic is scrambled so nobody can read it in transit (the padlock you see in a browser), known attack patterns are blocked, and one visitor can\'t hammer your app thousands of times a minute. Behind the door the rules continue: never trust what a form sends in, and keep passwords and keys in a locked place on the server, never in the code. Most real breaches come from a leaked key or a missing check, not from genius hackers.',
    realWorld:
      'A CRM for a mortgage broker: client income and ID documents travel scrambled between the browser and the server, a visitor who tries 500 passwords in a minute is blocked, and the key to the e-signature service lives in a vault on the server, not in the app people download.',
    askAi: [
      'Search the whole codebase for any passwords or secret keys written into the code, and move them somewhere safe on the server.',
      'What are the most likely ways someone could attack an app like mine, and what is the cheapest defense for each?',
      'Log in as one customer and try to see another customer\'s records by changing numbers in the web address. Does it work? Fix it.',
    ],
  },
  'load-balancer': {
    tagline: 'Spreads visitors across several copies of your app so no single copy gets overwhelmed.',
    analogy: 'The host at a busy restaurant, seating each party at whichever table is free.',
    description:
      'One server can only serve so many people at once, so when your app gets busy you run several identical copies. The load balancer stands at the front, handing each visitor to a copy that is free and healthy, and skipping any copy that has broken. Most hosting services include this automatically; you only notice it when you turn up the number of copies.',
    realWorld:
      'A booking tool for a chain of car washes runs on one copy of the app most of the year. On the first warm Saturday of spring, bookings spike and the hosting service quietly starts three more copies; the load balancer shares the rush between them.',
    askAi: [
      'Does my hosting service automatically add copies of the app when traffic spikes? What do I need to switch on, and what is the maximum bill I could get?',
      'Make sure the app works correctly when several copies run at once. For example, a user must not get logged out when their next request lands on a different copy.',
    ],
  },
  'api-gateway': {
    tagline: 'The menu of things your app can ask for, and the doorway every request passes through.',
    analogy: 'The ordering counter with a printed menu. You can only order what is on it, and every order is written the same way.',
    description:
      'An API is the fixed list of requests your backend understands, like "show my contacts", "create a booking", or "send this invoice", and your web app, mobile app, and partner tools all order from that same menu. The gateway is the counter where every order is checked before it reaches the kitchen: is this person logged in, and have they ordered too many times this minute? In a small app the gateway is just the first few lines of backend code; it becomes its own product when you grow or open your API to customers.',
    realWorld:
      'A CRM\'s API has an item like "add a note to contact #412". The web app uses it, the mobile app uses it, and a Zapier automation that adds notes from your inbox uses the same one, so a fix to it helps all three at once.',
    askAi: [
      'List every request my app will need to make to the backend, in plain language, with what goes in and what comes back.',
      'Make every request require a logged-in user except sign-up and login, and limit how many times a minute one user can call the expensive ones.',
      'Write automated tests that try each request with good data, bad data, and no login.',
    ],
  },
  auth: {
    tagline: 'Checks who someone is, then what they are allowed to do.',
    analogy: 'The ID check at the door, plus the wristband that says which rooms you can enter.',
    description:
      'Authentication is the login: proving you are who you say, with a password, "Sign in with Google", or a code sent by text. Authorization is the permissions: once you are in, what you may see and change, so a staff member sees their own clients but not payroll, and only the owner can delete things. Building login yourself is risky, so most new apps use a ready-made login service and spend their effort on the permission rules instead.',
    realWorld:
      'A booking tool for a dental practice: receptionists log in with their work Google account and see today\'s schedule, but only the practice manager can issue refunds, and that rule is enforced on the server, not just by hiding a button.',
    askAi: [
      'Set up sign-up, login, password reset, and "Sign in with Google" using a ready-made login service such as Clerk or Supabase Auth.',
      'Draw me a table of who can do what in my app (owner, staff, customer), then enforce it on the server for every request.',
      'Log in as one user and try to read or edit another user\'s data. Report every place where it works.',
    ],
  },
  backend: {
    tagline: 'Where your business rules actually run, on computers you control.',
    analogy: 'The kitchen. Orders come in from the counter, the recipes are followed exactly, and plates go back out.',
    description:
      'The backend is the code that does the real work: it receives each request, checks the person is allowed, applies your rules (a discount code works once; an invoice total must match its lines), reads and saves records, and sends back the answer. It runs on servers in the cloud, out of users\' reach, so this is where secrets and decisions live. If a rule must hold for everyone no matter what device they use, it belongs here.',
    realWorld:
      'In an AI assistant that answers from a plumber\'s own job records, the backend is what looks up that plumber\'s jobs (and only theirs), bundles them with the question, sends it all to the AI, and saves the answer.',
    askAi: [
      'Write down every business rule my app must enforce, in plain English, before building anything. For example: "a booking cannot overlap another booking for the same staff member".',
      'Build the backend for [feature], keep each rule in one clearly named place, and write automated tests that prove each rule holds.',
      'Explain, step by step and in plain language, what happens in the code when a user [creates a booking].',
    ],
  },
  database: {
    tagline: 'Your app\'s filing cabinet: every customer, order, and note, kept so it can be found and trusted.',
    analogy: 'The filing cabinet. Every record has its own folder, everything is cross-referenced, and the clerk never loses a sheet.',
    description:
      'The database is where your app\'s records live: a table of customers, a table of bookings, a table of invoices, with each row linked to the others by ID numbers, much like related objects in a CRM. It enforces its own rules, such as "every booking must belong to a customer" and "no two accounts with the same email". Because it holds the truth, it is the one part you can\'t casually swap out, so backups and careful, versioned changes matter more here than anywhere else.',
    realWorld:
      'A CRM for a landscaping company has tables for customers, properties, quotes, and jobs. When you open a customer, the app pulls that customer\'s row plus every property, quote, and job that points back to their ID.',
    askAi: [
      'Design the tables for my app (customers, bookings, and so on) and how they link together. Explain it in plain English before writing any code.',
      'Set up a managed database with automatic daily backups, and show me how to restore one so I know it works.',
      'Fill the database with 100,000 realistic fake records and tell me which screens get slow.',
    ],
  },
  cache: {
    tagline: 'A fast scratch copy of things you need constantly, so the filing cabinet is not opened every time.',
    analogy: 'The sticky note on the kitchen wall with today\'s specials, so nobody has to ask the chef again.',
    description:
      'Some information is asked for constantly but rarely changes: your price list, your services, a busy customer\'s profile. A cache keeps a copy in very fast memory so the app answers instantly instead of looking it up from scratch each time. Copies expire after a set time, and the tricky part is throwing the copy away the moment the real thing changes.',
    realWorld:
      'A booking tool for a tutoring center shows the same list of subjects and tutors to every visitor. It is kept in the cache for a minute: thousands of visitors see it instantly, and the database is only asked once a minute.',
    askAi: [
      'Which information in my app is read far more often than it changes, and is safe to keep a fast copy of? For how long?',
      'Keep a fast copy of [the services list] for [60] seconds, and refresh it immediately when someone edits a service.',
      'Make sure a cached copy of one customer\'s private data can never be shown to a different customer.',
    ],
  },
  storage: {
    tagline: 'The warehouse for files: photos, PDFs, videos, and anything too big for a filing-cabinet drawer.',
    analogy: 'The warehouse out back. Every item gets a shelf label, and it never runs out of shelves.',
    description:
      'Photos, contracts, and videos don\'t belong in the database; they go to file storage, which is cheap, nearly unlimited, and keeps several copies so nothing is lost. The database stores only the shelf label: the file\'s address. Uploads usually go straight from the user\'s device to storage using a temporary, single-use permission link from the backend, so big files never clog your servers.',
    realWorld:
      'A CRM for a roofing company: inspectors photograph roof damage on their phones. The photos go to file storage; the customer\'s record in the database just holds a link to each one.',
    askAi: [
      'Let users upload [photos] straight to private file storage using a temporary permission link, check the file type and size, and save a link to the file on the customer\'s record.',
      'Confirm that nobody can list or guess the addresses of stored files, and that each file is only visible to people allowed to see it.',
      'Delete the file from storage when its record is deleted, so we are not paying to keep orphaned files.',
    ],
  },
  queue: {
    tagline: 'A waiting line for slow jobs, with helpers who work through it while users carry on.',
    analogy: 'The order tickets clipped on the kitchen rail. The waiter does not stand in the kitchen while the meal cooks.',
    description:
      'Some tasks take too long to make a person wait: sending 2,000 reminder emails, building a PDF report, asking an AI to summarize a long call. Instead of doing them on the spot, the backend writes a ticket onto a queue, tells the user "on it", and separate helper programs (workers) take tickets off the line and do the work, retrying if something fails. Scheduled tasks, like sending tomorrow\'s reminders every evening, are the same idea on a timer.',
    realWorld:
      'A booking tool for a physical therapy clinic: at 6pm each day a scheduled job puts one "send reminder" ticket on the queue for every appointment tomorrow. Workers send them one by one; if the text-message service is down, the tickets wait and retry.',
    askAi: [
      'Which operations in my app take more than a second or talk to an outside service? Move each one into a background job that retries if it fails.',
      'Make every background job safe to run twice, so a retry never sends a duplicate email or charges a card again.',
      'Add a nightly scheduled job that [sends tomorrow\'s reminders], and alert me if it fails.',
    ],
  },
  ai: {
    tagline: 'The AI models your app calls to read, write, summarize, and answer from your own data.',
    analogy: 'A brilliant consultant on call. Give them a clear brief and the right documents, and they draft an answer in seconds.',
    description:
      'An AI feature means your backend sends text (a question, a document, a customer\'s history) to an AI model and gets back a written answer, a summary, or neatly extracted details. The model knows nothing about your business, so the backend first fetches the relevant records and includes them with the question; that is how an assistant can answer from your own data. Two things to watch: every call costs money and takes a few seconds, and the model can be confidently wrong, so anything important gets checked.',
    realWorld:
      'An assistant inside an electrician\'s job-management app: the owner asks "Which quotes from last month haven\'t been accepted?" The backend pulls that owner\'s quotes, hands them to the AI with the question, and the answer appears a few words at a time with the list.',
    askAi: [
      'Which features in my app genuinely need AI, and which are better as plain rules? Be honest.',
      'Build the [assistant] so the AI is called only from the backend, only sees the logged-in user\'s own data, and has a monthly spending cap per user.',
      'Create 30 realistic test questions with the answers I would expect, run them, and tell me how many the assistant gets right.',
    ],
  },
  'third-party': {
    tagline: 'Payments, email, text messages, maps: the services you plug in instead of building.',
    analogy: 'The suppliers and utilities. You don\'t generate your own electricity or run your own bank.',
    description:
      'A big part of any app is rented from specialists: taking a card payment, sending an email or text, showing a map, e-signing a document. You get a secret key, your backend calls their service when something happens in your app, and they send a message back to your app (a "webhook") when something happens on their side, like "payment received". The trade-off is dependence: their outage is your outage, and their price change is your cost.',
    realWorld:
      'A booking tool for a dog groomer uses Stripe to take deposits, Twilio to text "we\'re ready for Biscuit", and Google Maps to show the shop. None of that is code the owner\'s AI assistant had to write from scratch.',
    askAi: [
      'Which parts of my app should I rent from a provider instead of building? For each, name the provider, the rough price, and the risk.',
      'Add card payments with Stripe so the app never touches card numbers, and make sure a fake "payment received" message is rejected.',
      'What happens to a customer if the email service is down while they are signing up? Make it fail gracefully.',
    ],
  },
  observability: {
    tagline: 'The gauges and alarms that tell you the app is working, and wake you when it isn\'t.',
    analogy: 'The control tower. Radar, gauges, and an alarm that sounds before passengers notice anything.',
    description:
      'Once real customers are using the app, "is it working?" has to be answered every minute, automatically. Observability is the set of tools that record what happened (logs), count how much and how fast (metrics), and capture exactly what broke and for how many people (error tracking). From those come alerts to your phone when something crosses a line, and a dashboard with the numbers you care about: sign-ups, errors, AI spend.',
    realWorld:
      'The owner of a cleaning-company CRM gets a text at 7am: "Invoice sending failed for 12 customers since 6:40". She forwards it to her AI assistant with "fix this" before any customer has noticed.',
    askAi: [
      'Set up error tracking and an uptime check, and alert me by email or text when errors spike or the app goes down.',
      'What are the five numbers I should look at every morning to know the app is healthy, and what values should worry me?',
      'Search the logs for anything that should never be there: passwords, card numbers, or login tokens.',
    ],
  },
  cicd: {
    tagline: 'How a change goes from an idea to safely running for customers: saved, tested, previewed, shipped.',
    analogy: 'The assembly line and the launch pad. Every change is inspected, boxed, and launched the same safe way.',
    description:
      'Version control (usually Git, hosted on GitHub) saves every change to the code with who made it and why, so any earlier version can be restored. The pipeline (CI/CD) then does the inspection automatically: each time the AI changes something it runs the tests, gives you a private preview link to click through, and only then ships the change to real users. If something slips through, one click puts the previous version back, which is the safety net that lets you move fast.',
    realWorld:
      'The owner of a booking tool asks her AI for a "cancel appointment" button. The AI makes the change, the tests pass, she clicks through a preview link on her phone, approves it, and it is live for customers three minutes later. The next morning something looks off, so she puts the old version back with one click.',
    askAi: [
      'Set things up so every change is tested automatically and I get a preview link to try before it goes live. Tell me which tools you will use.',
      'Create separate "rehearsal" and "live" versions of the app with their own data, so experiments never touch real customers.',
      'Show me how to undo the last release in one step, and prove it works on the rehearsal version.',
    ],
  },
  infra: {
    tagline: 'The rented computers everything runs on. You pay by the hour, not by the building.',
    analogy: 'The land, power, and plumbing under the whole building. You lease it by the hour and can expand overnight.',
    description:
      'Every part of your app ultimately runs on computers in a data center that you rent from a cloud provider by the minute: you never buy hardware, you say what you need and it appears. For a new app, start on a developer-friendly hosting platform that manages the machines for you, and move to a big raw cloud provider only when you have a specific reason. Watch three things: monthly cost (set a budget alert), where your data lives (near your customers and inside any legal boundaries), and how hard it would be to move later.',
    realWorld:
      'A solo founder\'s CRM runs on Vercel plus Supabase for about $45 a month. When the business grows she turns up the dial rather than buying a server, and a billing alert at $200 protects her from surprises.',
    askAi: [
      'Given my app, a team of one, and my budget, which hosting platform should I start on, and what would make me outgrow it?',
      'Set up budget alerts at $[50] and $[200] a month, and tell me which parts of the setup cost the most.',
      'Estimate the monthly hosting cost at 100, 1,000, and 10,000 users.',
    ],
  },
};
