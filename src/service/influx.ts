import { InfluxDB, QueryApi } from '@influxdata/influxdb-client';


const token = "02OU7ZjEReFsSreIktaNepUgq0UcA2n2MNGpDrrROQwWLzisaZnQF58Li2canYSylJfL2gUuLOb-C2xRpCvD6w=="
const url = 'http://192.168.178.29:8086'
const client = new InfluxDB({ url, token })

let org = `Strutture Energia`
let bucket = `homeassistant`

export const getWriteClient = () => {
  return client.getWriteApi(org, bucket, 'ms')
}

export const getReadClient = (): QueryApi => {
  return client.getQueryApi(org)
}


