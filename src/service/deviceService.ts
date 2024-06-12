import { TreeItem } from "react-sortable-tree";
import { CSV_ENEL_ICON, DEVICE_ORIGIN_CSV, DEVICE_ORIGIN_DEV, Device, DeviceModalValues } from "../types/devices";
import { brkRef } from "../utils/common";
import { getAllDevicesFromLocalStorage, saveIdUserToLocalStorage } from "./localData";
import { deleteDeviceEnergyData, deleteInfluxData, getReadClient, getWriteClient } from "./influx";
import { getSlot } from "./fasciaOraria";
import { Point } from "@influxdata/influxdb-client";

//TODO: definire correttamente i tipi
// TODO: Serve refactor della funzione
export const getAllDevicesByPeriod = async (from: Date, to: Date): Promise<any[]> => {
  console.log(typeof from, to);
  try {
     const query = ` 
    from(bucket: "homeassistant")
    |> range(start: ${from.toISOString()}, stop: ${to.toISOString()})
    |> filter(fn: (r) => r["_field"] == "value" and r.type_measure == "energia")
    |> map(
        fn: (r) =>
            ({r with _measurement: if r.domain == "switch" then "stato" else r._measurement}),
    )
    |> map(
        fn: (r) =>
            ({
                id_device: r.device_id,
                id_utente: r.id_utente,
                nome_locale: r.area,
                entityId: r.entity_id,
                nome_sensore: r.device_name,
                tipo_misurazione: r.type_measure,
                trasmissione: r.transmission,
                um_sigla: r._measurement,
                valore: r._value,
                time: r._time,
            }),
    )      
    |> group(columns: ["id_device", "id_utente", "nome_locale", "nome_sensore", "tipo_misurazione", "trasmissione", "um_sigla"]) 
    |> sum(column: "valore")      
    |> sort(columns: ["time"], desc: true)
    `; 

    //QUERY API
    const readClient = await getReadClient();
    let result = await readClient.collectRows(query);
    console.log("RESPONSE QUERY API", result)

    if (result && result.length > 0) {
      let devices: any[] = [];
      result.map((r: any) => {
        devices.push({
          id: r.id_device,
          idUser: r.id_utente,
          name: r.nome_sensore,
          type: r.tipo_misurazione,
          icon: r?.trasmissione === 'csv' ? CSV_ENEL_ICON : undefined,
          origin: r?.trasmissione === 'csv' ? DEVICE_ORIGIN_CSV : DEVICE_ORIGIN_DEV,
          roomName: r?.nome_locale ?? undefined,
          value: Math.floor(r.valore*100)/100
        })
      })
      return devices;
    }
    return [];
  } catch (error) {
    throw error;
  }
}


export const getDeviceFromPeriod = async (idDevice: string, from: Date, to: Date): Promise<any[]> => {
  console.log(typeof from, to);
  try {
     const query = ` 
    from(bucket: "homeassistant")
    |> range(start: ${from.toISOString()}, stop: ${to.toISOString()})
    |> filter(fn: (r) => r["_field"] == "value" and r.type_measure == "energia" and r["device_id"] == "${idDevice}")`; 

    //QUERY API
    const readClient = await getReadClient();
    let result = await readClient.collectRows(query);
    
    return result;
  } catch (error) {
    throw error;
  }
}

export const updateDeviceFasciaValues = async (from: Date, to: Date, deviceValues: any[]) => {
  try {
    try {
      console.log("CANCELLAZIONE DATI VECCHI IN CORSO ....", deviceValues[0]["_measurement"],deviceValues[0]["device_id"])
      await deleteDeviceEnergyData(from, to, deviceValues[0]["_measurement"],deviceValues[0]["device_id"]);
      console.log("CANCELLAZIONE AVVENUTA")
    } catch (error) {
      console.log("errore durante la cancellazione", error)
      throw error;
    }


    const writeClient = await getWriteClient();

    for (let i = 0; i < deviceValues.length; i++) {
      const device = deviceValues[i];

      const fascia = getSlot(new Date(device["_time"]).getTime());

      let point = new Point(device["_measurement"])
        .tag('id_utente', device["id_utente"])
        .tag('device_name', device["device_name"])
        .tag('device_id', device["device_id"])
        .tag('unit_of_measurement', device["_measurement"])
        .tag('domain', device["domain"])
        .tag('entity_id', device["entity_id"])

        .tag('state_class', device["state_class"])
        .tag('device_class', device["device_class"])
        .tag('friendly_name', device["friendly_name"])
        .tag('area', device["area"])
        .tag('transmission', device["transmission"])
        .tag('type_measure', device["type_measure"])

        .tag('fascia', "" + fascia)
        
        .floatField('value', device["_value"])
        .timestamp(new Date(device["_time"]))
      writeClient.writePoint(point);
    }
    console.log("CARICAMENTO IN CORSO....")
    await writeClient.flush()
    console.log("CARICAMENTO AVVENUTO")
  } catch (error) {
    console.log("ERROR DURANTE IL CARICAMENTO", error)
  }
}

