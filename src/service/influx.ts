import { InfluxDB, Point, QueryApi} from '@influxdata/influxdb-client';
import axios from 'axios';
import { getPluginSelectedDatasource } from './plugin';


//INSTALL ON HA
//const token = "02OU7ZjEReFsSreIktaNepUgq0UcA2n2MNGpDrrROQwWLzisaZnQF58Li2canYSylJfL2gUuLOb-C2xRpCvD6w=="
//const url = 'http://192.168.178.29:8086'

//INSTALL ON DIGITALOCEAN
//const token = "HtRUtF9LsIBWgcNilRcVMJxM654y0ydmqeyfUWF1l5ig8KDjwMosTXF-ZJajivoIFnzFlIxlcqwigsYcTnLG2A=="
//const url = 'http://164.92.195.222:8086'


//INSTALL ON HA STRUTTURE .10
//const token = "ZDzPTc8TM1Bf9_2BrcC5o2UsmMu2Ohp67A8BemT3AG17q-VX8qxas4x8wx7yUYlcbQdNreXixNlqf01R2rlcfg=="
//const url = 'http://192.168.6.10:8086'



let client: InfluxDB | null = null;

//let org = `Strutture Energia`
let bucket_default = `homeassistant`;

const BUCKET_DATA = 'data';
const DATE_SAVE_DATA = '2024-05-10T00:00:00Z';

async function getClient(): Promise<InfluxDB> {
  if (!client) {
    const selectedDs = await getPluginSelectedDatasource();
    const dsUrl = selectedDs.serverAddress;
    const dsToken = selectedDs.token;
    client = new InfluxDB({ url: dsUrl, token: dsToken });
  } 
  return client;
}

export const getWriteClient = async (bucket: string = bucket_default) => {
  const client = await getClient();
  const selectedDs = await getPluginSelectedDatasource();
  const datasourceOrg = selectedDs.orgName;
  return client.getWriteApi(datasourceOrg, bucket, 'ms')
}

export const getReadClient = async (): Promise<QueryApi> => {
  const client = await getClient();
  const selectedDs = await getPluginSelectedDatasource();
  return client.getQueryApi(selectedDs.orgName);
}


export const deleteInfluxData = async(start: Date, stop: Date, predicate: string, bucket: string = bucket_default): Promise<any> => {
  const data = {
    start: start.toISOString(),
    stop: stop.toISOString(),
    predicate: predicate
  };

  const selectedDs = await getPluginSelectedDatasource();

  const deleteEndpoint = `${selectedDs.serverAddress}/api/v2/delete?org=${encodeURIComponent(selectedDs.orgName)}&bucket=${encodeURIComponent(bucket)}`;
  const config = {
    headers: {
      'Authorization': `Token ${selectedDs.token}`,
      'Content-Type': 'application/json'
    }
  };
  return axios.post(deleteEndpoint, data, config)
  .then(() => {
    console.log('Data deleted successfully');
  })
  .catch((e) => {
    console.error('Error deleting data:', e);
  });
}

export const saveJsonData = async (jsonData: any, measurement: string, idData: string) => {
  try {
    const writeClient = await getWriteClient(BUCKET_DATA);

    let point = new Point(measurement)
      .tag('idData', idData)
      .stringField('jsonData', JSON.stringify(jsonData))
      .timestamp(new Date(DATE_SAVE_DATA));
    writeClient.writePoint(point);
    await writeClient.flush()
  } catch (error) {
    console.log("ERROR DURANTE IL CARICAMENTO", error)
  }
}


export const getJsonData = async (measurement: string, idData: string): Promise<any> => {
  try {
    const query = `
    from(bucket: "${BUCKET_DATA}")
    |> range(start: ${new Date(DATE_SAVE_DATA).toISOString()}, stop: ${new Date().toISOString()})
    |> filter(fn: (r) => r["_measurement"] == "${measurement}")
    |> filter(fn: (r) => r["idData"] == "${idData}")
    |> map(
        fn: (r) =>
            ({
                tree: r["_value"]
            }),
    )`

    const readClient = await getReadClient();
    let result: any = await readClient.collectRows(query);
    result = result[0]?.tree ? JSON.parse(result[0]?.tree) : {};
    return result;
  } catch (error) {
    console.log("ERROR DURANTE IL CARICAMENTO", error)
    throw error;
  }
}

export const deleteJsonData = async (measurement: string, idData: string): Promise<any> => {
  const predicate =  `_measurement=\"${measurement}\" AND idData=\"${idData}\"`
  return await deleteInfluxData( new Date(DATE_SAVE_DATA), new Date(), predicate, BUCKET_DATA)
}

export const deleteDeviceEnergyData = async (from: Date, to: Date, measurement: string, idDevice: string): Promise<any> => {
  const predicate =  `_measurement=\"${measurement}\" AND type_measure = \"energia\" AND device_id = \"${idDevice}\" AND fascia = \"0\"`
  return await deleteInfluxData(from, to, predicate, bucket_default)
}