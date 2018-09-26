const express = require("express");
const Twitter = require("machinepack-twitter");
const twitterNodeMachine = require("./api/twitterNodeMachine");
youtube = require("./api/youtube");
instagram = require("./api/instagram");

const hostname = "0.0.0.0";
const port = 8080;

const app = express();

app.get("/", (req, res) => {
  res.send(
    "Hello! For Instagram API, go to ./api/instagram.For Twitter API, go to ./api/twitter"
  );
});

/* app.get("/api/youtube", (req, res) => {
  //var user = req.params.user;
  youtube.getYoutube((result) => {
    //res.json(result);
    //console.log(result)
    //res.send(result)
    //console.log("Klar!");
    res.send(result);
  });
}); */

//Instagram routing
app.get("/api/instagram", (req, res) => {
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
    console.log(i);
    text += currentRes.json(result[i].text);
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