export const createNewDeviceByData = async ({ deviceName, idDevice, timeValue, idUser, area }: any) => {
  try {
    const writeClient = await getWriteClient();

    for (let i = 0; i < timeValue.length; i++) {
      const tv = timeValue[i];
      const timestamp = tv[0];
      const value = tv[1];

      if (timestamp && value) {
        const fascia = getSlot(timestamp);
        let point = new Point('kWh')
          .tag('id_utente', idUser)
          .tag('device_name', deviceName)
          .tag('device_id', idDevice)
          .tag('unit_of_measurement', 'kWh')


          .tag('state_class', 'total_increasing')
          .tag('device_class', 'energy')
          .tag('friendly_name', deviceName)
          .tag('area', area)
          .tag('transmission', "csv")
          .tag('type_measure', "energia")


          .tag('fascia', "" + fascia)
          .floatField('value', value)
          .timestamp(timestamp)
        writeClient.writePoint(point)
      } else {
        console.error(`ERROR OUTPUT ${i}idx: `, timestamp, value);
      }
    }
    console.log("CARICAMENTO IN CORSO....")
    await writeClient.flush()
    console.log("CARICAMENTO AVVENUTO")
  } catch (error) {
    console.log("ERROR DURANTE IL CARICAMENTO", error)
  }
}

export const deleteCreatedDevice = async (idDevice: string): Promise<void> => {
  try {
    const predicate =  `_measurement=\"kWh\" AND transmission=\"csv\" AND device_id=\"${idDevice}\"`
    await deleteInfluxData(new Date('1970-01-01T00:00:00Z'), new Date(), predicate)
  } catch (error) {
    throw error;
  }
}

export function getAvailableDevices(
  localTreeData: TreeItem[],
  devicesByPeriod: Device[],
): {
  treeData: TreeItem[];
  // devicesList è any perchè sono i dati che ritorna l'api getDevicesByPeriod
  devicesList: any;
} {
  console.log('dev by period', devicesByPeriod);
  _findAndSaveIdUser(devicesByPeriod);
  let treeData: TreeItem[] = brkRef(localTreeData);
  let devicesList: Device[] = brkRef(devicesByPeriod);
  _updateTreeMetaData(treeData, devicesList);
  _createVerificationNodes(treeData);
  // integro dati del dispositivo con quelli salvati sul local storage (se esistono)
  // setto lo statto di disponibilità a true per tutti i devs (perchè se sono ritornati dall'api vuol dire che sono disponibili per quel periodo)
  const actualDevicesList = _addAdditionalDataToDevicesList(devicesList);
  return { treeData, devicesList: actualDevicesList };
}

export function createNewTreeNode(
  device: Device
): TreeItem {
  return {
    title: device.name,
    expanded: true,
    metadata: {
      value: device.value,
      available: device.available,
      deviceId: device.id,
      type: device.type,
      roomName: device.roomName,
      idUser: device.idUser,
      customName: device.customName,
      icon: device.icon,
      parentNodeCustomName: device.parentNodeCustomName,
      active: device.active,
      origin: device.origin,
      devCustomName: device.devCustomName,
      destination: device.destination,
      classification: device.classification,
      charts: device.charts,
    }
  }
}

export function createNewUnionNode(
  value: number,
): TreeItem {
  return {
    title: 'Nodo',
    expanded: true,
    metadata: {
      value: value,
      available: true,
      deviceId: Date.now().toString(),
      type: 'union'
    }
  }
}

export function createNewDevice(
  nodeTree: TreeItem
): Device {
  const devName = nodeTree?.title as string;
  return {
    name: devName,
    id: nodeTree.metadata.deviceId,
    value: nodeTree.metadata.value,
    available: nodeTree.metadata.available,
    type: '',
    roomName: nodeTree.metadata.roomName,
    idUser: nodeTree?.metadata?.idUser,
    customName: nodeTree.metadata.customName,
    icon: nodeTree.metadata.icon,
    parentNodeCustomName: nodeTree.metadata.parentNodeCustomName,
    active: nodeTree.metadata.active,
    origin: nodeTree.metadata.origin,
    devCustomName: nodeTree.metadata.devCustomName,
    destination: nodeTree.metadata.destination,
    classification: nodeTree.metadata.classification,
    charts: nodeTree.metadata.charts,
  }
}

