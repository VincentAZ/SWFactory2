import type * as THREE from 'three';

export type LayerId = 'client' | 'edge' | 'app' | 'data' | 'platform';

export type ComponentId =
  | 'users'
  | 'frontend'
  | 'dns-cdn'
  | 'security'
  | 'load-balancer'
  | 'api-gateway'
  | 'auth'
  | 'backend'
  | 'database'
  | 'cache'
  | 'storage'
  | 'queue'
  | 'ai'
  | 'third-party'
  | 'observability'
  | 'cicd'
  | 'infra';

export type Complexity = 1 | 2 | 3; // 1 = Simple, 2 = Standard, 3 = Production

export interface LayerInfo {
  id: LayerId;
  name: string;
  color: string; // hex
  blurb: string;
}

export interface Vendor {
  name: string;
  note: string;
}

export interface TechGroup {
  label: string;
  items: Vendor[];
}

export interface QuizQuestion {
  q: string;
  options: string[];
  answer: number;
  why: string;
}

export interface AiQuestionGroup {
  label: string;
  questions: string[];
}

export interface ComponentContent {
  id: ComponentId;
  name: string;
  shortName: string;
  layer: LayerId;
  level: Complexity; // the complexity level at which this component first appears
  tagline: string;
  analogy: string;
  purpose: string[]; // paragraphs
  howItConnects: string;
  tech: TechGroup[];
  examples: string[];
  mistakes: string[];
  askAi: AiQuestionGroup[];
  quiz: QuizQuestion[];
  glossary?: string[]; // glossary term ids mentioned
}

export interface Glossary {
  term: string;
  def: string;
}

export interface PipeDef {
  id: string;
  from: ComponentId;
  to: ComponentId;
  /** 1..3: the complexity level at which this pipe appears */
  level: Complexity;
  /** optional control-point lift for the curve */
  lift?: number;
  /** dashed, secondary (e.g., observability taps) */
  style?: 'main' | 'secondary';
}

export type PacketKind = 'request' | 'response' | 'event' | 'data' | 'alert' | 'deploy' | 'stream';

export interface FlowStep {
  from: ComponentId;
  to: ComponentId;
  kind: PacketKind;
  label: string;
  narration: string;
  /** seconds for packets to travel */
  duration?: number;
  /** number of packets to spawn */
  count?: number;
  /** optional additional component to spotlight */
  focus?: ComponentId;
  /** optional "what if" hint shown as a callout */
  insight?: string;
}

export interface Scenario {
  id: string;
  title: string;
  icon: string;
  summary: string;
  level: Complexity;
  steps: FlowStep[];
  takeaways: string[];
  askAi: string[];
}

export interface TourStop {
  title: string;
  body: string;
  focus?: ComponentId | 'overview' | ComponentId[];
  view?: 'overview' | 'top' | 'front' | 'side' | 'closeup';
  explode?: number;
  xray?: boolean;
  highlightPipes?: string[];
  runScenario?: string;
  callouts?: string[];
}

export interface Tour {
  id: string;
  title: string;
  icon: string;
  minutes: number;
  level: Complexity;
  summary: string;
  stops: TourStop[];
}

export interface DecisionMetrics {
  cost: number; // 1..5 (5 = expensive)
  complexity: number; // 1..5 (5 = complex)
  speedToLaunch: number; // 1..5 (5 = fast)
  scalability: number; // 1..5
  control: number; // 1..5
}

export interface DecisionOption {
  id: string;
  label: string;
  summary: string;
  metrics: DecisionMetrics;
  pros: string[];
  cons: string[];
  bestFor: string;
  /** components to spotlight in the machine */
  spotlight: ComponentId[];
  /** components that this option removes/collapses (ghosted) */
  removes?: ComponentId[];
  /** badge displayed on spotlight components */
  badge?: string;
  askAi: string;
}

export interface Decision {
  id: string;
  title: string;
  question: string;
  context: string;
  level: Complexity;
  options: DecisionOption[];
  rule: string; // rule of thumb
}

export interface BlueprintArchetype {
  id: string;
  name: string;
  icon: string;
  description: string;
  baseComponents: ComponentId[];
  mustHaves: string[];
}

export interface BlueprintFeature {
  id: string;
  name: string;
  icon: string;
  description: string;
  adds: ComponentId[];
  briefLine: string;
  askAi: string;
}

export interface Mission {
  id: string;
  title: string;
  kind: 'tour' | 'scenario' | 'explore' | 'quiz' | 'decision' | 'blueprint';
  target?: string; // id of the tour/scenario/component/decision
  count?: number;
}

export interface LearningLevel {
  level: Complexity;
  name: string;
  subtitle: string;
  description: string;
  missions: Mission[];
}

export interface PartHandle {
  id: ComponentId;
  group: THREE.Group;
  /** meshes considered the outer shell (hidden/transparent in x-ray) */
  shell: THREE.Mesh[];
  /** things to animate */
  update: (dt: number, t: number) => void;
  /** the approximate bounding radius for camera framing */
  radius: number;
  /** anchor for pipes (world-ish, relative to group) */
  port: THREE.Vector3;
  /** base position in the layout */
  basePosition: THREE.Vector3;
  /** where this component sits in the exploded layer stack */
  layer: LayerId;
}
