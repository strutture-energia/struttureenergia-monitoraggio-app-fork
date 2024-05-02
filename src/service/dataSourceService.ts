import { DATA_SOURCE_BASE_URL } from "constant/API";
import { get } from "./webService";

//TODO: definire correttamente i tipi
export const getDataSources = async (): Promise<void> => {
	try {
		return await get(DATA_SOURCE_BASE_URL);
	} catch (error) {
		throw error;
	}
}
