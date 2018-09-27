const express = require("express");
const Twitter = require("machinepack-twitter");
const twitterNodeMachine = require("./api/twitterNodeMachine");
instagram = require("./api/instagram");
youtube = require("./api/youtube");

const hostname = "0.0.0.0";
const port = 8080;
const app = express();

//Main page routing
app.get("/", (req, res) => {
  res.send(
    "Hello! For Instagram API, go to ./api/instagram.For Twitter API, go to ./api/twitter"
  );
});

//Youtube routing
app.get("/api/youtube", (req, res) => {
  youtube.getYoutube(result => {
    res.json(result);
  });
});

//Instagram routing
var currentRes;
app.get("/api/instagram", (req, res) => {
  currentRes = res;
  result = instagram.getInsta(result => {
    res.json(result);
  });
});

//Twitter routing
var currentRes;
function myCallback(result) {
  len = result.length;
  var i;
  var text = "";
  for (i = 0; i < len; i++) {
    text += result[i].text + "\n";
  }
  currentRes.send(text);
}
//var hello = twitterNodeMachine.getUserTweets('elonmusk', 10, myCallback);
//var obj2 = twitterNodeMachine.getTweet(44196397, myCallback);

app.get("/api/twitter", (req, res) => {
  currentRes = res;
  var obj = twitterNodeMachine.getUserTweets("elonmusk", 10, myCallback);
});

app.listen(port, hostname);
console.log(`Running on http://${hostname}.${port}`);
