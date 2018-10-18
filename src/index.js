const express = require("express");
const twitterNodeMachine = require("./api/twitterNodeMachine");
instagram = require("./api/instagram");
youtube = require("./api/youtube");
const bodyParser = require("body-parser");

const hostname = "0.0.0.0";
const port = 8080;
const app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

var twitterCloudComponent = require("./api/twitterCloudComponent");
app.use("/twitter", twitterCloudComponent);

//Main page routing
app.get("/", (req, res) => {
  res.send(
    "<h1>Hello friends! Welcome to Pumba!</h1> <p> For Instagram API, go to ./api/instagram <br>For Twitter API, go to ./api/twitter <br>For Youtube API, go to ./api/youtube </p>"
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
