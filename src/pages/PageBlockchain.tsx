import React, { useEffect, useState } from 'react';
import { PluginPage } from '@grafana/runtime';
import { Alert, Button, CircularProgress, Snackbar } from '@mui/material';

export function PageBlockchain() {
  // Funzione per ottenere la data formattata
  const getFormattedDate = (daysOffset: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset); // Aggiungi o sottrai giorni
    return `Ultima bollettazione: ${date.toLocaleString()}`; // Formatta la data come stringa con minuti e secondi
  };

  // Recupera i dati dal localStorage
  const getLastBillingFromStorage = () => {
    const storedBilling = localStorage.getItem('lastBilling');
    return storedBilling ? storedBilling : getFormattedDate(-1); // Se non c'è, torna a ieri
  };

  const getBlockchainSpaceFromStorage = () => {
    const storedSpace = localStorage.getItem('blockchainSpace');
    return storedSpace ? parseInt(storedSpace, 10) : 63412; // Se non c'è, ritorna 63412 MB
  };

  // Stato per tenere traccia dell'ultima bollettazione
  const [success, setSuccess] = useState<string | null>(null);  // Stato per il salvataggio
  const [lastBilling, setLastBilling] = useState<string>(getLastBillingFromStorage());
  const [blockchainSpace, setBlockchainSpace] = useState<number>(getBlockchainSpaceFromStorage());
  const [loading, setLoading] = useState<boolean>(false);

  // Funzione per aggiornare lo stato con una nuova bollettazione
  const handleNewBilling = async () => {
    setLoading(true); // Avvia il caricamento
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simula un caricamento di 2 secondi
    const newBilling = getFormattedDate(0); // Aggiorna l'ultima bollettazione a oggi
    setLastBilling(newBilling);
    setBlockchainSpace(prevSpace => {
      const newSpace = prevSpace - 3; // Diminuisci lo spazio in blockchain di 3 MB
      localStorage.setItem('blockchainSpace', newSpace.toString()); // Salva il nuovo spazio nel localStorage
      return newSpace;
    });
    localStorage.setItem('lastBilling', newBilling); // Salva la nuova bollettazione nel localStorage
    setLoading(false); // Ferma il caricamento
    setSuccess("Blockchain aggiornata con successo!")
  };

  // Effetto per sincronizzare lo stato con il localStorage
  useEffect(() => {
    localStorage.setItem('lastBilling', lastBilling); // Sincronizza l'ultima bollettazione
    localStorage.setItem('blockchainSpace', blockchainSpace.toString()); // Sincronizza lo spazio in blockchain
  }, [lastBilling, blockchainSpace]);

  return (
    <PluginPage>
      <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess(null)}>
        <Alert onClose={() => setSuccess(null)} severity="success" variant="filled" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
      <div style={{ padding: '20px' }}>
        <p>{lastBilling}</p> {/* Mostra l'ultima bollettazione */}
        <Button
          onClick={handleNewBilling}
          variant="contained"
          color="primary"
          style={{ margin: '10px 0' }}
          disabled={loading} // Disabilita il bottone durante il caricamento
        >
          {loading ? <CircularProgress size={24} /> : "Carica su blockchain"}
        </Button>
        <p>Spazio in blockchain attuale: {blockchainSpace} MB</p>
      </div>
    </PluginPage>
  );
}
