var algosdk = require('algosdk');
// var util = require('util');

// const token = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
// const server = "http://127.0.0.1";
// const port = 4002;

const token = "ef920e2e7e002953f4b29a8af720efe8e4ecc75ff102b165e0472834b25832c1";
const server = "http://hackathon.algodev.network";
const port = 9100;

const client = new algosdk.Algod(token, server, port);
let algodclient = new algosdk.Algod(token, server, port);


// account1_mnemonic = VLZNIP5AHWPHF2DOLYNRWLBLTWP4IASTXKKFJB2T2QWTMSATDJJS2MX7SU
var account1_mnemonic = "angry outside egg prison captain lobster shield another behave ketchup crew solution deal fine shock lab copy unique fat aisle trick injury beef about mirror";
var account2_mnemonic = "private reunion virtual once shop giant area hill gift song omit below alert error relief explain decorate chief enroll faint base story circle abstract announce"
var account3_mnemonic = "flower expire clutch neither method immense loan vendor note claw inmate middle party ripple stereo rely pole gold creek merit meat year brown abandon amazing"
var recoveredAccount1 = algosdk.mnemonicToSecretKey(account1_mnemonic);
var recoveredAccount2 = algosdk.mnemonicToSecretKey(account2_mnemonic);
var recoveredAccount3 = algosdk.mnemonicToSecretKey(account3_mnemonic);
console.log('recoveredAccount1.addr: ', recoveredAccount1.addr);
console.log('recoveredAccount2.addr: ', recoveredAccount2.addr);
console.log('recoveredAccount3.addr: ', recoveredAccount3.addr);
// console.log('recoveredAccount3.sk: ', recoveredAccount3.sk);

var assetID = 185903;

// Structure for changing blockchain params
var cp = {
    fee: 0,
    firstRound: 0,
    lastRound: 0,
    genID: "",
    genHash: ""
}

//Utility function to update params from blockchain
var getChangingParms = async function(algodclient) {
    let params = await algodclient.getTransactionParams();
    cp.firstRound = params.lastRound;
    cp.lastRound = cp.firstRound + parseInt(1000);
    let sfee = await algodclient.suggestedFee();
    cp.fee = sfee.fee;
    cp.genID = params.genesisID;
    cp.genHash = params.genesishashb64;
}

// Function used to wait for a tx confirmation
var waitForConfirmation = async function(algodclient, txId) {
    while (true) {
        b3 = await algodclient.pendingTransactionInformation(txId);
        if (b3.round != null && b3.round > 0) {
            //Got the completed Transaction
            console.log("Transaction " + b3.tx + " confirmed in round " + b3.round);
            break;
        }
    }
};


async function giveCarbos() {
    // Transfer New Asset:
    sender = recoveredAccount1.addr;
    recipient = recoveredAccount3.addr;
    revocationTarget = undefined;
    closeRemainderTo = undefined;
    // amount of the asset to transfer
    amount = 1;

    // update changing transaction parameters
    await getChangingParms(algodclient);

    // signing and sending "txn"
    let xtxn = algosdk.makeAssetTransferTxn(sender, recipient,
        closeRemainderTo, revocationTarget, cp.fee, amount,
        cp.firstRound, cp.lastRound, note, cp.genHash, cp.genID, assetID);
    // Must be signed by the account sending the asset  
    rawSignedTxn = xtxn.signTxn(recoveredAccount1.sk)
    let xtx = (await algodclient.sendRawTransaction(rawSignedTxn));
    console.log("Transaction : " + xtx.txId);

    // wait for transaction to be confirmed
    await waitForConfirmation(algodclient, xtx.txId);

    // 10 assets listed in the account information
    act = await algodclient.accountInformation(recoveredAccount3.addr);
    console.log("Account Information for: " + JSON.stringify(act.assets));

}



