import axios from "axios"

export const getCurrentIp = async (url: string, token: string) => {
    console.log("DEBUG: getCurrentIp è stato chiamato!")
    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log(JSON.stringify(response));

        const ip = response.data.ip_address; // Estrarre l'IP dai dati JSON
        return ip;
    } catch (error) {
        console.error("Errore nel recuperare l'IP di Home Assistant", error);
        return null;
    }
};
