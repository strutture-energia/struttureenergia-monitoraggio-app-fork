import pluginJson from './plugin.json';

export const PLUGIN_BASE_URL = `/a/${pluginJson.id}`;

export enum ROUTES {
  Albero = 'albero',
  IP = 'ip',
  AnalisiFatture = "analisi_fatture",
  Three = 'three',
  Four = 'four',
}
