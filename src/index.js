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

    
  var lastTweets = []

    for (var i = 0; i < result.length; i++) {
      var tweetObj = {
        "name": result[i].user.name,
        "screen_name": result[i].user.screen_name,
        "text": result[i].text,
        "favorite_count": result[i].favorite_count,
        "retweeted_count": result[i].retweeted_count,
        "created_at": result[i].created_at,
        "hashtags": [],
        "platform": "Twitter"
     };
     for (var j = 0; j < result[i].entities.hashtags.length; j++){
        tweetObj.hashtags.push(result[i].entities.hashtags[j].text)
     }

     lastTweets.push(tweetObj);
    }
    res.json(lastTweets);
    console.log(result);
  });
});

app.listen(port, hostname);
console.log(`Running on http://${hostname}.${port}`);
