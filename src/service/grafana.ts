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

export async function testGrafana() {
  //return axios.post('./api/folders', {title: Date.now().toString()}, reqOptions);
}

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
  console.log('uploading db', dashboard);
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

function handleResponse(
  res: AxiosResponse<any, any>
) {
  if (res.status !== 200) {
    throw 'Errore grafana'
  } else {
    return res.data;
  }
}
