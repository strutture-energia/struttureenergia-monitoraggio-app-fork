import axios from "axios"

export const getCurrentIp = async () => {
    console.log("DEBUG: getCurrentIp è stato chiamato!")
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJkMzViMzJjMTliYzY0YzY0ODQ1Yzk2MzFkYTE0MjlmNSIsImlhdCI6MTcyODk4ODYwMSwiZXhwIjoyMDQ0MzQ4NjAxfQ.6rjs6wNz_-Am2Uu9KJrnRAWpoRl2bz9NbSZccw_k3So';
    try {
        const response = await axios.get('http://homeassistant.local/api/', {
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
