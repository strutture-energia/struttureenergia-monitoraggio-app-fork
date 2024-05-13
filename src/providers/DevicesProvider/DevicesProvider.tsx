import React, { Dispatch, PropsWithChildren, SetStateAction } from 'react';
import { TreeItem } from 'react-sortable-tree';
import { Device, Period } from '../../types/devices';

interface ContextInterface extends PropsWithChildren {}

//TODO: A scopo di test period è considerato any, da tipizzare con data di inizio e fine periodo
export type DevicesProviderState = {
  treeData: TreeItem[];
  devicesList: Device[];
  fluxAnalisis: Array<Array<number | string>>;
  editing: boolean;
  currentPeriod: Period;
  loadingDevices: boolean;
  loadingSaveConfig: boolean;
  updateTreeData: Dispatch<SetStateAction<TreeItem[]>>;
  updateDevicesList: Dispatch<SetStateAction<Device[]>>;
  updateFluxAnalisis: Dispatch<SetStateAction<Array<Array<number | string>>>>;
  setEditing: Dispatch<SetStateAction<boolean>>;
  setCurrentPeriod: Dispatch<SetStateAction<any>>;
  setLoadingDevices: Dispatch<SetStateAction<boolean>>;
  setLoadingSaveConfig: Dispatch<SetStateAction<boolean>>;
}

const startingFrom = new Date();
const startingTo = new Date();
startingFrom.setHours(startingFrom.getHours() - 35064);

const initialState: DevicesProviderState = {
  treeData: [],
  devicesList: [],
  currentPeriod: { from: startingFrom, to: startingTo },
  loadingDevices: false,
  loadingSaveConfig: false,
  fluxAnalisis: [],
  editing: false,
  setEditing: () => {},
  updateDevicesList: () => {},
  updateFluxAnalisis: () => {},
  updateTreeData: () => {},
  setCurrentPeriod: () => {},
  setLoadingDevices: () => {},
  setLoadingSaveConfig: () => {}
}

export const DevicesContext = React.createContext(initialState);

export default function DevicesProvider({children}: ContextInterface) {

  const [treeData, setTreeData] = React.useState<TreeItem[]>(initialState.treeData);
  const [devicesList, setDevicesList] = React.useState<Device[]>(initialState.devicesList);
  const [fluxAnalisis, setFluxAnalisis] = React.useState<Array<Array<number | string>>>(initialState.fluxAnalisis);
  const [currentPeriod, setCurrentPeriod] = React.useState<Period>(initialState.currentPeriod); 
  const [loadingDevices, setLoadingDevices] = React.useState<boolean>(initialState.loadingDevices);
  const [loadingSaveConfig, setLoadingSaveConfig] = React.useState<boolean>(initialState.loadingSaveConfig);
  const [editing, setEditing] = React.useState<boolean>(false);

  const value = React.useMemo((): DevicesProviderState => {
    return { 
      editing,
      treeData, 
      devicesList, 
      fluxAnalisis,
      currentPeriod,
      loadingSaveConfig,
      loadingDevices,
      setCurrentPeriod,
      updateDevicesList: setDevicesList,
      updateFluxAnalisis: setFluxAnalisis, 
      updateTreeData: setTreeData, 
      setLoadingDevices,
      setLoadingSaveConfig,
      setEditing,
    }
  }, [
    treeData, 
    devicesList, 
    fluxAnalisis, 
    currentPeriod,
    loadingDevices,
    loadingSaveConfig,
    editing
  ])

  return (
    <DevicesContext.Provider value={value}>
      {children}
    </DevicesContext.Provider>
  )
}
