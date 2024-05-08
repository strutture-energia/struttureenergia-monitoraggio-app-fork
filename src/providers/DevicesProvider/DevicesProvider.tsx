import React, { Dispatch, PropsWithChildren, SetStateAction } from 'react';
import { TreeItem } from 'react-sortable-tree';
import { Device } from '../../types/devices';

interface ContextInterface extends PropsWithChildren {}

//TODO: A scopo di test period è considerato any, da tipizzare con data di inizio e fine periodo
export type DevicesProviderState = {
  treeData: TreeItem[];
  devicesList: Device[];
  fluxAnalisis: Array<Array<number | string>>;
  editing: boolean;
  currentPeriod: any;
  loadingDevices: boolean;
  updateTreeData: Dispatch<SetStateAction<TreeItem[]>>;
  updateDevicesList: Dispatch<SetStateAction<Device[]>>;
  updateFluxAnalisis: Dispatch<SetStateAction<Array<Array<number | string>>>>;
  setEditing: Dispatch<SetStateAction<boolean>>;
  setCurrentPeriod: Dispatch<SetStateAction<any>>;
  setLoadingDevices: Dispatch<SetStateAction<boolean>>;
}

const initialState: DevicesProviderState = {
  treeData: [],
  devicesList: [],
  currentPeriod: 0,
  loadingDevices: false,
  fluxAnalisis: [],
  editing: false,
  setEditing: () => {},
  updateDevicesList: () => {},
  updateFluxAnalisis: () => {},
  updateTreeData: () => {},
  setCurrentPeriod: () => {},
  setLoadingDevices: () => {},
}

export const DevicesContext = React.createContext(initialState);

export default function DevicesProvider({children}: ContextInterface) {

  const [treeData, setTreeData] = React.useState<TreeItem[]>(initialState.treeData);
  const [devicesList, setDevicesList] = React.useState<Device[]>(initialState.devicesList);
  const [fluxAnalisis, setFluxAnalisis] = React.useState<Array<Array<number | string>>>(initialState.fluxAnalisis);
  //TODO: A scopo di test period è considerato any, da tipizzare con data di inizio e fine periodo
  const [currentPeriod, setCurrentPeriod] = React.useState<any>(initialState.currentPeriod); 
  const [loadingDevices, setLoadingDevices] = React.useState<boolean>(initialState.loadingDevices);
  const [editing, setEditing] = React.useState<boolean>(false);

  const value = React.useMemo((): DevicesProviderState => {
    return { 
      editing,
      treeData, 
      devicesList, 
      fluxAnalisis,
      currentPeriod,
      loadingDevices,
      setCurrentPeriod,
      updateDevicesList: setDevicesList,
      updateFluxAnalisis: setFluxAnalisis, 
      updateTreeData: setTreeData, 
      setLoadingDevices,
      setEditing,
    }
  }, [
    treeData, 
    devicesList, 
    fluxAnalisis, 
    currentPeriod,
    loadingDevices,
    editing
  ])

  return (
    <DevicesContext.Provider value={value}>
      {children}
    </DevicesContext.Provider>
  )
}
