import type { LayerId } from '../app/types';
import type { PacketKind } from '../app/types';

export const PALETTE = {
  background: '#f3eee4',
  fog: '#efe9dd',
  platformTop: '#e8e2d6',
  platformSide: '#d6cfc0',
  platformTrim: '#c9c1b1',
  graphite: '#2f3340',
  graphiteLight: '#4a4f5e',
  cream: '#fbf8f1',
  brass: '#d9a95b',
  brassDark: '#b4863c',
  glass: '#cfe3ee',
  ice: '#bfe9ff',
  pipe: '#c9d2e3',
  white: '#ffffff',
  red: '#ff5a6e',
};

export const LAYER_COLORS: Record<LayerId, string> = {
  client: '#f0815a',
  edge: '#f2b53f',
  app: '#2fbf9f',
  data: '#7f72f2',
  platform: '#6e7c9a',
};

export const LAYER_SOFT: Record<LayerId, string> = {
  client: '#f8b89f',
  edge: '#f8d58a',
  app: '#8edcc8',
  data: '#b7aef7',
  platform: '#aeb8cd',
};

export const PACKET_COLORS: Record<PacketKind, string> = {
  request: '#ff8f3c',
  response: '#2fd3a3',
  event: '#b989ff',
  data: '#4f9dff',
  alert: '#ff4d6d',
  deploy: '#22c9c0',
  stream: '#ff6fb5',
};
