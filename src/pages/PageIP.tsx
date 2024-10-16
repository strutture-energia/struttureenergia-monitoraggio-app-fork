import React, { useState, useEffect } from 'react';
import { PluginPage } from '@grafana/runtime';
import { getCurrentIp } from 'service/ipService';
import { Button, TextField} from '@mui/material';

export function PageIP() {
  const [ip, setIp] = useState(null);  // Stato per memorizzare l'IP
  const [loading, setLoading] = useState(true);  // Stato per indicare il caricamento
  const [error, setError] = useState<string>("");  // Stato per memorizzare l'errore
  const [url, setUrl] = useState<string>("")
  const [token, setToken] = useState<string>("")

  const fetchIp = async () => {
    setLoading(true);   // Imposta lo stato di caricamento
    setError("");     // Resetta l'errore
    try {
      const retrievedIp = await getCurrentIp(url, token);
      setIp(retrievedIp);  // Imposta l'IP nello stato
    } catch (err) {
      setError("Errore nel recuperare l'indirizzo IP");  // Imposta l'errore
    }
    setLoading(false);  // Disattiva il caricamento
  };

  useEffect(() => {
    fetchIp();  // Chiama la funzione al montaggio del componente
  }, []);  // L'array vuoto indica che l'effetto si esegue solo una volta, al montaggio

  return (
    <PluginPage>
      <TextField
          label="Url"
          fullWidth
          variant="outlined"
          margin="normal"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <TextField
          label="Token"
          fullWidth
          variant="outlined"
          margin="normal"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <Button
            variant="contained"
            onClick={fetchIp}
            fullWidth={false}
            sx={{ maxWidth: '250px' }}
          >
            Ricerca
          </Button>
      <h1>
        {loading ? "Caricamento..." : error ? error : `Il tuo indirizzo IP è ${ip ? ip : "non disponibile"}`}
      </h1>
    </PluginPage>
  );
}