//TODO: controllo e crerazione nodi differenza
export function makeFluxAnalisis(
  treeData: TreeItem[],
  fA: Array<Array<number | string>>,
  underUnavailableNode = false,
): void {
  treeData.forEach((node: TreeItem) => {
    //const value = node.metadata.value;
    const nodeDeviceId = node.metadata.deviceId;
    const nodeChildren = node.children as TreeItem[];
    const isAvailable = node.metadata.available;
    if (isAvailable && !underUnavailableNode) {
      if (nodeChildren && nodeChildren.length > 0) {
        nodeChildren.forEach((kid: TreeItem) => {
          if (kid.metadata.available) {
            const kidId = kid.metadata.deviceId;
            fA.push([nodeDeviceId, kidId, kid.metadata.value])
          }
        })
      }
    }
    if (nodeChildren && nodeChildren.length > 0) {
      makeFluxAnalisis(nodeChildren, fA, !isAvailable);
    }
  })
}

//TODO: Creare una costante per le tipologie di nodi
export function moveAllNodeChildrenToList(
  treeNode: TreeItem[],
  devicesList: Device[],
): void {
  treeNode.forEach((node: TreeItem) => {
    const nodeChildren = node.children as TreeItem[];
    const isDiffNode = node.metadata.type === 'diff';
    const isUnionNode = node.metadata.type === 'union';
    const isAvailable = node.metadata.available;
    // i nodi unione, nodi dirrerenza e nodi non disponibili non vengono spostati nella lista di sinistra
    if (!isDiffNode && !isUnionNode && isAvailable) {
      devicesList.push(createNewDevice(node));
    }
    if (nodeChildren && nodeChildren.length > 0) {
      moveAllNodeChildrenToList(nodeChildren, devicesList);
    }
  })
}

function _addAdditionalDataToDevicesList(
  devsList: any[]
): Device[] {
  const m_devices = getAllDevicesFromLocalStorage();
  return devsList.map((dev: Device) => {
    let actualDev: Device = brkRef(dev);
    const devId = actualDev.id;
    if (m_devices[devId]) {
      actualDev = m_devices[devId];
    }
    actualDev.available = true;
    return actualDev;
  })
}

function _updateTreeMetaData(
  treeData: TreeItem[],
  devicesByPeriod: Device[],
): void {
  treeData.forEach((node: TreeItem) => {
    const nodeDeviceId = node.metadata.deviceId;
    const foundIndex = devicesByPeriod.findIndex(dev => dev.id === nodeDeviceId);
    const isDiffNode = node.metadata.type === 'diff';
    const isUnionNode = node.metadata.type === 'union';
    if (foundIndex !== -1) {
      const deviceData = devicesByPeriod[foundIndex];
      node.metadata.value = deviceData.value;
      node.metadata.available = true;
      devicesByPeriod.splice(foundIndex, 1);
    } else {
      // se è un nodo verifica o un nodo unione viene messo come disponibile, altrimenti è non nodo non più disponibile
      node.metadata.available = isDiffNode || isUnionNode;
    }
    const nodeChildren = node.children as TreeItem[];
    if (nodeChildren && nodeChildren.length > 0) {
      _updateTreeMetaData(nodeChildren, devicesByPeriod)
    }
  })
}

function _getNewDiffNode(
  parentNode: TreeItem,
  value: number
): TreeItem {
  return {
    title: 'DIFF ' + parentNode.title,
    expanded: parentNode.expanded,
    subtitle: parentNode.subtitle,
    children: undefined,
    metadata: {
      type: 'diff',
      available: true,
      deviceId: 'diff ' + parentNode.title,
      value
    }
  }
}

export function _createVerificationNodes(
  treeData: TreeItem[]
): void {
  treeData.forEach((node: TreeItem) => {
    const parentValue = node.metadata.value;
    const nodeChildren = node.children as TreeItem[];
    const isDiffNode = node.metadata.type === 'diff';
    const isUnionNode = node.metadata.type === 'union';
    if (nodeChildren && nodeChildren.length > 0 && !isDiffNode) {
      let cumulativeChildrenValues = 0;
      let alreadyExistingDiffNode: TreeItem | null = null;
      nodeChildren.forEach((kid: TreeItem) => {
        if (kid.metadata.type !== 'diff') {
          cumulativeChildrenValues += kid.metadata.value;
        } else {
          alreadyExistingDiffNode = kid;
        }
      });
      const diff = parentValue - cumulativeChildrenValues;
      // se è un nodo unione non viene considerata la logica di gestione dei nodi differenza
      if (!isUnionNode) {
        // cumulativeChildrenValues > 0 perchè potrebbe succedere che, in seguito ad una eliminazione, rimanga solo il nodo diff
        // in quel caso verrebbe rilevata una differenza ma la somma dei consumi cumulativa è 0 (perchè non ci sono nodi da tenere in considerazione per il calcolo)
        if (diff !== 0 && cumulativeChildrenValues > 0) {
          if (alreadyExistingDiffNode) { // se esiste già un nodo verifica
            if ((alreadyExistingDiffNode as TreeItem).metadata.value !== diff) {
              (alreadyExistingDiffNode as TreeItem).metadata.value = diff;
            }
          } else { // se non esiste viene creato nuovo
            const newDiffNode = _getNewDiffNode(node, diff);
            nodeChildren.push(newDiffNode);
          }
        } else { // se i consumi dei filgi corrispondono a quelli del padre
          nodeChildren.map((kid: TreeItem, index: number) => { // eliminazione nodi diff
            if (kid.metadata.type === 'diff') {
              nodeChildren.splice(index, 1);
            }
          })
        }
      }
      _createVerificationNodes(nodeChildren);
    }
  })
}

