import React, { useEffect, useState } from 'react';
import { PluginPage } from '@grafana/runtime';
import { Alert, Button, CircularProgress, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
// @ts-ignore
import { getBalance, getBlockNumber, processWalletTransaction } from "../script_blockchain/all_scripts";

export function PageAnalisiFatture() {
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [blockNumber, setBlockNumber] = useState<number>(0);
  const [balance, setBalance] = useState<number>(0);
  const [transactionHistory, setTransactionHistory] = useState<Array<{ date: string; hash: string; message: string }>>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      const fetchedBalance = await getBalance();
      const fetchedBlockNumber = await getBlockNumber();
      setBalance(fetchedBalance);
      setBlockNumber(fetchedBlockNumber);
      setTransactionHistory(getLocalStorageTransactionHistory());
    };
    fetchInitialData();
  }, []);

  const saveTransactionHistory = () => {
    localStorage.setItem("transactionHistory", JSON.stringify(transactionHistory));
  }

  const getLocalStorageTransactionHistory = () => {
    return JSON.parse(localStorage.getItem("transactionHistory") || "[]");
  }

  const handleNewBilling = async () => {
    setLoading(true);

    try {
      const { success, transactionHash, blockNumber, message } = await processWalletTransaction();

      if (success) {
        setSuccess("Blockchain aggiornata con successo!");
        setTransactionHistory(prev => [
          { date: new Date().toLocaleString(), hash: transactionHash, message },
          ...prev
        ]);
        setBlockNumber(blockNumber);
      } else {
        setTransactionHistory(prev => [
          { date: new Date().toLocaleString(), hash: "", message },
          ...prev
        ]);
        setError(message);
      }
    } catch (err: any) {
      const errorMessage = "Si è verificato un errore: " + err.message;
      setTransactionHistory(prev => [
        { date: new Date().toLocaleString(), hash: "", message: errorMessage },
        ...prev
      ]);
      setError(errorMessage);
    } finally {
      saveTransactionHistory();
      setLoading(false);
    }
  };

  return (
    <PluginPage>
      <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess(null)}>
        <Alert onClose={() => setSuccess(null)} severity="success" variant="filled" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError(null)}>
        <Alert onClose={() => setError(null)} severity="error" variant="filled" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      <div style={{ padding: '20px' }}>
        <p>Spazio in blockchain attuale: {blockNumber} Nodi</p>
        <p>Saldo: {balance} MATIC</p>

        <Button
          onClick={handleNewBilling}
          variant="contained"
          color="primary"
          style={{ margin: '10px 0' }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Carica su blockchain"}
        </Button>

        {/* Tabella cronologia transazioni */}
        <TableContainer component={Paper} style={{ marginTop: '20px' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data Transazione</TableCell>
                <TableCell>Hash</TableCell>
                <TableCell>Messaggio</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactionHistory.map((transaction, index) => (
                <TableRow key={index}>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>{transaction.hash || "-"}</TableCell>
                  <TableCell>{transaction.message}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </PluginPage>
  );
}
