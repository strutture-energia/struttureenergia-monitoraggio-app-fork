import React, { Dispatch, SetStateAction, useContext } from 'react';
import { TreeItem, removeNodeAtPath } from 'react-sortable-tree';
import { Device, Period } from '../types/devices';
import { DevicesContext } from '../providers/DevicesProvider/DevicesProvider';
import { brkRef, dateFormatting } from '../utils/common';
import { _createVerificationNodes, createNewTreeNode, createNewUnionNode, deleteCreatedDevice, getAllDevicesByPeriod, getAvailableDevices, isTreeValid, makeFluxAnalisis, moveAllNodeChildrenToList, setActualUnionNodeValues } from '../service/deviceService';
import { getPeriodFromLocalStorage, saveFluxAnalysisToLocalStorage, savePeriodToLocalStorage, saveTreeDataToLocalStorage } from '../service/localData';
/* import { MOCKED_DEVICES, MOCKED_DEVICES_1 } from '../constant/devices'; */
import { INVALID_TREE_DATA_ERROR } from 'constant/errors';
import { getTreeFromInflux, saveToPrintSankey, saveTreeOnInflux } from 'service/treeService';

interface IuseDevicesData {
  editing: boolean;
  devicesList: Device[];
  treeData: TreeItem[];
  fluxAnalisis: Array<Array<number | string>>;
  loadingDevices: boolean;
  loadingSaveConfig: boolean;
  /** chiamata quando vengono modificati dell'albero */
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
  setLoadingDevices: Dispatch<SetStateAction<boolean>>; 
  initData: () => Promise<void>;
  saveData: () => Promise<void>;
  currentPeriod: Period;
  onPeriodChange: (period: any, treeData: TreeItem[]) => Promise<void>;
  /** chiamata quando vengono spostati nodi dell'albero */
  onTreeDataChange: (newTreeData: TreeItem[]) => void;
  deleteDevice: (idDevice: string) => Promise<void>;
}