async function giveOneAlgo(account){
    console.log('Giving one Algo to new user account...');
    
    // update changing transaction parameters
    await getChangingParms(algodclient);
    
    let params = await algodclient.getTransactionParams();
    let note = algosdk.encodeObj("Goving initial 1 algo");
    let txn = {
        "from": recoveredAccount1.addr,
        "to": account.addr,
        "fee": cp.fee,
        "amount": 10000000,
        "firstRound": cp.firstRound,
        "lastRound": cp.lastRound,
        "note": note,
        "genesisID": cp.genID,
        "genesisHash": cp.genHash
    };    
    
    let signedTxn = algosdk.signTransaction(txn, recoveredAccount1.sk);
    let txId = signedTxn.txID;
    console.log("Signed transaction with txId: %s", txId);
    
    console.log("Sending one algo tx...");
    await algodclient.sendRawTransaction(signedTxn.blob);
    
    console.log("waitForConfirmation...");
    
    waitForConfirmation(algodclient, txId);
    
    console.log("Sending ond algo tx...DONE");

}

async function registerUser(user) {
    try{
        
        var account = algosdk.generateAccount();
        var mneumonic = algosdk.secretKeyToMnemonic(account.sk);
        const address = account.addr;
    
        const newUser = { address, mneumonic };
        console.log("New registered user: ", newUser);
        
        await giveOneAlgo(account);
        
        await enableUserToAcceptCarbos(account);
    
        return newUser;
    }catch (e) {
        console.error('====ERR1======');
        console.error(e);
    }
}

async function getAccountInfo(mneumonic){
    let account = algosdk.mnemonicToSecretKey(mneumonic);
    console.log("Getting balance for: ", account.addr);
    
    let accountInfo = await algodclient.accountInformation(account.addr);
    let assetIDtxt = assetID + '';
    let carbos = accountInfo.assets[assetIDtxt] ? accountInfo.assets[assetIDtxt].amount : 0;
    var info = {accountInfo, carbos}
    console.log("Account info:", info);
    return info;
}



async function redeemCarbos(mneumonic, carbos) {
    try {
        var account = algosdk.mnemonicToSecretKey(mneumonic);
        console.log("Calling redeemCarbos for user...", account.addr);

        let sender = account.addr;
        let recipient = recoveredAccount1.addr;
        let revocationTarget = undefined;
        let closeRemainderTo = undefined;
        // We are sending 0 of new assets
        var amount = carbos;

        var note = undefined;

        // update changing transaction parameters
        await getChangingParms(algodclient);
        
        
        // signing and sending "txn" allows sender to begin accepting asset specified by assetid
        let opttxn = algosdk.makeAssetTransferTxn(sender, recipient, closeRemainderTo, revocationTarget,
            cp.fee, amount, cp.firstRound, cp.lastRound, note, cp.genHash, cp.genID, assetID);

console.log('1====1');
        // Must be signed by the account wishing to opt in to the asset    
        var rawSignedTxn = opttxn.signTxn(account.sk);
console.log('2====2');
        let opttx = (await algodclient.sendRawTransaction(rawSignedTxn));
        console.log("Transaction : " + opttx.txId);
        // wait for transaction to be confirmed
        await waitForConfirmation(algodclient, opttx.txId);
console.log('3====3');

        console.log('Waiting for tx to confirm...');
        waitForConfirmation(algodclient, opttx.txId)
        console.log('TX confirmed!');
        // the new asset listed in the account information
        // var act = await algodclient.accountInformation(account.addr);
        // console.log("Done, payCarbosForMetricsCollection: " + JSON.stringify(act.assets));
        var accountInfo = getAccountInfo(mneumonic);
        return accountInfo;
    }catch (e) {
        console.error('====ERR======');
        console.error(e);
    }
}


async function payCarbosForMetricsCollection(mneumonic) {
    try {
        
        var account = algosdk.mnemonicToSecretKey(mneumonic);
        console.log("Calling payCarbosForMetricsCollection for user...", account.addr);

        let sender = recoveredAccount1.addr;
        let recipient = account.addr;
        let revocationTarget = undefined;
        let closeRemainderTo = undefined;
        // We are sending 0 of new assets
        var amount = 1;

        var note = undefined;

        // update changing transaction parameters
        await getChangingParms(algodclient);
        
        
        // signing and sending "txn" allows sender to begin accepting asset specified by assetid
        let opttxn = algosdk.makeAssetTransferTxn(sender, recipient, closeRemainderTo, revocationTarget,
            cp.fee, amount, cp.firstRound, cp.lastRound, note, cp.genHash, cp.genID, assetID);

console.log('1====1');
        // Must be signed by the account wishing to opt in to the asset    
        var rawSignedTxn = opttxn.signTxn(recoveredAccount1.sk);
console.log('2====2');
        let opttx = (await algodclient.sendRawTransaction(rawSignedTxn));
        console.log("Transaction : " + opttx.txId);
        // wait for transaction to be confirmed
        await waitForConfirmation(algodclient, opttx.txId);
console.log('3====3');

        // the new asset listed in the account information
        var act = await algodclient.accountInformation(account.addr);
        console.log("Done, payCarbosForMetricsCollection: " + JSON.stringify(act.assets));
    }catch (e) {
        console.error('====ERR======');
        console.error(e);
    }
}


