import { INFLUX_BASE_URL } from "constant/API";
import { post } from "./webService";
import { formatInfluxQueryResponse, transformInfluxResult } from "utils/transformDataQuery";
import { getGrafanaBaseUrl } from "utils/common";
import { getPluginConfig } from "./grafana";

const DATA_SOURCE_ID = 2;

//TODO: definire correttamente i tipi
export const executeInfluxQuery = async (query: string, from: Date | string, to: Date | string): Promise<any> => {
	const pluginConfig: any = await getPluginConfig();
	const datasourceId = pluginConfig?.jsonData?.datasourceId;
	if (!datasourceId) {
		throw 'Invalid datasource';
	}
	console.log('...Creating query with datasource', datasourceId);
	try {
		const requestBody: any = {
			from: from,
			to: to,
			queries: [
				{
					refId: 'A',
					datasourceId: datasourceId,
					rawQuery: true,
					format: 'table',
					query: query,
					maxDataPoints: 1848,
					intervalMs: 200,
				},
			],
		};

		let baseUrl = getGrafanaBaseUrl();
		console.log("baseUrl", baseUrl, baseUrl+INFLUX_BASE_URL)
		const res = await post(baseUrl+INFLUX_BASE_URL, requestBody);
		//console.log("RESPONSE QUERY DATASOURCE", res);
		//const result = transformInfluxResult(res.results, 'A');
		const res2 = formatInfluxQueryResponse(res.results, 'A');
		console.log('res2', res2);
		return res2;
	} catch (error) {
		throw error;
	}
}
