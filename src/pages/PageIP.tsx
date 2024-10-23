import React, { useState, useEffect } from 'react';
import { PluginPage } from '@grafana/runtime';
import { getCurrentIp } from 'service/ipService';
import { Alert, Button, Snackbar, TextField, Box, CircularProgress } from '@mui/material';
import { getPluginIPConfig, savePluginIPConfig } from 'service/plugin';

export function PageIP() {
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");  // Nuova variabile per messaggi
  const [hostname, setHostname] = useState<string>("");  // Stato per l'hostname
  const [token, setToken] = useState<string>("");  // Stato per il token
  const [success, setSuccess] = useState<string | null>(null);  // Stato per il salvataggio
  const [info, setInfo] = useState<string | null>(null);  // Stato per informazioni aggiuntive

  // Funzione per cercare l'IP
  const fetchIp = async () => {
    setLoading(true);
    setMessage("");  // Resetta il messaggio prima di fare la richiesta
    try {
      const retrievedIp = await getCurrentIp();
      setMessage(`Il tuo indirizzo IP è ${retrievedIp || "non trovato"}`);  // Imposta il messaggio con l'IP
    } catch (err) {
      setMessage("Errore nel recuperare l'indirizzo IP");  // Imposta il messaggio d'errore
    }
    setLoading(false);
  };

  // Funzione per salvare configurazioni (hostname e token) e poi cercare l'IP
  const saveConfig = async () => {
    try {
      await savePluginIPConfig(token, hostname);
      setSuccess("Configurazione salvata con successo!");
      fetchIp();  // Dopo il salvataggio avvia la ricerca IP
    } catch (err) {
      setMessage("Errore nel salvare la configurazione");
    }
  };

  // Recupera le configurazioni al montaggio del componente
  useEffect(() => {
    const getIpConfig = async () => {
      try {
        const config = await getPluginIPConfig();
        if (config.hostname && config.token) {
          setHostname(config.hostname);
          setToken(config.token);
          setSuccess("Configurazione recuperata con successo!")
        } else {
          // Se la configurazione è vuota, imposta un messaggio informativo
          setInfo("La configurazione di token e host sono vuote, configurale!");
        }
      } catch (err) {
        setMessage("Errore nel recuperare la configurazione");
      }
    };
    getIpConfig();
  }, []);

  return (
    <PluginPage>
      <Box sx={{ p: 3 }}>
        {/* Notifiche di successo ed errore per il salvataggio */}
        <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess(null)}>
          <Alert onClose={() => setSuccess(null)} severity="success" variant="filled" sx={{ width: '100%' }}>
            {success}
          </Alert>
        </Snackbar>

        <Snackbar open={!!info} autoHideDuration={4000} onClose={() => setInfo(null)}>
          <Alert onClose={() => setInfo(null)} severity="info" variant="filled" sx={{ width: '100%' }}>
            {info}
          </Alert>
        </Snackbar>

        <TextField
          label="Hostname"
          fullWidth
          variant="outlined"
          margin="normal"
          placeholder='homeassistant.local'
          value={hostname}
          onChange={(e) => setHostname(e.target.value)}
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
          onClick={saveConfig}
          fullWidth={false}
          sx={{ maxWidth: '250px', marginTop: '20px' }}
          disabled={loading || !hostname || !token}
        >
          {loading ? <CircularProgress size={24} /> : 'Salva'}
        </Button>

        <h1>
          {loading ? "Caricamento..." : message}
        </h1>
      </Box>
    </PluginPage>
  );
}
