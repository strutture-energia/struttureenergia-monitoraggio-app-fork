// Funzione per ottenere un saldo fittizio
async function getBalance() {
    const fakeBalance = parseFloat(localStorage.getItem("fakeBalance")) || 67; // Saldo simulato in MATIC
    const formattedBalance = parseFloat(fakeBalance.toFixed(1)); // Limita a un decimale
    console.log(`Fake balance: ${formattedBalance} MATIC`);
    return formattedBalance;
}

async function updateBalance() {
    let fakeBalance = parseFloat(localStorage.getItem("fakeBalance")) || 67; // Assicurarsi che sia un numero
    const newFakeBalance = Math.max(fakeBalance - 0.7, 0); // Evita valori negativi
    const formattedBalance = parseFloat(newFakeBalance.toFixed(1)); // Limita a un decimale
    localStorage.setItem("fakeBalance", formattedBalance);
    console.log(`Fake balance aggiornato: ${formattedBalance} MATIC`);
}

// Funzione per ottenere un numero di blocchi fittizio
async function getBlockNumber() {
    const fakeBlockNumber = parseInt(localStorage.getItem("fakeBlockNumber")) || 63670467; // Numero di blocco simulato
    console.log("Fake block number: " + fakeBlockNumber);
    return fakeBlockNumber;
}

async function updateBlockNumber() {
    let fakeBlockNumber = parseInt(localStorage.getItem("fakeBlockNumber")) || 63670467; // Assicurarsi che sia un numero
    const decrement = Math.floor(Math.random() * 100000) + 900000;
    const newFakeBlockNumber = Math.max(fakeBlockNumber - decrement, 0); // Evita numeri di blocco negativi
    localStorage.setItem("fakeBlockNumber", newFakeBlockNumber);
    console.log(`Fake block number aggiornato: ${newFakeBlockNumber}`);
}

// Genera un hash casuale per simulare una transazione
const generateHash = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Funzione per simulare una transazione del wallet
async function processWalletTransaction() {
    const transactionHash = generateHash();
    const message = "Transazione eseguita con successo";

    const transactionData = {
        date: new Date().toLocaleString(),
        hash: transactionHash,
        message: message
    };

    // Aggiungi la transazione alla cronologia nel localStorage
    const history = JSON.parse(localStorage.getItem("transactionHistory") || "[]");
    localStorage.setItem("transactionHistory", JSON.stringify([transactionData, ...history]));

    console.log("Fake transaction successful:", transactionData);

    // Aggiorna saldo e numero di blocchi
    await updateBalance();
    await updateBlockNumber();

    return {
        success: true,
        transactionHash: transactionHash,
        blockNumber: await getBlockNumber(),
        message: message
    };
}

module.exports = { getBalance, getBlockNumber, processWalletTransaction };
