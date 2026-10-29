import type { SceneContext } from '../three/scene';
import type { Machine } from '../three/machine';

/** Shared runtime handles, set once by main.ts */
export const runtime: { scene: SceneContext; machine: Machine } = {} as { scene: SceneContext; machine: Machine };
