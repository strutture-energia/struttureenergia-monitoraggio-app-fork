import { PluginMeta } from "@grafana/data";
import { getPluginConfig, savePluginConfig } from "./grafana";
import { brkRef } from "utils/common";

// Definizione del tipo per la configurazione del datasource
export type DatasourceCongifData = {
  name: string;
  serverAddress: string;
  orgName: string;
  token: string;
  id: number | string;
  uid: string;
}

// Funzioni di gestione della configurazione del plugin

// Ottiene il datasource selezionato dal plugin
export async function getPluginSelectedDatasource(): Promise<DatasourceCongifData> {
  const pluginConfig = await getPluginConfig();
  if (!pluginConfig) {
    throw 'Plugin Error';
  }
  const selectedDs = pluginConfig?.jsonData?.datasources?.selectedDatasource ?? null;
  return selectedDs;
}

// Imposta il datasource selezionato per il plugin
export async function setPluginSelectedDatasource(
  datasourceId: number | string,
) {
  const pluginConfig = await getPluginConfig();
  if (!pluginConfig) {
    throw 'Plugin Error';
  }
  const datasources = pluginConfig?.jsonData?.datasources ?? {};
  const targetDs = datasources[datasourceId];
  if (!targetDs) {
    throw 'Specified datasource does not exist';
  }
  const newJsonData = brkRef(pluginConfig.jsonData);
  newJsonData.datasources.selectedDatasource = targetDs;
  await savePluginConfig(newJsonData);
}

// Rimuove il datasource selezionato per il plugin
export async function removePluginSelectedDatasource() {
  const pluginConfig = await getPluginConfig();
  if (!pluginConfig) {
    throw 'Plugin Error';
  }
  const newJsonData = brkRef(pluginConfig.jsonData);
  newJsonData.datasources.selectedDatasource = null;
  await savePluginConfig(newJsonData);
}

// Aggiunge una nuova configurazione del datasource al plugin
export async function addPluginDatasourceConfig(
  datasourceConfig: DatasourceCongifData
) {
  const pluginConfig: PluginMeta = await getPluginConfig();
  if (!pluginConfig) {
    throw 'Plugin Error';
  }
  const newDsID = datasourceConfig.id;
  if (!pluginConfig) {
    throw 'Invalid plugin'
  }
  const newJsonData = pluginConfig.jsonData
    ? brkRef(pluginConfig.jsonData)
    : {};
  if (!newJsonData.datasources) {
    newJsonData.datasources = {};
  }
  newJsonData.datasources[newDsID] = datasourceConfig;
  await savePluginConfig(newJsonData);
}

// Elimina una configurazione del datasource dal plugin
export async function deletePluginDatasourceConfig(
  datasourceId: number | string
) {
  const pluginConfig = await getPluginConfig();
  if (!pluginConfig) {
    throw 'Plugin Error';
  }
  const datasources = pluginConfig?.jsonData?.datasources ?? {};
  if (!datasources || !datasources[datasourceId]) {
    return;
  }
  const newJsonData = brkRef(pluginConfig.jsonData);
  delete newJsonData.datasources[datasourceId];
  await savePluginConfig(newJsonData);
}

//Funzione per salvare la configurazione token e host
export async function savePluginIPConfig(token: string, hostname: string) {
  const pluginConfig = await getPluginConfig();
  if (!pluginConfig) {
    throw 'Plugin Error';
  }

  // Copia i dati esistenti per evitare mutazioni indesiderate
  const newJsonData = { ...pluginConfig.jsonData };

  // Aggiungi o aggiorna il token e l'host
  newJsonData.token = token;
  newJsonData.hostname = hostname;

  // Salva le nuove impostazioni
  await savePluginConfig(newJsonData);
}

//Funzione per prendere la configuraizone token e host
export async function getPluginIPConfig() {
  const pluginConfig = await getPluginConfig();
  if (!pluginConfig) {
    throw 'Plugin Error';
  }

  // Recupera il token e l'host dal JSON delle impostazioni
  const token = pluginConfig.jsonData?.token || null;
  const hostname = pluginConfig.jsonData?.hostname || null;

  // Restituisci un oggetto con i valori recuperati (anche se nulli)
  return { token, hostname };
}
