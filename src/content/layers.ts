import type { LayerId, LayerInfo } from '../app/types';

export const LAYERS: Record<LayerId, LayerInfo> = {
  client: {
    id: 'client',
    name: 'Client',
    color: '#f0815a',
    blurb: 'Everything that runs on the user\'s own device: the app they see and touch.',
  },
  edge: {
    id: 'edge',
    name: 'Edge & Traffic',
    color: '#f2b53f',
    blurb: 'The front door: finding your servers, blocking bad traffic, and spreading the load.',
  },
  app: {
    id: 'app',
    name: 'Application',
    color: '#2fbf9f',
    blurb: 'The brains: your business rules, logins, background work, and the services you call.',
  },
  data: {
    id: 'data',
    name: 'Data',
    color: '#7f72f2',
    blurb: 'Where everything is remembered: records, files, and fast-access copies.',
  },
  platform: {
    id: 'platform',
    name: 'Platform',
    color: '#6e7c9a',
    blurb: 'The ground it all stands on: cloud machines, shipping new versions, and watching for trouble.',
  },
};

export const LAYER_LIST: LayerId[] = ['client', 'edge', 'app', 'data', 'platform'];
