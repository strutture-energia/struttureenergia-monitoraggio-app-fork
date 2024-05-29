import { DATA_SOURCE_BASE_URL } from "constant/API";
import { get } from "./webService";
//import { getGrafanaBaseUrl } from "utils/common";

//TODO: definire correttamente i tipi
// FIXME: Non viene più usata, capire se toglierla (??)
export const getDataSources = async (): Promise<any> => {
	try {

		//let baseUrl = getGrafanaBaseUrl();
		return await get( DATA_SOURCE_BASE_URL);

	} catch (error) {
		throw error;
	}
}
