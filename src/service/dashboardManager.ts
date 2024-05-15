import { FLUX_ANALYSIS_DASHBOARD_FOLDER } from "constant/dashboards";
import { createDashboardAtFolder, createGrafanaFolder, getAllDashboards, getGrafanaFolders, updateDashboardAtFolder } from "./grafana";
import fluxAnalysisDashboard from '../dashboards/struttureenergia-monitoraggio-app/flux_analysis_dashboard.json';

export async function initGrafanaFolders() {
  try {
    const foldersRes = await getGrafanaFolders();
    const folders: any[] = foldersRes.data;
    console.log(folders);
    const faIndex = folders.findIndex(el => el.title === FLUX_ANALYSIS_DASHBOARD_FOLDER);
    if (faIndex < 0) { // se la folder non esiste, creo una nuova dashboard
      const createFolderRes = await createGrafanaFolder(FLUX_ANALYSIS_DASHBOARD_FOLDER);
      const folderId: number = createFolderRes.id;
      await createDashboardAtFolder(folderId, fluxAnalysisDashboard);
    }
  } catch (error) {
    throw error;
  }
}

export async function updateFluxAnalysisGrafanaDashboard() {
  const dashboardsRes: any[] = await getAllDashboards();
  const dbIndex = dashboardsRes.findIndex(el => el.folderTitle === FLUX_ANALYSIS_DASHBOARD_FOLDER);
  if (dbIndex < 0) {
    throw 'La dashboard non esiste'; // perchè non esiste la cartella dentro la quale dovrebbe essere
  }
  const dashboardData = dashboardsRes[dbIndex];
  const dbUid = dashboardData.uid;
  const dbId = dashboardData.id;
  const folderId = dashboardData.folderId;
  const newDashboard = { ...fluxAnalysisDashboard, uid: dbUid, id: dbId };
  await updateDashboardAtFolder(folderId, newDashboard);
}
