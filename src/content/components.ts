import type { ComponentContent, ComponentId, Complexity } from '../app/types';
import { COMPONENTS_A } from './componentsA';
import { COMPONENTS_B } from './componentsB';
import { COMPONENTS_C } from './componentsC';

export const COMPONENTS: ComponentContent[] = [...COMPONENTS_A, ...COMPONENTS_B, ...COMPONENTS_C];

export const COMPONENT_MAP: Record<ComponentId, ComponentContent> = Object.fromEntries(
  COMPONENTS.map((c) => [c.id, c]),
) as Record<ComponentId, ComponentContent>;

export const COMPONENT_IDS: ComponentId[] = COMPONENTS.map((c) => c.id);

export const COMPONENT_NAMES: Record<ComponentId, string> = Object.fromEntries(
  COMPONENTS.map((c) => [c.id, c.name]),
) as Record<ComponentId, string>;

export const COMPONENT_SHORT_NAMES: Record<ComponentId, string> = Object.fromEntries(
  COMPONENTS.map((c) => [c.id, c.shortName]),
) as Record<ComponentId, string>;

export const COMPONENT_LEVELS: Record<ComponentId, Complexity> = Object.fromEntries(
  COMPONENTS.map((c) => [c.id, c.level]),
) as Record<ComponentId, Complexity>;

/** Display order: follows the path of a request through the machine */
export const COMPONENT_ORDER: ComponentId[] = [
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
