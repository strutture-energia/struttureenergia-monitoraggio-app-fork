import React, { useState, useEffect } from 'react';
import { PluginPage } from '@grafana/runtime';
import { getCurrentIp } from 'service/ipService';
import { Button} from '@mui/material';

export function PageIP() {
  const [ip, setIp] = useState(null);  // Stato per memorizzare l'IP
  const [loading, setLoading] = useState(true);  // Stato per indicare il caricamento
  const [error, setError] = useState<string>("");  // Stato per memorizzare l'errore

  const fetchIp = async () => {
    setLoading(true);   // Imposta lo stato di caricamento
    setError("");     // Resetta l'errore
    try {
      const retrievedIp = await getCurrentIp();
      setIp(retrievedIp);  // Imposta l'IP nello stato
    } catch (err) {
      setError('Errore nel recuperare l\'indirizzo IP');  // Imposta l'errore
    }
    setLoading(false);  // Disattiva il caricamento
  };

  useEffect(() => {
    fetchIp();  // Chiama la funzione al montaggio del componente
  }, []);  // L'array vuoto indica che l'effetto si esegue solo una volta, al montaggio

  return (
    <PluginPage>
      <h1>
        {loading ? "Caricamento..." : error ? error : `Il tuo indirizzo IP è ${ip ? ip : "non disponibile"}`}
      </h1>
      <Button
            variant="contained"
            onClick={fetchIp}
            fullWidth={false}
            sx={{ maxWidth: '250px' }}
          >
            Riprova
          </Button>
      {error} 
    </PluginPage>
  );
}
