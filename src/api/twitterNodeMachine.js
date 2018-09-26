const twit = require("twit");
//Enter your authorisation keys below in the following constants
require("dotenv").load();
// We need this to build our post string
var request = require("request");
const got = require("got");

var Twitter = require("twitter");
var TwitterMP = require("machinepack-twitter");

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
  search: function(query) {
    return TwitterMP.searchTweets({
      q: query,
      consumerKey: consumerKeyPumba,
      consumerSecret: consumerSecretPumba,
      accessToken: accessTokenPumba,
      accessSecret: accessSecretPumba
    }).exec((err, result) => {
      if (err) {
        console.log("Failure at twitter search!");
        console.log(err);
        return res.serverError(err);
      }
      console.log("Success at twitter search!");
      console.log(result);
      return result;
    });
  },
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
      consumer_key: consumerKeyPumba,
      consumer_secret: consumerSecretPumba,
      bearer_token: bearerTokenPumba
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
