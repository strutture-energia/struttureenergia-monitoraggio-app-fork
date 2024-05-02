
export const get = async (url: string): Promise<any> => {
	return await fetch(url)
		.then(res => {
			if (!res.ok) {
				throw Error("[webService] Error get response");
			}
			return getDataResponse(res);
		})
		.catch(error => {
			manageError(error);
		});
}

export const post = async (url: string, body: any): Promise<any> => {
	return await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
		},
		body: JSON.stringify(body),
	})
		.then(async res => {
			if (!res.ok) {
				throw Error("[webService] Error post response");
			}
			return await getDataResponse(res);
		})
		.catch(error => {
			manageError(error);
		});
}




const getDataResponse = async (res: any): Promise<any> => {
	let json = await res?.clone()?.json();
	return json;
};

const manageError = (error: any) => {
	throw error;
};