async function enableUserToAcceptCarbos(userAccount) {
    try {
        // var userAccount = algosdk.mnemonicToSecretKey(user.mneumonic);
        console.log("Calling enableUserToAcceptCarbos for new user...", userAccount.addr);

        // Opting in to an Asset:
        // Transaction from and sender must be the same
        // let sender = recoveredAccount3.addr;
        let sender = userAccount.addr;
        let recipient = sender;
        let revocationTarget = undefined;
        let closeRemainderTo = undefined;
        // We are sending 0 of new assets
        var amount = 0;

        var note = undefined;

        // update changing transaction parameters
        await getChangingParms(algodclient);
        
        
        // signing and sending "txn" allows sender to begin accepting asset specified by assetid
        let opttxn = algosdk.makeAssetTransferTxn(sender, recipient, closeRemainderTo, revocationTarget,
            cp.fee, amount, cp.firstRound, cp.lastRound, note, cp.genHash, cp.genID, assetID);

console.log('1====1');
        // Must be signed by the account wishing to opt in to the asset    
        var rawSignedTxn = opttxn.signTxn(userAccount.sk);
console.log('2====2');
        let opttx = (await algodclient.sendRawTransaction(rawSignedTxn));
        console.log("Transaction : " + opttx.txId);
        // wait for transaction to be confirmed
        await waitForConfirmation(algodclient, opttx.txId);
console.log('3====3');

        // the new asset listed in the account information
        var act = await algodclient.accountInformation(userAccount.addr);
        console.log("Done, enableUserToAcceptCarbos: " + JSON.stringify(act.assets));
    }
    catch (e) {
        console.error('====ERR======');
        console.error(e);
    }
}

function createAssets() {

    (async() => {
        console.log('Doing createAssets');
        await getChangingParms(algodclient);
        console.log('recoveredAccount1.addr', recoveredAccount1.addr);
        let note = undefined;

        // create the asset
        let addr = recoveredAccount1.addr;
        let defaultFrozen = false;
        let totalIssuance = 100000;
        let unitName = 'Carbos';
        let assetName = 'CarbonCoins';
        let assetURL = "http://someurl";
        let assetMetadataHash = "16efaa3924a6fd9d3a4824799a4ac65d";
        let manager = recoveredAccount2.addr;
        let reserve = recoveredAccount2.addr;
        let freeze = recoveredAccount2.addr;
        let clawback = recoveredAccount2.addr;
        let decimals = 0;

        console.log("Signing and sending txn allows addr to create an asset...");
        // signing and sending "txn" allows "addr" to create an asset
        let txn = algosdk.makeAssetCreateTxn(addr, cp.fee, cp.firstRound, cp.lastRound, note,
            cp.genHash, cp.genID, totalIssuance, decimals, defaultFrozen, manager, reserve, freeze, clawback,
            unitName, assetName, assetURL, assetMetadataHash);

        let rawSignedTxn = txn.signTxn(recoveredAccount1.sk)
        let tx = (await algodclient.sendRawTransaction(rawSignedTxn));
        console.log("Transaction ID that creates the asset: " + tx.txId);

        console.log("Wait for transaction to be confirmed and get the assetid");
        // wait for transaction to be confirmed and get the assetid
        await waitForConfirmation(algodclient, tx.txId);
        let ptx = await algodclient.pendingTransactionInformation(tx.txId);
        assetID = ptx.txresults.createdasset;

        console.log('New assetID:', assetID);
    })().catch(e => {
        console.log(e);
        console.trace();
    });

}

module.exports = {
    createAssets,
    registerUser,
    enableUserToAcceptCarbos,
    payCarbosForMetricsCollection,
    getAccountInfo,
    redeemCarbos
};
