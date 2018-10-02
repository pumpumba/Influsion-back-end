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

app.get("/api/twitter", (req, res) => {
  currentRes = res;
  var obj = twitterNodeMachine.getUserTweets("elonmusk", 10, (result) => {
    len = result.length;
    var i;
    var text = "";
    for (i = 0; i < len; i++) {
      text += result[i].text + "\n";
    }
    res.send(text);
  });
});

app.listen(port, hostname);
console.log(`Running on http://${hostname}.${port}`);
