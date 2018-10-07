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
  getUserTweets: function(username, tweetCount, callback) {
    getUserTweets(username, tweetCount, callback);
  },
  getPopularTweets: function(callback) {
    var popularTweets = [];
    var screen_names = ["elonmusk", "justinbieber", "barackobama", "potus", "billgates"];

    for (var i = 0; i < screen_names.length; i++) {
      getUserTweets(screen_names[i], 1, (result) => {
        console.log(screen_names[i]);
        popularTweets.push(result);
        popularTweetsLoaded(popularTweets, callback);
      });
    }
  },
};

function popularTweetsLoaded(popularTweets, callback) {
  if (popularTweets.length >= 5) {
    popularTweets.sort(function(a, b) {
      return parseFloat(a.favorite_count) - parseFloat(b.favorite_count);
  });
    callback(popularTweets);
  }
}

function getUserTweets(username, tweetCount, callback) {
  client.get(
    "/statuses/user_timeline",
    { screen_name: username, count: tweetCount },
    function(error, tweets, response) {
      var formatedTweets = formatJson(tweets);
      callback(formatedTweets);
    }
  );
}

function formatJson(tweets) {
  var formatedTweets = []

  for (var i = 0; i < tweets.length; i++) {
    var tweet = {
      "user_id": tweets[i].user.id,
      "name": tweets[i].user.name,
      "screen_name": tweets[i].user.screen_name,
      "text": tweets[i].text,
      "favorite_count": tweets[i].favorite_count,
      "retweet_count": tweets[i].retweet_count,
      "created_at": tweets[i].created_at,
      "hashtags": [],
      "profile_image_url": tweets[i].user.profile_image_url,
      "platform": "Twitter",
      "media": []
    };

    // Add hashtags
    for (var j = 0; j < tweets[i].entities.hashtags.length; j++){
      tweet.hashtags.push(tweets[i].entities.hashtags[j].text)
    }

    // Add media
    /*
    if (tweets[i].enteties.media != null) {
      for (var j = 0; j < tweets[i].entities.media.length; j++){
        tweet.media.push(tweets[i].entities.media[j].media_url)
        console.log(tweets[i].entities.media[j].media_url);
      }
    }
    */

    // Get the higher res image
    var fileType = tweet.profile_image_url.substring(tweet.profile_image_url.length - 4, tweet.profile_image_url.length);
    tweet.profile_image_url = tweet.profile_image_url.substring(0, tweet.profile_image_url.length - 10);
    tweet.profile_image_url = tweet.profile_image_url + "bigger" + fileType;

    formatedTweets.push(tweet);
  }
  return formatedTweets;
}
