import { executeInfluxQuery } from "./influxQuery";

//TODO: definire correttamente i tipi

// 'now-1h', new Date()
export const getAllDevicesByPeriod = async (from: Date | string, to: Date | string): Promise<void> => {
	try {
		let query = ` 
		from(bucket: "ha_ufficio_vetrho")
    |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
    |> filter(fn: (r) => r["_field"] == "value" and r.type_measure == "energia")
    |> map(
        fn: (r) =>
            ({r with _measurement: if r.domain == "switch" then "stato" else r._measurement}),
    )
    |> map(
        fn: (r) =>
            ({
                id_device: r.device_id,
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
    |> group(columns: ["id_device"]) 
		|> sum(column: "valore")         
    |> sort(columns: ["time"], desc: true)
		`;

		const devices = await executeInfluxQuery(query, from, to);
		return devices
	} catch (error) {
		throw error;
	}
}
