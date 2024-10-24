import { DASHBOARDS_NAME, DIAGNOSI_DASHBOARD, DiagnosiDashboardBlockLayout, DiagnosiDashboardConfig, DiagnosiPanelConfig, FLUX_ANALYSIS_DASHBOARD_FOLDER, SANKEY_DASHBOARD, diagnosiDashboardPanelConfiguration } from "constant/dashboards";
import { createDashboardAtFolder, createGrafanaFolder, getAllDashboards, getGrafanaFolders, updateDashboardAtFolder } from "./grafana";
import fluxAnalysisDashboard from '../dashboards/struttureenergia-monitoraggio-app/flux_analysis_dashboard.json';
import diagnosiDashboard from '../dashboards/struttureenergia-monitoraggio-app/diagnosi_energetica_dashboard.json';
import { getPluginSelectedDatasource } from "./plugin";
import { brkRef } from "utils/common";

// Inizializza la cartella di Grafana e crea le dashboard necessarie se non esistono
export async function initGrafanaFoldersAndDashboards() {
  try {
    // Ottiene tutte le cartelle di Grafana esistenti
    const foldersRes = await getGrafanaFolders();
    const folders: any[] = foldersRes.data;
    // Cerca l'indice della cartella specifica per l'analisi del flusso
    const faIndex = folders.findIndex(el => el.title === FLUX_ANALYSIS_DASHBOARD_FOLDER);
    //faIndex = 0 --> folder trovata ; faIndex = -1 --> folder non trovata
    if (faIndex < 0) {
      //Creo una nuova folder
      const createFolderRes = await createGrafanaFolder(FLUX_ANALYSIS_DASHBOARD_FOLDER);
      //Estrapolo l'id della folder
      const folderId: number = createFolderRes.id;

      //Creo le dashboard che mi servono
      //Ottengo il JSON della dashboard con il la datasource corretta
      const actualFluxAnalysisDashboard = await replaceDashboardDatasource(fluxAnalysisDashboard);
      const actualDiagnosiDashboard = await replaceDashboardDatasource(diagnosiDashboard);
      // Crea le dashboard all'interno della cartella
      await createDashboardAtFolder(folderId, actualFluxAnalysisDashboard);
      await createDashboardAtFolder(folderId, actualDiagnosiDashboard);
    }
  } catch (error) {
    throw error;
  }
}

// Funzione prova andrea
export async function updateSankeyDashboard() {
  // Ottiene tutte le cartelle di Grafana esistenti
  const foldersRes = await getGrafanaFolders();
  const folders: any[] = foldersRes.data;
  
  // Cerca l'indice della cartella specifica per l'analisi del flusso
  const faIndex = folders.findIndex(el => el.title === FLUX_ANALYSIS_DASHBOARD_FOLDER);
  
  // Verifica che la cartella esista
  if (faIndex > -1) {
    // Ottieni tutte le dashboard
    const dashboardsRes: any[] = await getAllDashboards();
    
    // Cerca l'indice della dashboard da aggiornare
    const dbIndex = dashboardsRes.findIndex(el => el.title === SANKEY_DASHBOARD);
    if (dbIndex < 0) {
      throw 'La dashboard non esiste';
    }
    
    // Ottieni i dettagli della dashboard trovata
    const dashboardData = dashboardsRes[dbIndex];
    const dbUid = dashboardData.uid;
    const dbId = dashboardData.id;
    const folderId = folders[faIndex].id; // Usa l'ID della cartella trovata
    
    // Ottieni il JSON della dashboard con la datasource corretta
    const actualFluxAnalysisDashboard = await replaceDashboardDatasource(fluxAnalysisDashboard);
    
    // Crea la dashboard aggiornata con i nuovi dettagli
    const newDashboard = { ...actualFluxAnalysisDashboard, uid: dbUid, id: dbId };
    
    // Aggiorna la dashboard nella cartella specificata
    const res = await updateDashboardAtFolder(folderId, newDashboard);
    console.log("Dashboard aggiornata con successo:", res);
  }
}



