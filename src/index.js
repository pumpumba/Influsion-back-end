const express = require("express");
const Twitter = require("machinepack-twitter");
const twitterNodeMachine = require("./api/twitterNodeMachine");

const hostname = "0.0.0.0";
const port = 8080;

const app = express();

instagram = require("./api/instagram");

app.get("/", (req, res) => {
  res.send("Hello World\n");
});

app.get("/api/instagram", (req, res) => {
  result = instagram.getInsta(result => {
    res.json(result);
  });
});

var currentRes;

function myCallback(result) {
  len = result.length;
  var i;
  var text = "";
  for (i = 0; i < len; i++) {
    console.log(i);
    text += currentRes.json(result[i].text);
  }
  currentRes.send(text);
}
//var hello = twitterNodeMachine.getUserTweets('elonmusk', 10, myCallback);
//console.log(hello);
//var obj2 = twitterNodeMachine.getTweet(44196397, myCallback);
//console.log(obj);

app.get("/api/twitter", (req, res) => {
  currentRes = res;
  var obj = twitterNodeMachine.getUserTweets("elonmusk", 10, myCallback);
});

app.listen(port, hostname);
console.log(`Running on http://${hostname}.${port}`);