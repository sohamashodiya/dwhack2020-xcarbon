const express = require("express");
const app = express();
var bodyParser = require('body-parser');
var session = require('express-session');
const algoService = require("./algoService.js");
var User = require("./models/user.js");

// const MongoClient = require('mongodb').MongoClient;
// var url = "mongodb://localhost:27017/xcarbon-db";

// var xcarbonDB;

// MongoClient.connect(url, function(err, db) {
//     xcarbonDB = db;
//     if (err) throw err;
//     console.log("Database connected!");
// });


var mongoose = require('mongoose');

//Set up default mongoose connection
var mongoDB = 'mongodb://127.0.0.1/xcarbon-db';
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

//Get the default connection
var xcarbonDB = mongoose.connection;

// var algosdk = require('algosdk');

// const token = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
// const server = "http://127.0.0.1";
// const algoPort = 4001;
// const client = new algosdk.Algod(token, server, algoPort);
// const account1_mnemonic = 'hub cluster burden journey polar mesh element doll recall script glide record critic gorilla range spoon twist army rail present olive sugar memory able iron'; 
// let algodclient = new algosdk.Algod(token, server, algoPort);

// var name = req.query.name;
// var email = req.query.email;
// var address = req.query.address;
// var deviceId = req.query.deviceId;

// var co2 = req.query.co2;
// var deviceId = req.query.deviceId;
// var algoAddress = req.query.algoAddress;
// var latitude = req.query.latitude;
// var longitude = req.query.longitude;
// var time = req.query.time;


app.use("/", express.static(__dirname + '/client'));
app.use("/node_modules", express.static(__dirname + '/node_modules'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('trust proxy', 1);

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));

// Middleware for injecting db
// Access to db is in req.db
// app.use(function(req, res, next) {
//     req.db = xcarbonDB;
//     next();
// })

function checkAuth(req, res, next) {
    if (req.session.user) {
        return true;
    } else {
        return false;
    }
};


app.get("/api/redeemCarbos/:amount", async function(req, res, next) {
    var amount = parseInt(req.params.amount);
    console.log('Doing redeemCarbos...amount = ', amount);
    var accountInfo = await algoService.redeemCarbos(req.session.user.mneumonic, amount);
    res.json({error: null, results: {accountInfo}});
});


app.get("/api/getAccountInfo", async function(req, res, next) {
    console.log('Doing getCarbosBalance...');
    if(req.session.user){
        var accountInfo = await algoService.getAccountInfo(req.session.user.mneumonic);
        res.json({error: null, results: {accountInfo, user: req.session.user}});
    }else{
        res.json({error: 'There is no user in session'});
    }
});


app.get("/api/createAssets", function(req, res, next) {
    console.log('Doing createAssets...');
    algoService.createAssets();
    res.json({error: null});
});


app.get("/api/clearDB", function(req, res, next) {
    User.deleteMany({}, function(err){
        if (err) {
            console.log("Error", err);
        } else {
            res.json({'delete': 'SUCCESS'});
        }
    });
});

app.get("/api/showUsers", function(req, res, next) {
    User.find({}, function(err, users) {
        res.json({users: users});
    });
});

app.get("/api/logout", function(req, res, next){
    req.session.user = undefined;
    res.json({ok: "OK"});
});

app.get("/api/getCurrentUser", function(req, res, next){
    res.json({user: req.session.user});
});

app.post("/api/loginUser", function(req, res, next) {
    var loginUserDetails = req.body.loginUserDetails;
    User.find({email: loginUserDetails.email}, async function(err, arr) {
        if(!err && arr) {
           var user = arr[0]; 
           console.log('Getting loggedin users account into...');
           var accountInfo = await algoService.getAccountInfo(user.mneumonic);
        //   user.accountInfo = accountInfo;
           console.log('User signed in:', user);
           req.session.user = user;
           res.json({error: null, results: { user, accountInfo }});
        }
    });
});

app.post("/api/register", async function(req, res) {
    var registerUserDetails = req.body.registerUserDetails;
    
    // TODO: Create Algorand Account with User Details, then take the address and add it in the user object.
    var algoUser = await algoService.registerUser(registerUserDetails);


    registerUserDetails.address = algoUser.address;
    registerUserDetails.mneumonic = algoUser.mneumonic;
    
    console.log('Registering user:', registerUserDetails);
    
    var user = new User(registerUserDetails);
    
    user.save(async function(error, newUser){
        if(error){
            console.error('Error registering user:', error)            
            res.json({error});
        }else{
            console.log('User is saved:', newUser)
            req.session.user = newUser;
            
            var accountInfo = await algoService.getAccountInfo(algoUser.mneumonic);
            
            var obj = {error: null, results: { user: newUser, accountInfo }};
            console.log(obj);
            res.json(obj);
        }
    })
});

app.post("/api/addMetrics", function(req, res) {
    // metricDetails should look like this:
    // {
    //     "deviceId": "DEVICE ID",
    //     "CO2": "CO2 METRIC",
    //     "latitude": "LATITUDE",
    //     "longitude": "LONGITUDE",
    //     "time": "TIME"
    // }
    
    var metricDetails = req.body.metricDetails;
    
     User.find({deviceId: metricDetails.deviceId}, function(err, arr) {
        if(!err && arr) {
           console.log("ADDRESS is ", arr[0].address);
           //TODO: Use this address to send carbos
            res.json({error: null, address: arr[0].address});
        }else{
           console.log("Error ading metrices");
            res.json({"error": err});
        }
    })
});

app.post("/api/checkoutPrizes", function(req, res) {
    console.log("Total", req.body.total);
    
    res.json({error: null, results: { transaction: "done" }});
});

// app.get("/api/getFakeList", function(req, res) {
//     res.json(['TODO-1', 'TODO-1', 'TODO-2']);
// })


const port = '8080';
app.listen(port);

console.log('Running on port:', port);
