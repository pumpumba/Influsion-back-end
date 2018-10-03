const express = require("express");
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
app.get("/api/instagram", (req, res) => {
  result = instagram.getInsta(result => {
    res.json(result);
  });
});

//Twitter routing

app.get("/api/twitter/search/:username/:count", (req, res) => {
  currentRes = res;
  var data = req.params;
  var number = req.params;
  var obj = twitterNodeMachine.getUserTweets(data.username, number.count, (result) => {
    var text = "";

    for (var i = 0; i < result.length; i++) {
      text = text + result[i].entities.hashtags[0].text;
    }
    res.json(text);
    console.log(result);
  });
});

app.listen(port, hostname);
console.log(`Running on http://${hostname}.${port}`);
