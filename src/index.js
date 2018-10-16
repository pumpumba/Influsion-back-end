const express = require("express");
const twitterNodeMachine = require("./api/twitterNodeMachine");
instagram = require("./api/instagram");
youtube = require("./api/youtube");
const { Pool, Client } = require("pg");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const saltRounds = 10; // rounds for hashing. The more, the safer

const hostname = "0.0.0.0";
const port = 8080;
const app = express();

//DATABASE
// pools will use environment variables
// for connection information
const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT
});

pool.query("SELECT NOW()", (err, res) => {
  console.log(err, res);
  pool.end();
});

// clients will also use environment variables
// for connection information
const client = new Client({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT
});
client.connect();

client.query("SELECT NOW()", (err, res) => {
  console.log(err, res);
  //client.end();
});
var twitterCloudComponent = require("./api/twitterCloudComponent");
app.use("/twitter", twitterCloudComponent);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
//ROUTING
//Main page routing
app.get("/", (req, res) => {
  res.send(
    "<h1>Hello! Welcome to Pumba!</h1> <p> For Instagram API, go to ./api/instagram <br>For Twitter API, go to ./api/twitter <br>For Youtube API, go to ./api/youtube </p>"
  );
});

//Youtube routing
app.get("/api/youtube", (req, res) => {
  youtube.getYoutube(result => {
    res.json(result);
  });
});

//Instagram routing
app.get("/api/instagram", (req, res) => {
  var result = instagram.getInsta(result => {
    res.json(result);
  });
});

app.post("/db/alter_user_info", (req,res) => {

});

app.post("/db/create_user", (req, res)=> {

});

app.use(bodyParser.urlencoded({
  extended: true
}))

app.use(bodyParser.json());

//Get all the platform account names for a specific platform
app.post("/db/get_platform_accounts", (req,res) => {
  var inputObj = req.body;
  var platform = inputObj.platform; //TODO: Change to hashed version of password
  var dbRequest = "SELECT ACTNAME AS PLATFORMNAME FROM PLATFORMACCOUNT WHERE PLATFORM = '"+platform+"'";
  client.query(dbRequest, (err, dbResult) => {
    console.log(dbResult); //We get a problem if login is
    var dbResults = dbResult;

    if (dbResults != undefined && dbResults["rowCount"] >= 1) {
      dbResults["retrieveSuccess"] = true;
    } else {
      dbResults = {};
      dbResults["retrieveSuccess"] = false;
    }

    res.json(dbResults);

  });
});
app.post("/db/modify_user", (req,res) => {
  var inputObj = req.body;
  var hashedPwd = inputObj.password; //TODO: Change to hashed version of password
  var usrname = inputObj.username;
  var age = inputObj.age; //TODO: Change to hashed version of password
  var email = inputObj.email;
  var sex = inputObj.sex;
  var usrID = inputObj.usrid;
  console.log(usrID);
  var dbRequest = "UPDATE USR SET HASHEDPWD = '"+hashedPwd+"', age = "+age+", email = '"+email+"', sex = "+sex+" WHERE usrid = "+usrID+";"
  client.query(dbRequest, (err, dbResult) => {
    console.log(dbResult); //We get a problem if login is
    var dbResults = dbResult;

    if (dbResults != undefined && dbResults["rowCount"] == 1) {


      dbResults["updateSuccess"] = true;
    } else if (dbResults == undefined) {
      dbResults = {};
      dbResults["updateSuccess"] = false;

    } else if (dbResults["rowCount"] == 2){
      console.log("2 or more updated. GRAVE ERROR in database.");
    } else {
      dbResults = {};
      dbResults["updateSuccess"] = false;
    }

    res.json(dbResults);

  });
});



app.post("/db/register_user", (req, res)=> {

  var inputObj = req.body;
  var password = inputObj.password; //TODO: Change to hashed version of password
  var usrname = inputObj.username;
  var age = inputObj.age; //TODO: Change to hashed version of password
  var email = inputObj.email;
  var sex = inputObj.sex;

  bcrypt.hash(password, saltRounds, function(err, hash) {
  // Store hash in your password DB.
  var dbRequest = "INSERT INTO USR (USRNAME, HASHEDPWD, EMAIL, AGE, SEX) VALUES ('"+usrname+"', '"+hash+"', '"+email+"', "+age+", "+sex+");"

    client.query(dbRequest, (err, dbResult) => {
      console.log(dbResult); //We get a problem if login is
      console.log(hash)
      var dbResults = dbResult;

      if (dbResults != undefined && dbResults["rowCount"] == 1) {


        dbResults["createSuccess"] = true;
      } else {
        dbResults = {};
        dbResults["createSuccess"] = false;

      }

      res.json(dbResults);
    });
  });

});


app.post("/db/login", (req, res) => {
  var inputObj = req.body;
  //console.log(inputObj.username);
  var password = inputObj.password; //TODO: Change to hashed version of password
  var usrname = inputObj.username;

  var dbRequest = "SELECT * FROM usr WHERE usrname = '"+usrname+"'"
  //var dbRequest = "SELECT * FROM usr WHERE (usrname = '"+usrname+"' AND HASHEDPWD = '"+hashedPwd+"')"

  client.query(dbRequest, (err, dbResult) => {
    var dbResults = dbResult["rows"][0];
    var hashPassword = dbResult["rows"][0].hashedpwd;

    bcrypt.compare(password, hashPassword, function(err, resultCompare) {
      if (resultCompare == true) {
        dbResults["loginSuccess"] = true;
      } else {
        dbResults = {};
        dbResults["loginSuccess"] = false;
      }

      res.json({dbResults});
    });
  });
});

app.get("/db/get_influencer", (req, res) => {
  dbRequest = "SELECT * FROM INFLUENCER";

  client.query(dbRequest, (err, dbResult) => {

    res.json(dbResult["rows"]);

  });
});

// Jesper test av users. Kan/ska tas bort
app.get("/db/get_user", (req, res) => {
  dbRequest = "SELECT * FROM USR";

  client.query(dbRequest, (err, dbResult) => {
    res.json(dbResult["rows"]);

  });

});



//TODO: THIS ONE SHOULD NOT BE GET, IT SHOULD BE POST, RIGHT?
app.get("/db/add_influencer", (req, res) => {
  //db/get_influencer?realname=FilipCornell&Influencer_name=FilipCornell&age=24

  //dbRequest = "INSERT INTO INFLUENCER (INFLUENCERNAME, REALNAME, AGE) VALUES ("++"'Jockiboi', 'Joakim Lundell', 33);";
  dbRequest = "INSERT INTO INFLUENCER (INFLUENCERNAME, REALNAME, AGE) VALUES ('Jockiboi', 'Joakim Lundell', 33);";
  client.query(dbRequest, (err, dbResult) => {
    //console.log(err, res);
    res.json(dbResult);
    //client.end();
  });
});

//Twitter routing
app.get("/api/twitter", (req, res) => {
  var reqType = req["query"]["request_type"];

  if (reqType === "get_user_tweets") {
    var username = req["query"]["username"];
    var tweetCount = req["query"]["count"];

    twitterNodeMachine.getUserTweets(username, tweetCount, result => {
      res.json(result);
    });
  } else if (reqType === "popular") {
    twitterNodeMachine.getPopularTweets(result => {
      res.json(result);
    });
  } else {
    res.send("Error: This request type is not defined");
  }
});

app.listen(port, hostname);
console.log(`Running on http://${hostname}.${port}`);
