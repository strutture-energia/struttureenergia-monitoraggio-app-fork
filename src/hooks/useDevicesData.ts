import React, { Dispatch, SetStateAction, useContext } from 'react';
import { TreeItem, removeNodeAtPath } from 'react-sortable-tree';
import { Device } from '../types/devices';
import { DevicesContext } from '../providers/DevicesProvider/DevicesProvider';
import { brkRef } from '../utils/common';
import { _createVerificationNodes, createNewTreeNode, createNewUnionNode, getAvailableDevices, isTreeValid, makeFluxAnalisis, moveAllNodeChildrenToList, setActualUnionNodeValues } from '../service/deviceService';
import { getFluxAnalysisFromLoacalStorage, getPeriodFromLocalStorage, getTreeDataFromLocalStorage, saveFluxAnalysisToLocalStorage, savePeriodToLocalStorage, saveTreeDataToLocalStorage } from '../service/localData';
import { MOCKED_DEVICES, MOCKED_DEVICES_1 } from '../constant/devices';
import { INVALID_TREE_DATA_ERROR } from 'constant/errors';

interface IuseDevicesData {
  editing: boolean;
  devicesList: Device[];
  treeData: TreeItem[];
  fluxAnalisis: Array<Array<number | string>>;
  updateTreeData: Dispatch<SetStateAction<TreeItem[]>>;
  updateDevicesList: Dispatch<SetStateAction<Device[]>>;
  updateFluxAnalisis: Dispatch<SetStateAction<Array<Array<number | string>>>>;
  moveToTree: (
    deviceIndex: number
  ) => void;
  createUnionNode: (
    value: number
  ) => void;
  moveToList: (
    treeNode: TreeItem,
    path: Array<number | string>,
    getNodeKeyCallBack: ({ treeIndex }: any) => any
  ) => void,
  analyseFlux: (
    treeData?: TreeItem[]
    //getNodeKeyCallBack: ({ treeIndex }: any) => any
  ) => void,
  setEditing: Dispatch<SetStateAction<boolean>>;
  initData: () => void;
  saveData: () => void;
  //TODO: A scopo di test period è considerato any, da tipizzare con data di inizio e fine periodo
  currentPeriod: any;
  onPeriodChange: (period: any) => void;
}

