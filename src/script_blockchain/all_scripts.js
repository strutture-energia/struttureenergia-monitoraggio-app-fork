const Web3 = require("web3");

//Costanti
const web3 = new Web3("https://mainnet.polygon.managedblockchain.us-east-1.amazonaws.com/?billingtoken=OVPnodjeZv-c425Ow-_PFgH2uJYJvXOEaxFLuxGeU1");
const address = '0xC4601797968ee55D5F64313c543e4A33730eE2ef';

//Funzione per ottenere il saldo rimanente
async function getBalance() {
    try {
        const balance = await web3.eth.getBalance(address);
        console.log(`Balance of address ${address} is: ${web3.utils.fromWei(balance, 'ether')} MATIC`);
        return web3.utils.fromWei(balance, 'ether')
    } catch (error) {
        console.error("Error fetching balance:", error.message);
        return 0
    }
}

// Inizializza Web3 direttamente con l'URL del provider
async function getBlockNumber() {
    try{
        const blockNumber = await web3.eth.getBlockNumber();
        console.log("Number of blocks: " + blockNumber)
        return blockNumber
    } catch (error) {
        console.error("Error fetching block number:", error.message)
        return 0
    }
}


// Funzione principale per gestire le operazioni del wallet
async function processWalletTransaction() {
    let privateKey = "5b4e8f81ce3c56317007d99ee4ebdfedfe2b9b194da54b91fd0f50eedf325339"; // Cambia in modo appropriato

    if (privateKey.startsWith('0x')) {
        privateKey = privateKey.slice(2);
    }

    if (privateKey.length !== 64) {
        console.error("Private key must be 32 bytes (64 characters) long.");
        return { success: false, message: `Lunghezza della chiave privata non valida. (lunghezza: ${privateKey.length})` };
    }

    let walletAddress;
    try {
        walletAddress = web3.eth.accounts.privateKeyToAccount('0x' + privateKey).address;
    } catch (error) {
        console.error("Invalid private key:", error.message);
        return { success: false, message: "Chiave privata invalida." };
    }

    const balance = await getBalance(walletAddress);
    if (balance === null || web3.utils.toBN(balance).isZero()) {
        console.error("Insufficient funds. Please deposit some MATIC to your wallet.");
        return { success: false, message: "Fondi insufficienti." };
    }

    const blockNumber = await getBlockNumber();
    console.log("Current block number:", blockNumber);

    try {
        const wallet = web3.eth.accounts.wallet.add('0x' + privateKey);
        const gasPrice = await web3.eth.getGasPrice();
        if (!gasPrice) {
            console.error("Failed to get gas price.");
            return { success: false, message: "Impossibile trovare il prezzo di gas." };
        }

        const tx = {
            from: wallet.address,
            to: "0x1E67B920828254C5cEBad802877060f1ae1e998F",
            value: web3.utils.toWei("0.001", "ether"),
            gas: 200000,
            gasPrice: gasPrice
        };

        const receipt = await web3.eth.sendTransaction(tx);
        return {
            success: true,
            transactionHash: receipt.transactionHash,
            blockNumber: receipt.blockNumber,
            message: "Transazione eseguita con successo"
        };
    } catch (error) {
        console.error("An error occurred:", error.message);
        return { success: false, message: "Errore: " + error.message };
    }
}



module.exports = {getBalance, getBlockNumber, processWalletTransaction}