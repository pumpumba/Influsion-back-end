const express = require("express");
const twitterNodeMachine = require("./api/twitterNodeMachine");
instagram = require("./api/instagram");
youtube = require("./api/youtube");
const { Pool, Client } = require("pg");
const bodyParser = require("body-parser");

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
  result = instagram.getInsta(result => {
    res.json(result);
  });
});

app.get("/db/get_influencer", (req, res) => {
  dbRequest = "SELECT * FROM INFLUENCER";

  client.query(dbRequest, (err, dbResult) => {
    //console.log(err, res);
    res.json(dbResult);
    //client.end();
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
