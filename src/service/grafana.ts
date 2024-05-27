import axios, { AxiosResponse } from "axios";

const DASHBOARD_UID = "JZzG46Enz";
const reqOptions = {
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
  }
}

export async function getDashboardFolderUid(): Promise<any> {
  const res = await axios.get(`http://localhost:3000/api/dashboards/uid/${DASHBOARD_UID}`, reqOptions);
  if (res?.data?.meta) {
    return {fId: res.data.meta.folderId, fUid: res.data.meta.folderUid};
  } else {
    return {fId: null, fUid: null};
  }
}

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

export async function getGrafanaFolders() {
  return axios.get('./api/folders', reqOptions);
}

export async function createDashboardAtFolder(
  folderId: number,
  dashboard: any,
) {
  const data = { dashboard: { ...dashboard, id: null, uid: null}, folderId, overwrite: true };
  const res = await axios.post('./api/dashboards/db', data, reqOptions);
  return handleResponse(res);
}

export async function updateDashboardAtFolder(
  folderId: number,
  dashboard: any
) {
  const data = { dashboard, folderId, overwrite: true};
  const res = await axios.post('./api/dashboards/db', data, reqOptions);
  return handleResponse(res);
}

export async function createGrafanaFolder(
  name: string
) {
  const res = await axios.post('./api/folders', {title: name}, reqOptions);
  return handleResponse(res);
}

export async function getAllDashboards() {
  const res = await axios.get('./api/search?query=&type=dash-db', reqOptions);
  return handleResponse(res);
}

export async function savePluginConfig() {
  const res = await axios.post('./api/plugins/struttureenergia-monitoraggio-app/settings', {
    name: 'Plugin configuration',
    type: 'plugin',
    enabled: true,
    jsonData: {
      datasourceId: 2,
    }
  }, reqOptions);
  console.log('plugin config res', res);
}

export async function getPluginConfig() {
  const res = await axios.get('./api/plugins/struttureenergia-monitoraggio-app/settings', reqOptions);
  console.log('plugin res', res);
}

function handleResponse(
  res: AxiosResponse<any, any>
) {
  if (res.status !== 200) {
    throw 'Errore grafana'
  } else {
    return res.data;
  }
}
