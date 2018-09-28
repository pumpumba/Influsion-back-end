//Enter your authorisation keys below in the following constants
require("dotenv").load();
var Twitter = require("twitter");

const consumerKeyPumba = process.env.TWITTER_CONSUMER_KEY;
const consumerSecretPumba = process.env.TWITTER_CONSUMER_SECRET;
const accessTokenPumba = process.env.TWITTER_ACCESS_TOKEN;
const accessSecretPumba = process.env.TWITTER_ACCESS_SECRET;
const bearerTokenPumba = process.env.TWITTER_BEARER_TOKEN;

var client = new Twitter({
  consumer_key: consumerKeyPumba,
  consumer_secret: consumerSecretPumba,
  access_token: accessTokenPumba,
  access_secret: accessSecretPumba,
  bearer_token: bearerTokenPumba
});

module.exports = {
  getUserTweets: function(username, tweetsAmount, callback) {
    var client = new Twitter({
      consumer_key: consumerKeyPumba,
      consumer_secret: consumerSecretPumba,
      bearer_token: bearerTokenPumba
    });
    client.get(
      "/statuses/user_timeline",
      { screen_name: username, count: tweetsAmount },
      function(error, tweets, response) {
        callback(tweets);
      }
    );
  },
  getTweet: function(tweet_id, callback) {
    var client = new Twitter({
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      bearer_token: process.env.TWITTER_BEARER_TOKEN
    });

    var result = client.get("/statuses/show", { id: tweet_id }, function(
      error,
      tweets,
      response
    ) {
      callback(tweets);
    });
  }
};
