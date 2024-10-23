import axios, { AxiosResponse } from "axios";

// Le chiamate che iniziano con '/api/...' fanno parte delle API di Grafana, non del plugin, 
// e permettono di interagire con varie funzionalità come la gestione di dashboard, folder, datasource e plugin configuration.

const DASHBOARD_UID = "JZzG46Enz";
const reqOptions = {
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
  }
}

// DASHBOARD MANAGEMENT

// Ottiene l'UID e l'ID della cartella della dashboard con un determinato UID
export async function getDashboardFolderUid(): Promise<any> {
  const res = await axios.get(`./api/dashboards/uid/${DASHBOARD_UID}`, reqOptions);
  if (res?.data?.meta) {
    return {fId: res.data.meta.folderId, fUid: res.data.meta.folderUid};
  } else {
    return {fId: null, fUid: null};
  }
}

// Ottiene tutte le dashboard presenti (ad esempio, "analisi flusso" e "diagnosi")
export async function getAllDashboards() {
  const res = await axios.get('./api/search?query=&type=dash-db', reqOptions);
  return handleResponse(res);
}

// Crea una nuova dashboard all'interno di una cartella specifica
export async function createDashboardAtFolder(
  folderId: number,
  dashboard: any,
) {
  const data = { dashboard: { ...dashboard, id: null, uid: null}, folderId, overwrite: true };
  const res = await axios.post('./api/dashboards/db', data, reqOptions);
  return handleResponse(res);
}

// Aggiorna una dashboard esistente all'interno di una cartella specifica
export async function updateDashboardAtFolder(
  folderId: number,
  dashboard: any
) {
  const data = { dashboard, folderId, overwrite: true};
  const res = await axios.post('./api/dashboards/db', data, reqOptions);
  return handleResponse(res);
}

// La tengo che boh, serve a qualcosa?
/* export async function updateDashboard(
  folderUid: string,
  folderId: number,
) {
  const data = {dashboard: {
    ...dashboard,
    id: null,
    uid: null,
  }, folderId, message: 'update', overwrite: true};
  const res = await axios.post(`./api/dashboards/db`, data, reqOptions);
  return {status: res.status, data: res?.data};
} */

// FOLDER MANAGEMENT

// Ottiene tutte le cartelle create in Grafana
export async function getGrafanaFolders() {
  return axios.get('./api/folders', reqOptions);
}

// Crea una nuova cartella in Grafana con un determinato nome
export async function createGrafanaFolder(
  name: string
) {
  const res = await axios.post('./api/folders', {title: name}, reqOptions);
  return handleResponse(res);
}

// DATASOURCE MANAGEMENT

// Crea un datasource InfluxDB in Grafana
export async function createGrafanaDatasource(
  name: string,
  serverAddress: string,
  orgName: string,
  token: string,
  timeout = 3000
): Promise<any> {
  const payload = {
    name: name,
    type: 'influxdb',
    access: 'proxy',
    url: serverAddress,
    readOnly: false,
    basicAuth: true,
    jsonData: {
      timeout: timeout,
      version: 'Flux',
      organization: orgName,
      httpMode: 'POST',
    },
    secureJsonData: {
      token: token,
    }
  };
  const res = await axios.post('./api/datasources', payload, reqOptions);
  return handleResponse(res);
}

// Elimina un datasource in Grafana specificando l'UID
export async function deleteGrafanaDatasource(
  datasourceUid: string
): Promise<void> {
  console.log("DEBUG - deleteGrafanaDatasource: chiamato")
  return await axios.delete(`./api/datasources/uid/${datasourceUid}`, reqOptions);
}

// PLUGIN CONFIGURATION

// Salva le impostazioni del plugin con i dati forniti in jsonData
export async function savePluginConfig(jsonData: any) {
  await axios.post('./api/plugins/struttureenergia-monitoraggio-app/settings', {
    enabled: true,
    jsonData
  }, reqOptions);
}

// Recupera le impostazioni salvate per il plugin
export async function getPluginConfig(): Promise<any> {
  const res = await axios.get('./api/plugins/struttureenergia-monitoraggio-app/settings', reqOptions);
  return handleResponse(res);
}

// UTILITY FUNCTIONS

// Funzione di utilità per gestire la risposta dalle chiamate API
function handleResponse(
  res: AxiosResponse<any, any>
) {
  if (res.status !== 200) {
    throw 'Errore grafana'
  } else {
    return res.data;
  }
}
