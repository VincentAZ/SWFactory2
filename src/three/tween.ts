export type Ease = (t: number) => number;

export const easeInOutCubic: Ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOutCubic: Ease = (t) => 1 - Math.pow(1 - t, 3);
export const easeOutBack: Ease = (t) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

interface Tween {
  elapsed: number;
  duration: number;
  ease: Ease;
  update: (k: number) => void;
  done?: () => void;
  tag?: string;
}

const tweens: Tween[] = [];

export function tween(
  duration: number,
  update: (k: number) => void,
  opts: { ease?: Ease; done?: () => void; tag?: string } = {},
): () => void {
  if (opts.tag) cancelTweens(opts.tag);
  const t: Tween = { elapsed: 0, duration: Math.max(0.0001, duration), ease: opts.ease ?? easeInOutCubic, update, done: opts.done, tag: opts.tag };
  tweens.push(t);
  return () => {
    const i = tweens.indexOf(t);
    if (i >= 0) tweens.splice(i, 1);
  };
}

export function cancelTweens(tag: string) {
  for (let i = tweens.length - 1; i >= 0; i--) if (tweens[i].tag === tag) tweens.splice(i, 1);
}

export function stepTweens(dt: number) {
  for (let i = tweens.length - 1; i >= 0; i--) {
    const t = tweens[i];
    t.elapsed += dt;
    const k = Math.min(1, t.elapsed / t.duration);
    t.update(t.ease(k));
    if (k >= 1) {
      tweens.splice(i, 1);
      t.done?.();
    }
  }
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
/** frame-rate independent damping */
export const damp = (a: number, b: number, lambda: number, dt: number) => lerp(a, b, 1 - Math.exp(-lambda * dt));