export default function useDevicesData(): IuseDevicesData {

  const { 
    editing,
    treeData,
    devicesList, 
    fluxAnalisis,
    currentPeriod,
    setCurrentPeriod,
    updateDevicesList,
    updateFluxAnalisis,
    updateTreeData,
    setEditing,
  } = useContext(DevicesContext);

  //TODO: per non usare l'index dell'array, capire se è il caso di gestire una proprità che identifica il device
  const moveToTree = React.useCallback((
    deviceIndex: number,
  ) => {
    const newTreeData: TreeItem[] = brkRef(treeData);
    const newDevicesList: Device[] = brkRef(devicesList);
    const deviceToBeMoved = newDevicesList.splice(deviceIndex, 1)[0];
    const treeNode = createNewTreeNode(deviceToBeMoved);
    newTreeData.push(treeNode); 
    updateDevicesList(newDevicesList);
    updateTreeData(newTreeData);
  }, [devicesList, treeData, updateDevicesList, updateTreeData]);

  const createUnionNode = React.useCallback((
    value: number
  ) => {
    const newTreeData: TreeItem[] = brkRef(treeData);
    const newUnionNode = createNewUnionNode(value);
    newTreeData.push(newUnionNode);
    updateTreeData(newTreeData);
  }, [treeData, updateTreeData])

  const moveToList = React.useCallback((
    treeNode: TreeItem,
    path: Array<number | string>,
    getNodeKeyCallBack: ({ treeIndex }: any) => any
  ) => {
    let newDevicesList: Device[] = brkRef(devicesList);
    moveAllNodeChildrenToList([treeNode], newDevicesList);
    const newTreeData = removeNodeAtPath({
      getNodeKey: getNodeKeyCallBack,
      treeData: treeData, 
      path: path, 
    });
    updateTreeData(newTreeData);
    updateDevicesList(newDevicesList);
  }, [treeData, devicesList, updateTreeData, updateDevicesList]);

  const analyseFlux = React.useCallback((
    _treeData?: TreeItem[]
  ) => {
    // creazione dei nodi differenza nell'albero
    // creazione analisi dei flussi per costruzione grafico sankey
    const a_treeData = _treeData || treeData;
    let newFlux = [["From", "To", "Weight"]];
    makeFluxAnalisis(a_treeData, newFlux);
    newFlux = newFlux.length === 1 ? [] : newFlux;
    saveFluxAnalysisToLocalStorage(newFlux);
    updateFluxAnalisis(newFlux);
    console.log('new flux', newFlux);
  }, [treeData, updateFluxAnalisis]);

  const initData = React.useCallback(() => {
    //const devicesByPeriod: Device[] = MOCKED_DEVICES;
    const localTreeData: TreeItem[] = getTreeDataFromLocalStorage();
    const localFluxAnalisis: Array<Array<number | string>> = getFluxAnalysisFromLoacalStorage();
    //TODO: A scopo di test period è considerato any, da tipizzare con data di inizio e fine periodo
    const period: any = getPeriodFromLocalStorage();
    //const { devicesList, treeData } = getAvailableDevices(localTreeData, devicesByPeriod);
    updateFluxAnalisis(localFluxAnalisis);
    //updateDevicesList(devicesList);
    updateTreeData(localTreeData);
    setCurrentPeriod(period);
  }, [setCurrentPeriod, updateFluxAnalisis, updateTreeData]);

  const saveData = React.useCallback(() => {
    if (!isTreeValid(treeData)) {
      alert(INVALID_TREE_DATA_ERROR)
      return;
    }
    let newTreeData = brkRef(treeData) as TreeItem[];
    setActualUnionNodeValues(newTreeData);
    _createVerificationNodes(newTreeData);
    saveTreeDataToLocalStorage(newTreeData);
    savePeriodToLocalStorage(currentPeriod);
    updateTreeData(newTreeData);
    analyseFlux(newTreeData);
    setEditing(false);
  }, [treeData, currentPeriod, analyseFlux, setEditing, updateTreeData]);

  //TODO: A scopo di test period è considerato any, da tipizzare con data di inizio e fine periodo
  const onPeriodChange = React.useCallback((
    period: any
  ): void => {
    // 1. prendere periodo dal local storage
    // 2. getDevicesByPeriod col periodo preso dal local storage
    // 3. getAvailableDevices per ricostruzione dell'albero
    // 4. nuova analisi dei flussi (con nuova struttura albero con consumi aggiornati)
    const devicesByPeriod = period === 1 ? MOCKED_DEVICES_1 : MOCKED_DEVICES;
    // l'albero, nonostante sia lo stesso a livello di struttura rispetto a quello precedentemente salvato, viene ricalcolato. Questo perchè 
    // i dispositivi che ritorna l'api potrebbero avere dei valori di consumo diversi. Di conseguenza se si usasse l'albero vecchio senza ricalcolo si 
    // vedrebbero gli stessi dispositivi con i valori di consumo vecchi (non aggiornati)
    const { devicesList, treeData: newTreeData } = getAvailableDevices(treeData, devicesByPeriod);
    let newFluxAnalysis: Array<Array<number | string>> = [["From", "To", "Weight"]];
    makeFluxAnalisis(newTreeData, newFluxAnalysis);
    newFluxAnalysis = newFluxAnalysis.length === 1 ? [] : newFluxAnalysis;
    updateFluxAnalisis(newFluxAnalysis);
    updateDevicesList(devicesList);
    updateTreeData(newTreeData);
    setCurrentPeriod(period);
  }, [treeData, setCurrentPeriod, updateDevicesList, updateFluxAnalisis, updateTreeData]);

  return {
    treeData,
    devicesList,
    fluxAnalisis,
    currentPeriod,
    editing,
    initData,
    moveToTree,
    createUnionNode,
    updateTreeData,
    onPeriodChange,
    updateDevicesList,
    updateFluxAnalisis,
    saveData,
    analyseFlux,
    moveToList,
    setEditing
  }
}
