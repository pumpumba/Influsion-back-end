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
      "platform": "Twitter",
      "user_id": tweets[i].user.id_str,
      "user_url": "",
      "user_name": tweets[i].user.name,
      "user_screen_name": tweets[i].user.screen_name,
      "user_followers_count": tweets[i].user.followers_count,
      "user_verified": tweets[i].user.verified,
      "user_profile_image_url": tweets[i].user.profile_image_url,
      "tweet_id": tweets[i].id_str,
      "tweet_url": "",
      "tweet_text": tweets[i].text,
      "tweet_created_at": tweets[i].created_at,
      "tweet_favorite_count": tweets[i].favorite_count,
      "tweet_retweet_count": tweets[i].retweet_count,
      "tweet_hashtags": [],
      "tweet_media": []
    };

    tweet.user_url = "https://twitter.com/" + tweet.user_screen_name;
    tweet.tweet_url = "https://twitter.com/" + tweet.user_screen_name + "/status/" + tweet.tweet_id;

    // Add hashtags
    for (var j = 0; j < tweets[i].entities.hashtags.length; j++){
      tweet.tweet_hashtags.push(tweets[i].entities.hashtags[j].text);
    }

    // Add media
    if (tweets[i].entities.media != null) {
      if (tweets[i].extended_entities != null) { // Multiple pictures/media
        for (var j = 0; j < tweets[i].extended_entities.media.length; j++){
          tweet.tweet_media.push(tweets[i].extended_entities.media[j].media_url);
        }
      } else { // One picture/media
        for (var j = 0; j < tweets[i].entities.media.length; j++){
          tweet.tweet_media.push(tweets[i].entities.media[j].media_url);
        }
      }
    }

    // Get the higher res image
    var fileType = tweet.user_profile_image_url.substring(tweet.user_profile_image_url.length - 4, tweet.user_profile_image_url.length);
    tweet.user_profile_image_url = tweet.user_profile_image_url.substring(0, tweet.user_profile_image_url.length - 10);
    tweet.user_profile_image_url = tweet.user_profile_image_url + "bigger" + fileType;

    formatedTweets.push(tweet);
  }
  return formatedTweets;
}
