// Funzione per ottenere un saldo fittizio
async function getBalance() {
    const fakeBalance = 67; // Saldo simulato in MATIC
    console.log(`Fake balance: ${fakeBalance} MATIC`);
    return fakeBalance;
}

// Funzione per ottenere un numero di blocchi fittizio
async function getBlockNumber() {
    const fakeBlockNumber = 63670467; // Numero di blocco simulato
    console.log("Fake block number: " + fakeBlockNumber);
    return fakeBlockNumber;
}

const generateHash = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Funzione per simulare una transazione del wallet
async function processWalletTransaction() {
    const transactionHash = generateHash()
    const message = "Transazione eseguita con successo"

    const transactionData = {
        date: new Date().toLocaleString(),
        hash: transactionHash,
        message: message
    };

    // Aggiungi la transazione alla cronologia nel localStorage
    const history = JSON.parse(localStorage.getItem("transactionHistory") || "[]");
    localStorage.setItem("transactionHistory", JSON.stringify([transactionData, ...history]));

    console.log("Fake transaction successful:", transactionData);
    return {
        success: true,
        transactionHash: transactionHash,
        blockNumber: await getBlockNumber(),
        message: message
    };

}

module.exports = { getBalance, getBlockNumber, processWalletTransaction };
