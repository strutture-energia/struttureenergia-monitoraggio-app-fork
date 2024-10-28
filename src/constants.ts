import pluginJson from './plugin.json';

export const PLUGIN_BASE_URL = `/a/${pluginJson.id}`;

export enum ROUTES {
  Albero = 'albero',
  IP = 'ip',
  Blockchain = "blockchain",
  Three = 'three',
  Four = 'four',
}
