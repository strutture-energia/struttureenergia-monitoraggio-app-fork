import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Snackbar,
    Alert,
    styled,
    Box,
} from '@mui/material';
// @ts-ignore
import { getBalance, getBlockNumber, processWalletTransaction } from "../script_blockchain/all_fake_scripts";
import logo from "../assets/logo.png"

// Interfaces
interface Billing {
    date: Date;
    amount: number;
    consumption: number;
    status: string;
}

interface Transaction {
    date: Date;
    hash: string;
    status: string;
}

const SectionTitle = styled(Typography)(({ theme }) => ({
    fontWeight: 700,
    marginBottom: theme.spacing(4),
    position: 'relative',
    '&:after': {
        content: '""',
        position: 'absolute',
        bottom: -theme.spacing(1),
        left: 0,
        width: '60px',
        height: '4px',
        backgroundColor: theme.palette.primary.main,
        borderRadius: '2px',
    },
}));

const StyledCard = styled(Card)(({ theme }) => ({
    height: '100%',
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[4],
    },
}));

const InfoCard = styled(Card)(({ theme }) => ({
    background: theme.palette.background.default,
    marginBottom: theme.spacing(3),
}));

const InfoValue = styled(Typography)(({ theme }) => ({
    fontSize: '1.1rem',
    fontWeight: 500,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(1),
}));

const InfoLabel = styled(Typography)(({ theme }) => ({
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(0.5),
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
    marginTop: theme.spacing(4),
    borderRadius: theme.shape.borderRadius,
    '& .MuiTableCell-head': {
        backgroundColor: theme.palette.grey[100],
        fontWeight: 600,
    },
    '& .MuiTableRow-root:hover': {
        backgroundColor: theme.palette.action.hover,
    },
}));

const UploadButton = styled(Button)(({ theme }) => ({
    marginTop: theme.spacing(3),
    padding: theme.spacing(1.5, 3),
    borderRadius: theme.shape.borderRadius,
    textTransform: 'none',
    fontWeight: 600,
}));