//Utility per sostituire la datasource della dashboard selezionata con quella attualmente selezionata
export async function replaceDashboardDatasource(
  db: typeof diagnosiDashboard | typeof fluxAnalysisDashboard
) {
  //Prendo la datasource corretta
  const selectedDs = await getPluginSelectedDatasource();
  //Estrapolo l'id
  const dsUid = selectedDs.uid;
  //JSON stringify del json
  const newDashboard = brkRef(db);
  //Se ci sono pannelli nella dashboard (tipo il sankey)
  if (newDashboard?.panels) {
    //Per ogni pannello   
    for (let p of newDashboard?.panels) {
      //Se il tipo del datasource è di tipo influxdb
      if (p?.datasource?.type === 'influxdb') {
        //Allora metto come datasource del pannello, quella attualmente selezionata
        p.datasource.uid = dsUid;
      }
    }
  } 
  // Sostituisce la datasource nelle variabili di templating della dashboard
  if (newDashboard?.templating?.list) {
    for (let t of newDashboard.templating.list) {
      console.log(t);
      if (t?.datasource?.type === 'influxdb') {
        t.datasource.uid = dsUid;
      }
    }
  }
  return newDashboard;
}

// Carica la dashboard di diagnosi all'interno della cartella specificata
export async function uploadDiagnosiDashboard(
  db: any
) {
  const dashboardsRes: any[] = await getAllDashboards();
  // Cerca l'indice della dashboard di diagnosi
  const dbIndex = dashboardsRes.findIndex(el => el.title === DIAGNOSI_DASHBOARD);
  if (dbIndex < 0) {
    throw 'La dashboard non esiste'; // perchè non esiste la cartella dentro la quale dovrebbe essere
  }
  // Ottiene i dettagli della dashboard trovata
  const dashboardData = dashboardsRes[dbIndex];
  const dbUid = dashboardData.uid;
  const dbId = dashboardData.id;
  const folderId = dashboardData.folderId;
  const newDashboard = { ...db, uid: dbUid, id: dbId };
  // Aggiorna la dashboard nella cartella specificata
  const res = await updateDashboardAtFolder(folderId, newDashboard);
  return res;
}

// Funzione per aggiornare la configurazione della dashboard di diagnosi basata sulla visibilità dei pannelli
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

// Aggiorna i pannelli della dashboard di diagnosi basati sulla configurazione fornita
export function updateDiagnosiDashboard(
  configuration: DiagnosiDashboardConfig,
  actualDashboard: any
) {
  const newPanels = [];
  const newDb = { ...actualDashboard };
  if (Object.keys(configuration).length > 0) {
    let flatConfiguration: DiagnosiPanelConfig[] = [];
    for (let block in configuration) {
      flatConfiguration.push(...configuration[block]);
    }
    // Verifica e aggiorna la configurazione dei pannelli con i dati forniti
    for (let panel of actualDashboard.panels) {
      const panelId = panel.id;
      const panelConfig = flatConfiguration.find(c => c.id === panelId);
      if (panelConfig) {
        const newPanel = {...panel};
        newPanel.gridPos = { h: panelConfig.h, w: panelConfig.w, x: panelConfig.x, y: panelConfig.y};
        newPanels.push(newPanel);
      }
    }
    newDb.panels = newPanels;
  } else {
    newDb.panels = [];
  }
  return newDb;
}

// Genera la configurazione attuale dei pannelli della dashboard di diagnosi in base alla visibilità
export function getActualDiagnosiPanelsConfiguration(visibility: string[]) {
  let currentY = 0;
  let panelCounter = 0;
  const newConfig: DiagnosiDashboardConfig = {};
  for (let b in diagnosiDashboardPanelConfiguration) {
    let xOffset = 0;
    let yOffset = currentY;
    const blockName = b as 'b1' | 'b2' | 'b3';
    const newPanelsConfig: DiagnosiPanelConfig[] = [];
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

// Ottiene l'URL della dashboard specificata
export async function getDashboardUrl(dashboardName: DASHBOARDS_NAME){
  const dashboardsRes: any[] = await getAllDashboards();
  const dbIndex = dashboardsRes.findIndex(el => el.title === dashboardName);
  const dashboardData = dashboardsRes[dbIndex];
  return dashboardData.url;
}
