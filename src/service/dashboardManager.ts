import { DASHBOARDS_NAME, DiagnosiDashboardBlockLayout, DiagnosiDashboardConfig, DiagnosiPanelConfig, FLUX_ANALYSIS_DASHBOARD_FOLDER, diagnosiDashboardPanelConfiguration } from "constant/dashboards";
import { createDashboardAtFolder, createGrafanaFolder, getAllDashboards, getGrafanaFolders, updateDashboardAtFolder } from "./grafana";
import fluxAnalysisDashboard from '../dashboards/struttureenergia-monitoraggio-app/flux_analysis_dashboard.json';
import diagnosiDashboard from '../dashboards/struttureenergia-monitoraggio-app/diagnosi_energetica_dashboard.json';

export async function initGrafanaFolders() {
  try {
    const foldersRes = await getGrafanaFolders();
    const folders: any[] = foldersRes.data;
    const faIndex = folders.findIndex(el => el.title === FLUX_ANALYSIS_DASHBOARD_FOLDER);
    if (faIndex < 0) { // se la folder non esiste, creo una nuova dashboard
      const createFolderRes = await createGrafanaFolder(FLUX_ANALYSIS_DASHBOARD_FOLDER);
      const folderId: number = createFolderRes.id;
      await createDashboardAtFolder(folderId, fluxAnalysisDashboard);
      await createDashboardAtFolder(folderId, diagnosiDashboard);
    }
  } catch (error) {
    throw error;
  }
}

export async function uploadDiagnosiDashboard(
  db: any
) {
  const dashboardsRes: any[] = await getAllDashboards();
  const dbIndex = dashboardsRes.findIndex(el => el.title === 'Diagnosi');
  if (dbIndex < 0) {
    throw 'La dashboard non esiste'; // perchè non esiste la cartella dentro la quale dovrebbe essere
  }
  const dashboardData = dashboardsRes[dbIndex];
  const dbUid = dashboardData.uid;
  const dbId = dashboardData.id;
  const folderId = dashboardData.folderId;
  const newDashboard = { ...db, uid: dbUid, id: dbId };
  const res = await updateDashboardAtFolder(folderId, newDashboard);
  return res;
}

/* export function updateDiagnosiDashboard_(visibility: Array<string>) {
  const newConfig: DiagnosiDashboardConfig = {};
  let panelCounter = 0; // pannello corrispondende nell'array di visibilità
  let currentY = 0; // y corrente
  for (let b in diagnosiDashboardPanelConfiguration) {
    const blockName = b as 'b1' | 'b2' | 'b3';
    // identificazione del layout dei panel
    let blockLayout: 'horizontal' | 'vertical' | 'two-per-row';
    if (blockName === 'b1') {
      blockLayout = 'horizontal';
    } else if (blockName === 'b2') {
      blockLayout = 'vertical';
    } else {
      blockLayout = 'two-per-row';
    }
    const panelsConfig = diagnosiDashboardPanelConfiguration[blockName];
    const headerConfig = panelsConfig.find(pc => pc.isHeader);
    if (headerConfig) { // se è presente  la header (lo sarà sempre)
      let xOffset = 0;
      let newPanelsConfig: Array<DiagnosiPanelConfig> = [headerConfig];
      let yOffest = currentY + headerConfig.h;
      for (let panelConfig of panelsConfig) {
        console.log(blockName, visibility[panelCounter], currentY, headerConfig.h);
        if (!panelConfig.isHeader) {
          if (visibility[panelCounter] === '1') {
            const newPanelConfig: DiagnosiPanelConfig = { ...panelConfig, y: yOffest };
            if (blockLayout === 'horizontal') {
              newPanelConfig.x = xOffset;
              xOffset += panelConfig.w;
            } else if (blockLayout === 'vertical') {
              newPanelConfig.x = 0;
              yOffest += panelConfig.h;
            } else { // block layout two-per-row
              newPanelConfig.x = xOffset;
              xOffset += panelConfig.w;
              if (xOffset >= 24) {
                xOffset = 0;
                yOffest += panelConfig.h;
              }
            }
            newPanelsConfig.push(newPanelConfig);
          }
          panelCounter++;
        }
      }
      if (newPanelsConfig.length > 1 || true) { // maggiore di 1 perchè ci sarà sempre almeno al header
        newConfig[blockName] = newPanelsConfig;
        currentY = yOffest;
      }
    }
  }
  return newConfig;
} */

export function updateDiagnosiDashboard(
  configuration: DiagnosiDashboardConfig 
) {
  const newPanels = [];
  const newDb = { ...diagnosiDashboard };
  if (Object.keys(configuration).length > 0) {
    let flatConfiguration: Array<DiagnosiPanelConfig> = [];
    for (let block in configuration) {
      flatConfiguration.push(...configuration[block]);
    }
    for (let panel of diagnosiDashboard.panels) {
      const panelId = panel.id;
      const panelConfig = flatConfiguration.find(c => c.id === panelId);
      if (panelConfig) {
        const newPanel = {...panel};
        newPanel.gridPos = { h: panelConfig.h, w: panelConfig.w, x: panelConfig.x, y: panelConfig.y};
        newPanels.push(newPanel);
      }
    }
    newDb.panels = newPanels;
  } 
  return newDb;
}

export function getActualDiagnosiPanelsConfiguration(visibility: Array<string>) {
  let currentY = 0;
  let panelCounter = 0;
  const newConfig: DiagnosiDashboardConfig = {};
  for (let b in diagnosiDashboardPanelConfiguration) {
    let xOffset = 0;
    let yOffset = currentY;
    const blockName = b as 'b1' | 'b2' | 'b3';
    const newPanelsConfig: Array<DiagnosiPanelConfig> = [];
    const panelsConf = diagnosiDashboardPanelConfiguration[blockName];
    const blockLayout: DiagnosiDashboardBlockLayout = blockName !== 'b1'
      ? blockName === 'b2' ? 'vertical' : 'two-per-row'
      : 'horizontal';
    for (let panel of panelsConf) {
      if (panel.isHeader) {
        newPanelsConfig.push({ ...panel, y: yOffset });
        yOffset += panel.h;
      } else {
        if (visibility[panelCounter] === '1') {
          if (blockLayout === 'horizontal') {
            newPanelsConfig.push({ ...panel, x: xOffset, y: yOffset });
            xOffset += panel.w;
          } else if (blockLayout === 'vertical') {
            newPanelsConfig.push({ ...panel, y: yOffset });
            yOffset += panel.h;
          } else { // due per riga
            newPanelsConfig.push({ ...panel, x: xOffset, y: yOffset });
            xOffset += panel.w;
            if (xOffset >= 24) {
              xOffset = 0;
              yOffset += panel.h;
            }
          }
        }
        panelCounter++;
      }
    }
    if (newPanelsConfig.length > 1) {
      newConfig[blockName] = newPanelsConfig;
      if (blockName === 'b1') {
        yOffset += newPanelsConfig[1].h;
      }
      currentY = yOffset;
    }
  }
  return newConfig;
}

export async function getDashboardUrl(dashboardName: DASHBOARDS_NAME){
  const dashboardsRes: any[] = await getAllDashboards();
  const dbIndex = dashboardsRes.findIndex(el => el.title === dashboardName);
  const dashboardData = dashboardsRes[dbIndex];
  return dashboardData.url;
}
