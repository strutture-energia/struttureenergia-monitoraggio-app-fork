import { DATA_SOURCE_BASE_URL } from "constant/API";
import { get } from "./webService";
import { getGrafanaBaseUrl } from "utils/common";

//TODO: definire correttamente i tipi
export const getDataSources = async (): Promise<void> => {
	try {

		let baseUrl = getGrafanaBaseUrl();
		return await get(baseUrl + DATA_SOURCE_BASE_URL);
	} catch (error) {
		throw error;
	}
}
