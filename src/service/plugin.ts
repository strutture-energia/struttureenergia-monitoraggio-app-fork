import { DataSourceSettings, PluginMeta } from "@grafana/data";
import { getPluginConfig, savePluginConfig } from "./grafana";
import { brkRef } from "utils/common";

export type DatasourceCongifData = {
  name: string;
  serverAddress: string;
  orgName: string;
  token: string;
  id: number | string;
  uid: string;
}

export async function getPluginSelectedDatasource(): Promise<DatasourceCongifData> {
  const pluginConfig = await getPluginConfig();
  if (!pluginConfig) {
    throw 'Plugin Error';
  }
  const selectedDs = pluginConfig?.jsonData ?? null;
  return selectedDs;
}

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