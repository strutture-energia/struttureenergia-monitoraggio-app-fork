import axios from "axios"
import { getPluginIPConfig } from 'service/plugin';

export const getCurrentIp = async () : Promise<string | null> => {
    console.log("DEBUG - getCurrentIp: chiamato")

    //Prendo i dati che ho salvato nella configurazione
    const {hostname, token} = await getPluginIPConfig()
    
    //Nel caso non siano stati settati
    if (!hostname || !token) { return null};

    try {
        const response = await axios.get(`http://${hostname}/api/states/sensor.local_ip`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            timeout: 5000
        });

        const ip = response.data.state; // Estrarre l'IP dai dati JSON
        console.log("DEBUG - getCurrentIp: trovato ip: " + ip);
        return ip;
    } catch (error) {
        console.error("Errore nel recuperare l'IP di Home Assistant", error);
        return null;
    }
};
