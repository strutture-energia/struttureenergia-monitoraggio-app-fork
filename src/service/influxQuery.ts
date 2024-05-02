import { INFLUX_BASE_URL } from "constant/API";
import { post } from "./webService";
import { transformInfluxResult } from "utils/transformDataQuery";

const DATA_SOURCE_ID = 4;

//TODO: definire correttamente i tipi
export const executeInfluxQuery = async (query: string, from: Date | string, to: Date | string): Promise<any> => {
	try {
		const requestBody: any = {
			from: from,
			to: to,
			queries: [
				{
					refId: 'A',
					datasourceId: DATA_SOURCE_ID,
					query: query,
					maxDataPoints: 1848,
					intervalMs: 200,
				},
			],
		};

		const res = await post(INFLUX_BASE_URL, requestBody);
		const result = transformInfluxResult(res.results, 'A');
		return result;
	} catch (error) {
		throw error;
	}
}
