const algoService = require("./algoService.js");



// var address = 'T33XTPGDQXDIL5NA2WZZ6R4BZYERFOZYJ7DSXUAU2MUK65WB2MKM2TLEYY';
var address = '6CGEB5UICQHNNU4Q2TWFM4HJH5COPIAO4WITQTVZNI4XKSEUON2CP6TDQE';
// var address = 'T33XTPGDQXDIL5NA2WZZ6R4BZYERFOZYJ7DSXUAU2MUK65WB2MKM2TLEYY';


// algoService.createAssets();
// algoService.enableUserToAcceptCarbos(address);
// algoService.registerUser({})


var mneumonic = "jazz tuition cupboard warfare sphere stock zero drill easy cousin saddle wish theme slab artwork tragic maze upset remain hamster wealth word eight able party";

algoService.payCarbosForMetricsCollection(mneumonic);

//algoService.redeemCarbos(mneumonic, 1);



// (async () => {
//     var info = await algoService.getAccountInfo(mneumonic);
//     console.log(info);
// })();