export function isTreeValid(
  treeData: TreeItem[],
): boolean {
  for (let node of treeData) {
    const isUnionNode = node.metadata.type === 'union';
    const nodeChildren = node.children as TreeItem[];
    if (isUnionNode && (!nodeChildren || nodeChildren.length === 0)) {
      return false;
    }
    if (nodeChildren && nodeChildren.length > 0) {
      // controllo sui "sotto alberi". se non sono validi restituisce false
      if (!isTreeValid(nodeChildren)) {
        return false;
      }
    }
  }
  return true;
}

export function setActualUnionNodeValues(
  treeData: TreeItem[]
): void {
  treeData.forEach((node: TreeItem) => {
    let nodeValue = 0;
    const isUnionNode = node.metadata.type === 'union';
    const nodeChildren = node.children as TreeItem[];
    if (nodeChildren && nodeChildren.length > 0) {
      nodeChildren.forEach((child: TreeItem) => {
        // prima aggiorno tutti i valori dei nodi figli
        setActualUnionNodeValues([child]);
        // poi uso i valori dei nodi figli aggiornati per calcolare la somma
        nodeValue += child.metadata.value;
      })
    }
    if (isUnionNode) {
      node.metadata.value = nodeValue;
    }
  })
}

function _findAndSaveIdUser(
  devicesList: any[]
): void {
  if (devicesList && (devicesList instanceof Array) && devicesList.length !== 0) {
    for (let dev of devicesList) {
      if (dev?.idUser) {
        saveIdUserToLocalStorage(dev.idUser);
        break;
      }
    }
  }
}

export function updateDeviceModalMetadata(
  modalValues: DeviceModalValues,
  devNode: TreeItem,
): TreeItem {
  const newDevNode: TreeItem = brkRef(devNode);
  newDevNode.metadata.customName = modalValues.customName;
  newDevNode.metadata.icon = modalValues.icon;
  newDevNode.metadata.parentNodeCustomName = modalValues.parentNodeCustomName;
  newDevNode.metadata.active = modalValues.active;
  newDevNode.metadata.origin = modalValues.origin;
  newDevNode.metadata.devCustomName = modalValues.devCustomName;
  newDevNode.metadata.destination = modalValues.destination;
  newDevNode.metadata.classification = modalValues.classification;
  newDevNode.metadata.phase = modalValues.phase;
  /* GRAFICI */
  if (!newDevNode.metadata.charts) {newDevNode.metadata.charts = {};}
  if (!newDevNode.metadata.charts.realtime) {newDevNode.metadata.charts.realtime = {};}
  if (!newDevNode.metadata.charts.history) {newDevNode.metadata.charts.history = {};}
  if (!newDevNode.metadata.charts.profiles) {newDevNode.metadata.charts.profiles = {};}
  // tempo reale
  newDevNode.metadata.charts.realtime.currentIntensity = modalValues.rtCurrentIntensity;
  newDevNode.metadata.charts.realtime.voltage = modalValues.rtVoltage;
  newDevNode.metadata.charts.realtime.power = modalValues.rtPower;
  // storico
  newDevNode.metadata.charts.history.currentIntensity = modalValues.hCurrentIntensity;
  newDevNode.metadata.charts.history.voltage = modalValues.hVoltage;
  newDevNode.metadata.charts.history.power = modalValues.hPower;
  newDevNode.metadata.charts.history.energy = modalValues.hEnergy;
  // profili
  newDevNode.metadata.charts.profiles.spring = modalValues.pSpring;
  newDevNode.metadata.charts.profiles.autumn = modalValues.pAutumn;
  newDevNode.metadata.charts.profiles.summer = modalValues.pSummer;
  newDevNode.metadata.charts.profiles.winter = modalValues.pWinter;
  newDevNode.metadata.charts.profiles.winterVsSummer = modalValues.pWinterVsSummer;
  newDevNode.metadata.charts.profiles.electricDemand = modalValues.pElectricDemand;

  newDevNode.metadata.charts.profiles.timeSlotsConsumption = modalValues.timeSlotsConsumption;
  newDevNode.metadata.charts.profiles.timeSlotsDistribution = modalValues.timeSlotsDistribution;
  return newDevNode;
}
