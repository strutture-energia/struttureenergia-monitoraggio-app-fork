import { InfluxDB, Point, QueryApi } from '@influxdata/influxdb-client';
import axios from 'axios';
import { getPluginSelectedDatasource } from './plugin';

/**
 * Questo modulo gestisce l'interazione con InfluxDB, incluso la lettura, la scrittura, e la cancellazione dei dati.
 * Utilizza le API InfluxDB per lavorare con i dati del plugin all'interno di Grafana.
 */

// Variabili e costanti
let client: InfluxDB | null = null;
let bucket_default = `homeassistant`;

const BUCKET_DATA = 'data';
const DATE_SAVE_DATA = '2024-05-10T00:00:00Z';

// INFLUXDB CLIENT

// Ottiene il client InfluxDB, lo crea se non esiste ancora
async function getClient(): Promise<InfluxDB> {
  if (!client) {
    const selectedDs = await getPluginSelectedDatasource();
    const dsUrl = selectedDs.serverAddress;
    const dsToken = selectedDs.token;
    client = new InfluxDB({ url: dsUrl, token: dsToken });
  }
  return client;
}

// Ottiene il client di scrittura InfluxDB per un determinato bucket
export const getWriteClient = async (bucket: string = bucket_default) => {
  const client = await getClient();
  const selectedDs = await getPluginSelectedDatasource();
  const datasourceOrg = selectedDs.orgName;
  return client.getWriteApi(datasourceOrg, bucket, 'ms');
};

// Ottiene il client di lettura InfluxDB
export const getReadClient = async (): Promise<QueryApi> => {
  const client = await getClient();
  const selectedDs = await getPluginSelectedDatasource();
  return client.getQueryApi(selectedDs.orgName);
};

// OPERAZIONI DI CANCELLAZIONE DATI

// Cancella dati da InfluxDB in un determinato intervallo di tempo e con un predicato specifico
export const deleteInfluxData = async (start: Date, stop: Date, predicate: string, bucket: string = bucket_default): Promise<any> => {
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
};

// OPERAZIONI DI SALVATAGGIO DATI

// Salva dati JSON in InfluxDB con un determinato measurement e idData
export const saveJsonData = async (jsonData: any, measurement: string, idData: string) => {
  try {
    const writeClient = await getWriteClient(BUCKET_DATA);

    let point = new Point(measurement)
      .tag('idData', idData)
      .stringField('jsonData', JSON.stringify(jsonData))
      .timestamp(new Date(DATE_SAVE_DATA));

    writeClient.writePoint(point);
    await writeClient.flush();
  } catch (error) {
    console.log("ERROR DURANTE IL CARICAMENTO", error);
  }
};

// OPERAZIONI DI LETTURA DATI

// Ottiene i dati JSON da InfluxDB con un determinato measurement e idData
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
    )`;

    const readClient = await getReadClient();
    let result: any = await readClient.collectRows(query);
    result = result[0]?.tree ? JSON.parse(result[0]?.tree) : {};
    return result;
  } catch (error) {
    console.log("ERROR DURANTE IL CARICAMENTO", error);
    throw error;
  }
};

// OPERAZIONI DI CANCELLAZIONE DATI SPECIFICI

// Cancella dati JSON da InfluxDB con un determinato measurement e idData
export const deleteJsonData = async (measurement: string, idData: string): Promise<any> => {
  const predicate = `_measurement=\"${measurement}\" AND idData=\"${idData}\"`;
  return await deleteInfluxData(new Date(DATE_SAVE_DATA), new Date(), predicate, BUCKET_DATA);
};

// Cancella i dati energetici di un dispositivo con determinati parametri
export const deleteDeviceEnergyData = async (from: Date, to: Date, measurement: string, idDevice: string): Promise<any> => {
  const predicate = `_measurement=\"${measurement}\" AND type_measure = \"energia\" AND device_id = \"${idDevice}\" AND fascia = \"0\"`;
  return await deleteInfluxData(from, to, predicate, bucket_default);
};


export const getDummyData = async (): Promise<any> => {
  try {
    const query = `
    from(bucket: "homeassistant")
    |> range(start: ${new Date(DATE_SAVE_DATA).toISOString()}, stop: ${new Date().toISOString()})
    |> filter(fn: (r) => r["_measurement"] == "kWh")
    |> filter(fn: (r) => r["_field"] == "value")
    |> filter(fn: (r) => r["domain"] == "sensor")
    |> filter(fn: (r) => r["entity_id"] == "presa_placca_sonoff_switch_0_energy")
    |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)
    |> yield(name: "mean")
    `;

    const readClient = await getReadClient();
    let result: any = await readClient.collectRows(query);
    console.log("result:\n" + result)
    return result;
  } catch (error) {
    console.log("ERROR DURANTE IL CARICAMENTO", error);
    throw error;
  }
}