export default function useDevicesData(): IuseDevicesData {

  const { 
    editing,
    treeData,
    devicesList, 
    fluxAnalisis,
    currentPeriod,
    loadingDevices,
    loadingSaveConfig,
    setCurrentPeriod,
    updateDevicesList,
    updateFluxAnalisis,
    setLoadingDevices,
    setLoadingSaveConfig,
    updateTreeData,
    setEditing,
  } = useContext(DevicesContext);

  const updateSankeyFrame = React.useCallback(()=>{
    setLoadingSaveConfig(true);
    setInterval(()=>{
      setLoadingSaveConfig(false);
    }, 10);
  }, [setLoadingSaveConfig]);

  //TODO: per non usare l'index dell'array, capire se è il caso di gestire una proprietà che identifica il device
  const moveToTree = React.useCallback((
    deviceIndex: number,
  ) => {
    const newTreeData: TreeItem[] = brkRef(treeData);
    const newDevicesList: Device[] = brkRef(devicesList);
    const deviceToBeMoved = newDevicesList.splice(deviceIndex, 1)[0];
    const treeNode = createNewTreeNode(deviceToBeMoved);
    newTreeData.push(treeNode); 
    setActualUnionNodeValues(newTreeData);
    _createVerificationNodes(newTreeData);
    saveToPrintSankey(newTreeData);
    updateDevicesList(newDevicesList);
    updateTreeData(newTreeData);
    updateSankeyFrame();
  }, [devicesList, treeData, updateDevicesList, updateTreeData, updateSankeyFrame]);

  const createUnionNode = React.useCallback((
    value: number
  ) => {
    const newTreeData: TreeItem[] = brkRef(treeData);
    const newUnionNode = createNewUnionNode(value);
    newTreeData.push(newUnionNode);
    updateTreeData(newTreeData);
    // non serve saveToPrintSankey perchè non comporta modifiche
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
    setActualUnionNodeValues(newTreeData);
    _createVerificationNodes(newTreeData);
    saveToPrintSankey(newTreeData);
    updateTreeData(newTreeData);
    updateDevicesList(newDevicesList);
    updateSankeyFrame();
  }, [treeData, devicesList, updateTreeData, updateDevicesList, updateSankeyFrame]);

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

  const saveData = React.useCallback(async () => {
    setLoadingSaveConfig(true);
    if (!isTreeValid(treeData)) {
      alert(INVALID_TREE_DATA_ERROR);
      return;
    }
    let newTreeData = brkRef(treeData) as TreeItem[];
    setActualUnionNodeValues(newTreeData);
    _createVerificationNodes(newTreeData);
    saveTreeDataToLocalStorage(newTreeData);
    savePeriodToLocalStorage(currentPeriod);
    updateTreeData(newTreeData);
    analyseFlux(newTreeData);
    console.log(newTreeData);
    await saveTreeOnInflux(newTreeData);
    setEditing(false);
    setLoadingSaveConfig(false);
  }, [treeData, currentPeriod, analyseFlux, setEditing, updateTreeData, setLoadingSaveConfig]);

  const _loadDevicesByPeriod = React.useCallback(async (
    _period: Period
  ): Promise<any[]> => {
    setLoadingDevices(true);
    let from = _period.from;
    //from.setHours(from.getHours()-35064);
    let to = _period.to;

    let isNow = dateFormatting(to, "YYYMMDD") === dateFormatting(new Date(), "YYYMMDD");
    to = isNow ? new Date() : new Date(to.setHours(23,59,0));

    const devicesByPeriod = await getAllDevicesByPeriod(from, to);
    setLoadingDevices(false);
    return devicesByPeriod;
  }, [setLoadingDevices]);

  // la prop _treeData serve solo in fase di inizializzazione
  // senza di questa per vedere la struttura dell'albero bisognarebbe aspettare la chiamata sincrona del fetch dei disposotivi
  // serve quindi per visualizzare la struttura dell'albero locale prima della risposta dei dispositivi, in seguito alla quale si ricostruisce l'albero apportando modifiche se necessarie
  const onPeriodChange = React.useCallback(async(
    period: Period,
    _treeData: TreeItem[]
  ): Promise<void> => {
    // 1. prendere periodo dal local storage
    // 2. getDevicesByPeriod col periodo preso dal local storage
    // 3. getAvailableDevices per ricostruzione dell'albero
    // 4. nuova analisi dei flussi (con nuova struttura albero con consumi aggiornati)
    //const devicesByPeriod = period === 1 ? MOCKED_DEVICES_1 : MOCKED_DEVICES;
    const devicesByPeriod = await _loadDevicesByPeriod(period);
    // l'albero, nonostante sia lo stesso a livello di struttura rispetto a quello precedentemente salvato, viene ricalcolato. Questo perchè 
    // i dispositivi che ritorna l'api potrebbero avere dei valori di consumo diversi. Di conseguenza se si usasse l'albero vecchio senza ricalcolo si 
    // vedrebbero gli stessi dispositivi con i valori di consumo vecchi (non aggiornati)
    const { devicesList, treeData: newTreeData } = getAvailableDevices(_treeData, devicesByPeriod);
    let newFluxAnalysis: Array<Array<number | string>> = [["From", "To", "Weight"]];
    makeFluxAnalisis(newTreeData, newFluxAnalysis);
    newFluxAnalysis = newFluxAnalysis.length === 1 ? [] : newFluxAnalysis;
    saveToPrintSankey(newTreeData);
    updateFluxAnalisis(newFluxAnalysis);
    updateDevicesList(devicesList);
    updateTreeData(newTreeData);
    setCurrentPeriod(period);
    updateSankeyFrame();
  }, [ 
    setCurrentPeriod, 
    updateDevicesList, 
    updateFluxAnalisis, 
    updateTreeData,
    _loadDevicesByPeriod,
    updateSankeyFrame
  ]);

  const initData = React.useCallback(async() => {
    const influxTree = await getTreeFromInflux();
    await saveToPrintSankey(influxTree);
    saveTreeDataToLocalStorage(influxTree);
    //TODO: A scopo di test period è considerato any, da tipizzare con data di inizio e fine periodo
    let period: Period | null = getPeriodFromLocalStorage();
    if (!period) {
      const startingFrom = new Date();
      const startingTo = new Date();
      startingFrom.setHours(startingFrom.getHours() - 35064);
      period = {from: startingFrom, to: startingTo};
    }
    await onPeriodChange(period, influxTree);
    //saveTreeDataToLocalStorage(influxTree);
  }, [onPeriodChange]);

  const onTreeDataChange = React.useCallback((
    newTreeData: TreeItem[],
  ) => {
    const _newTreeData: TreeItem[] = brkRef(newTreeData);
    setActualUnionNodeValues(_newTreeData);
    _createVerificationNodes(_newTreeData);
    saveToPrintSankey(_newTreeData);
    updateTreeData(_newTreeData);
    updateSankeyFrame();
  }, [updateTreeData, updateSankeyFrame]);

  const deleteDevice = React.useCallback(async (idDevice: string): Promise<void> => {
    await deleteCreatedDevice(idDevice);
    const newDevicesList: Device[] = brkRef(devicesList);
    const idx_device = newDevicesList.findIndex((device: Device)=> device.id === idDevice);

    if(idx_device !== -1) {
      newDevicesList.splice(idx_device, 1);
      updateDevicesList(newDevicesList);
    }
  }, [devicesList, updateDevicesList])

  return {
    treeData,
    devicesList,
    fluxAnalisis,
    currentPeriod,
    loadingDevices,
    loadingSaveConfig,
    editing,
    initData,
    moveToTree,
    createUnionNode,
    updateTreeData,
    onPeriodChange,
    updateDevicesList,
    updateFluxAnalisis,
    setLoadingDevices,
    onTreeDataChange,
    saveData,
    analyseFlux,
    moveToList,
    setEditing,
    deleteDevice
  }
}