export const PageBollettazioneBlockchain: React.FC = () => {
    // Stati per i dati di fatturazione
    const [billings, setBillings] = useState<Billing[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    // Stati per dati blockchain
    const [space, setSpace] = useState<number>(0);
    const [funds, setFunds] = useState<number>(0);

    // Stati UI
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
    const [password, setPassword] = useState<string>('');

    // Stati notifiche
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [infoMessage, setInfoMessage] = useState<string | null>(null);

    // Computed properties per le fatture correnti
    const lastBilling = useMemo<Billing | undefined>(
        () => billings.find(b => b.status === 'Pagato'),
        [billings]
    );

    const nextBilling = useMemo<Billing | undefined>(() => {
        if (!lastBilling) { return undefined };

        const nextDate = new Date(lastBilling.date);
        nextDate.setMonth(nextDate.getMonth() + 1);

        return {
            date: nextDate,
            amount: 0, // Questo verrà calcolato in base ai dati reali
            consumption: 0, // Questo verrà calcolato in base ai dati reali
            status: 'In corso'
        };
    }, [lastBilling]);

    const getLocalStorageTransactions = () => {
        const transactions = JSON.parse(localStorage.getItem("transactions") || "null");
        if (transactions && transactions.length > 0) {
            // Converti le date delle transazioni in oggetti Date
            return transactions.map((transaction: Transaction) => ({
                ...transaction,
                date: new Date(transaction.date) // Converti la stringa in Date
            }));
        }
        // Se non ci sono dati, ritorna un array con una registrazione di default
        return [
            {
                date: new Date(Date.now() - 24 * 60 * 60 * 1000),
                hash: 'qz5dmxrou6i7suulmn9mqe...',
                status: 'Completata'
            }
        ];
    };
    

    // Funzione per salvare le transazioni attuali nel localStorage
    const saveLocalStorageTransactions = (transactions: Array<Transaction>) => {
        localStorage.setItem("transactions", JSON.stringify(transactions));
    };

    // Effect per caricare i dati iniziali
    useEffect(() => {
        const loadBlockchainData = async () => {
            try {
                const [blockNumber, balance] = await Promise.all([
                    getBlockNumber(),
                    getBalance()
                ]);

                setSpace(blockNumber);
                setFunds(balance);

                // Carica i dati di esempio (da sostituire con dati reali)
                setBillings([
                    {
                        date: new Date(),
                        amount: 150.00,
                        consumption: 1200,
                        status: 'Da pagare'
                    },
                    {
                        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                        amount: 145.00,
                        consumption: 1150,
                        status: 'Pagato'
                    }
                ]);

                // Carica le transazioni dal localStorage o una di default se vuoto
                setTransactions(getLocalStorageTransactions());
            } catch (err) {
                setErrorMessage('Errore nel caricamento dei dati blockchain');
            }
        };

        void loadBlockchainData();
    }, []);

    // Handler per l'upload dei dati
    const handleUploadData = useCallback(async () => {
        try {
            const result = await processWalletTransaction();

            if (result.success) {
                setSuccessMessage('Transazione completata con successo');
                setIsPasswordModalOpen(false);
                setPassword('');

                // Aggiorna le transazioni con la nuova
                if (result.transactionHash) {
                    setTransactions(prevTransactions => {
                        const updatedTransactions : Array<Transaction> = [{
                            date: new Date(),
                            hash: result.transactionHash,
                            status: 'Completata'
                        }, ...prevTransactions];

                        // Salva l'aggiornamento nel localStorage
                        saveLocalStorageTransactions(updatedTransactions);
                        return updatedTransactions;
                    });
                }

                setSpace(await getBlockNumber());
                setFunds(await getBalance());
            } else {
                setErrorMessage(result.message);
            }
        } catch (err) {
            setErrorMessage('Errore durante l\'upload dei dati');
        }
    }, []);


    // Handler per la chiusura delle notifiche
    const handleCloseSuccess = useCallback(() => setSuccessMessage(null), []);
    const handleCloseError = useCallback(() => setErrorMessage(null), []);
    const handleCloseInfo = useCallback(() => setInfoMessage(null), []);

    // Handler per il modale
    const handleOpenPasswordModal = useCallback(() => setIsPasswordModalOpen(true), []);
    const handleClosePasswordModal = useCallback(() => setIsPasswordModalOpen(false), []);
    const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    }, []);

    // Formattatore date
    const formatDate = useCallback((date: Date): string => {
        return date.toLocaleDateString('it-IT');
    }, []);

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <img src={logo} width="300"/>
            </div>
            <Grid container spacing={4}>
                {/* Sezione Cliente */}
                <Grid item xs={12} md={8}>
                    <SectionTitle variant="h4">
                        CLIENTE
                    </SectionTitle>

                    <Grid container spacing={3}>
                        {/* Ultima Fattura */}
                        <Grid item xs={12} md={6}>
                            <StyledCard>
                                <CardContent sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom fontWeight="600">
                                        Ultima Fattura
                                    </Typography>
                                    {lastBilling && (
                                        <Box sx={{ mt: 2 }}>
                                            <InfoLabel>Data</InfoLabel>
                                            <InfoValue>{formatDate(lastBilling.date)}</InfoValue>

                                            <InfoLabel>Importo pagato</InfoLabel>
                                            <InfoValue>€{lastBilling.amount.toFixed(2)}</InfoValue>

                                            <InfoLabel>Consumo</InfoLabel>
                                            <InfoValue>{lastBilling.consumption} kW/h</InfoValue>
                                        </Box>
                                    )}
                                </CardContent>
                            </StyledCard>
                        </Grid>

                        {/* Prossima Fattura */}
                        <Grid item xs={12} md={6}>
                            <StyledCard>
                                <CardContent sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom fontWeight="600">
                                        Prossima Fattura
                                    </Typography>
                                    {nextBilling && (
                                        <Box sx={{ mt: 2 }}>
                                            <InfoLabel>Data prevista</InfoLabel>
                                            <InfoValue>{formatDate(nextBilling.date)}</InfoValue>

                                            <InfoLabel>Importo stimato</InfoLabel>
                                            <InfoValue>€{nextBilling.amount.toFixed(2)}</InfoValue>

                                            <InfoLabel>Consumo attuale</InfoLabel>
                                            <InfoValue>{nextBilling.consumption} kW/h</InfoValue>
                                        </Box>
                                    )}
                                </CardContent>
                            </StyledCard>
                        </Grid>
                    </Grid>

                    {/* Tabella Fatturazioni */}
                    <StyledTableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Data</TableCell>
                                    <TableCell>Consumo</TableCell>
                                    <TableCell>Importo</TableCell>
                                    <TableCell>Stato</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {billings.map((billing, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{formatDate(billing.date)}</TableCell>
                                        <TableCell>{billing.consumption} kW/h</TableCell>
                                        <TableCell>€{billing.amount.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Box
                                                sx={{
                                                    color: billing.status === 'Pagato' ? 'success.light' : 'warning.light',
                                                    py: 0.5,
                                                    px: 1.5,
                                                    borderRadius: 1,
                                                    display: 'inline-block',
                                                    fontSize: '0.875rem',
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {billing.status}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </StyledTableContainer>
                </Grid>

                {/* Sezione Gestore */}
                <Grid item xs={12} md={4}>
                    <SectionTitle variant="h4">
                        GESTORE
                    </SectionTitle>

                    <InfoCard elevation={0}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom fontWeight="600">
                                Info
                            </Typography>

                            <Box sx={{ mt: 2 }}>
                                <InfoLabel>Spazio disponibile</InfoLabel>
                                <InfoValue>{space} nodi</InfoValue>

                                <InfoLabel>Fondi disponibili</InfoLabel>
                                <InfoValue>{funds} MATIC</InfoValue>

                                <UploadButton
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    onClick={handleOpenPasswordModal}
                                >
                                    Forza upload dati
                                </UploadButton>
                            </Box>
                        </CardContent>
                    </InfoCard>

                    {/* Tabella Transazioni */}
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h6" gutterBottom fontWeight="600">
                            Storico transazioni
                        </Typography>

                        <StyledTableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Data</TableCell>
                                        <TableCell>Hash</TableCell>
                                        <TableCell>Stato</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {transactions.map((transaction, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{formatDate(transaction.date)}</TableCell>
                                            <TableCell>
                                                <Typography noWrap sx={{ maxWidth: 150 }}>
                                                    {transaction.hash}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box
                                                    sx={{
                                                        color: transaction.status === 'Completata' ? 'success.light' : 'warning.light',
                                                        py: 0.5,
                                                        px: 1.5,
                                                        borderRadius: 1,
                                                        display: 'inline-block',
                                                        fontSize: '0.875rem',
                                                        fontWeight: 500,
                                                    }}
                                                >
                                                    {transaction.status}
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </StyledTableContainer>
                    </Box>
                </Grid>
            </Grid>

            {/* Modal Password */}
            <Dialog open={isPasswordModalOpen} onClose={handleClosePasswordModal}>
                <DialogTitle>Inserisci Password</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        type="password"
                        fullWidth
                        value={password}
                        onChange={handlePasswordChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClosePasswordModal}>Annulla</Button>
                    <Button onClick={handleUploadData} color="primary">
                        Conferma
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Notifiche */}
            <Snackbar
                open={!!successMessage}
                autoHideDuration={4000}
                onClose={handleCloseSuccess}
            >
                <Alert severity="success" variant="filled" onClose={handleCloseSuccess}>
                    {successMessage}
                </Alert>
            </Snackbar>

            <Snackbar
                open={!!errorMessage}
                autoHideDuration={4000}
                onClose={handleCloseError}
            >
                <Alert severity="error" variant="filled" onClose={handleCloseError}>
                    {errorMessage}
                </Alert>
            </Snackbar>

            <Snackbar
                open={!!infoMessage}
                autoHideDuration={4000}
                onClose={handleCloseInfo}
            >
                <Alert severity="info" variant="filled" onClose={handleCloseInfo}>
                    {infoMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
};
