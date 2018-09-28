//Enter your authorisation keys below in the following constants
require("dotenv").load();
var Twitter = require("twitter");

var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_secret: process.env.TWITTER_ACCESS_SECRET,
  bearer_token: process.env.TWITTER_BEARER_TOKEN
});

module.exports = {
  getUserTweets: function(username, tweetsAmount, callback) {
    client.get(
      "/statuses/user_timeline",
      { screen_name: username, count: tweetsAmount },
      function(error, tweets, response) {
        callback(tweets);
      }
    );
  },
  getTweet: function(tweet_id, callback) {
    var result = client.get("/statuses/show", { id: tweet_id }, function(
      error,
      tweets,
      response
    ) {
      callback(tweets);
    });
  }
};
