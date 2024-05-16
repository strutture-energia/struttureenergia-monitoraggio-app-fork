import { TreeItem } from "react-sortable-tree";
import { FLUX_ANALYSIS, M_DEVICES, PERIOD, TREE_DATA } from "../constant/localStorage";
import { Device, Period } from "../types/devices";
import { createNewDevice } from "./deviceService";

export function saveTreeDataToLocalStorage(
  treeData: TreeItem[]
): void {
  localStorage.setItem(TREE_DATA, JSON.stringify(treeData || []));
}

export function getTreeDataFromLocalStorage(): TreeItem[] {
  const string_tree= localStorage.getItem(TREE_DATA);
  const treeData = JSON.parse(string_tree || '[]');
  return treeData;
}

export function saveFluxAnalysisToLocalStorage(
  fluxAnalysis: Array<Array<number | string>>
) {
  localStorage.setItem(FLUX_ANALYSIS, JSON.stringify(fluxAnalysis || []))
}

export function getFluxAnalysisFromLoacalStorage(): Array<Array<number | string>> {
  const string_fluxAnalysis = localStorage.getItem(FLUX_ANALYSIS);
  const fluxAnalysis = JSON.parse(string_fluxAnalysis || '[]');
  return fluxAnalysis;
}

//TODO: A scopo di test period è considerato any, da tipizzare con data di inizio e fine periodo
export function savePeriodToLocalStorage(
  period: Period
): void {
  const string_period = JSON.stringify(period);
  localStorage.setItem(PERIOD, string_period);
}

export function getPeriodFromLocalStorage(): Period | null {
  const string_period = localStorage.getItem(PERIOD);
  const period: Period | null = string_period ? JSON.parse(string_period) : null;
  if (period) {
    period.from = new Date(period.from);
    period.to = new Date(period.to);
  }
  return period;
}

export function getAllDevicesFromLocalStorage(): { [key: string]: Device } {
  const string_devices: string | null = localStorage.getItem(M_DEVICES);
  if (!string_devices) {
    return {};
  }
  return JSON.parse(string_devices);
}

export function saveDeviceToLocalStorage(
  treeNode: TreeItem
): void {
  let m_devices = getAllDevicesFromLocalStorage();
  const device = createNewDevice(treeNode);
  m_devices[device.id] = device;
  localStorage.setItem(M_DEVICES, JSON.stringify(m_devices || {}));
}
