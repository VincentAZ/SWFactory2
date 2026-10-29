import type { LearningLevel } from '../app/types';

export const LEVELS: LearningLevel[] = [
  {
    level: 1,
    name: 'Explorer',
    subtitle: 'The four parts every app has',
    description: 'Learn the simplest true model: people, frontend, backend, database, all on the cloud. Finish the missions to unlock the Standard machine.',
    missions: [
      { id: 'l1-tour', title: 'Take "The big picture" tour', kind: 'tour', target: 'big-picture' },
      { id: 'l1-explore', title: 'Click and read about 4 components', kind: 'explore', count: 4 },
      { id: 'l1-scenario', title: 'Run the "Open the app" scenario', kind: 'scenario', target: 'page-load' },
      { id: 'l1-quiz', title: 'Pass a quiz on the Frontend or Backend', kind: 'quiz', count: 1 },
      { id: 'l1-decision', title: 'Try the "Which kind of database?" decision', kind: 'decision', target: 'database-choice' },
    ],
  },
  {
    level: 2,
    name: 'Builder',
    subtitle: 'The standard modern stack',
    description: 'Add the pieces real products need: identity, APIs, files, cache, AI, and the services you buy instead of build.',
    missions: [
      { id: 'l2-tour', title: 'Take "Where your data lives"', kind: 'tour', target: 'where-data-lives' },
      { id: 'l2-ai-tour', title: 'Take "Building it with AI"', kind: 'tour', target: 'building-with-ai' },
      { id: 'l2-explore', title: 'Explore 10 components in total', kind: 'explore', count: 10 },
      { id: 'l2-scenario-auth', title: 'Run "Sign up and log in"', kind: 'scenario', target: 'signup-login' },
      { id: 'l2-scenario-ai', title: 'Run "Ask the AI assistant"', kind: 'scenario', target: 'ai-chat' },
      { id: 'l2-quiz', title: 'Pass 3 quizzes', kind: 'quiz', count: 3 },
      { id: 'l2-decision', title: 'Try 3 decisions in the Decision Lab', kind: 'decision', count: 3 },
    ],
  },
  {
    level: 3,
    name: 'Architect',
    subtitle: 'Production-grade systems',
    description: 'Security, scale, background work, shipping, and watching it all run. Then design your own app and generate its AI build brief.',
    missions: [
      { id: 'l3-tour', title: 'Take "Follow one request"', kind: 'tour', target: 'follow-request' },
      { id: 'l3-safe', title: 'Take "Keeping it safe"', kind: 'tour', target: 'keeping-it-safe' },
      { id: 'l3-ship', title: 'Take "From code to cloud"', kind: 'tour', target: 'code-to-cloud' },
      { id: 'l3-explore', title: 'Explore all 17 components', kind: 'explore', count: 17 },
      { id: 'l3-incident', title: 'Run "Something breaks at 3am"', kind: 'scenario', target: 'incident' },
      { id: 'l3-viral', title: 'Run "Go viral"', kind: 'scenario', target: 'traffic-spike' },
      { id: 'l3-quiz', title: 'Pass 8 quizzes', kind: 'quiz', count: 8 },
      { id: 'l3-blueprint', title: 'Generate a build brief in the Blueprint Builder', kind: 'blueprint' },
    ],
  },
];
