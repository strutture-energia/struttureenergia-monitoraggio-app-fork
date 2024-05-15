import { createDashboardAtFolder, createGrafanaFolder, getGrafanaFolders, updateDashboardAtFolder } from "./grafana";
import fluxAnalysisDashboard from '../dashboards/struttureenergia-monitoraggio-app/flux_analysis_dashboard.json';
import { FLUX_ANALYSIS_DASHBOARD_FOLDER } from "constant/dashboards";
import { brkRef } from "utils/common";

export async function iniGrafanaFolders() {
  try {
    const db = {
      ...fluxAnalysisDashboard,
      id: 12,
      uid: 'ade73e9b-1985-4610-8ba2-01ad758bd203',
    }
    const res = await updateDashboardAtFolder(11, db);
    console.log('res', res);
    return;
    const foldersRes = await getGrafanaFolders();
    const folders: any[] = foldersRes.data;
    console.log(folders);
    const faIndex = folders.findIndex(el => el.title === FLUX_ANALYSIS_DASHBOARD_FOLDER);
    if (faIndex < 0) {
      const createFolderRes = await createGrafanaFolder(FLUX_ANALYSIS_DASHBOARD_FOLDER);
      const folderId: number = createFolderRes.id;
      const createDbRes = await createDashboardAtFolder(folderId, fluxAnalysisDashboard);
      console.log({createDbRes});
    }
  } catch (error) {
    throw error;
  }
}

// 1. leggere tutte le folder
// 2. controllare se esiste quella con il nome della fa
// 3. leggere le ldashboard al suo interno, se non esiste una dashboard -> errore
// 4. leggere l'id e uid della dashboard al suo interno
// 5. integrare l'id e l'uid ai dati della dashboard salvata nel progetto
// 6. aggiornare la db con questi nuovi dati
export async function updateFluxAnalysisGrafanaDashboard(
  dashboard: any,
  dId?: number,
  dUid?: number,
) {
  let db = brkRef(dashboard);
  if (dId) {
    db = { ...db, id: dId};
  }
  if (dUid) {
    db = { ...db, uid: dUid}
  }
  const foldersRes = await getGrafanaFolders();
  const folders: any[] = foldersRes.data;
  const faIndex = folders.findIndex(el => el.title === FLUX_ANALYSIS_DASHBOARD_FOLDER);
  const faFolderData = folders[faIndex];
  const folderId = faFolderData.id;
  if (faIndex > 0) {
    //await updateDashboardAtFolder()
  }
}