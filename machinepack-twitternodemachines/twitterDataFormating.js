var self = module.exports = {
    popularTweetsLoaded: function(popularTweets) {
        popularTweets.sort(function(a, b) {
            return a.favorite_count - b.favorite_count;
        });
        return popularTweets;
    },
    formatJson: function(tweets) {
        var formatedTweets = []
      
        for (var i = 0; i < tweets.length; i++) {
          var tweet = {
            "platform": "twitter",
            "user_id": tweets[i].user.id,
            "user_url": "",
            "user_name": tweets[i].user.name,
            "user_screen_name": tweets[i].user.screen_name,
            "user_followers_count": tweets[i].user.followers_count,
            "user_verified": tweets[i].user.verified,
            "user_profile_image_url": tweets[i].user.profile_image_url,
            "tweet_id": tweets[i].id_str,
            "tweet_text": tweets[i].text,
            "tweet_url": "",
            "tweet_favorite_count": tweets[i].favorite_count,
            "tweet_retweet_count": tweets[i].retweet_count,
            "tweet_created_at": tweets[i].created_at,
            "tweet_hashtags": [],
            "tweet_media": []
          };
          var textLength = tweet.tweet_text.length;
          var url_length = 'http://t.co'.length;
          if(textLength > url_length) {
            for(var k = 0; k<(textLength - url_length - 1);k++) {
              if(tweet.tweet_text.substring(k, url_length + k) == 'http://t.co' || tweet.tweet_text.substring(k, url_length + k + 1) == 'https://t.co') {
                tweet.tweet_text = tweet.tweet_text.substring(0, k);
                break;
              }
            }
          }
          tweet.user_url = "https://twitter.com/" + tweet.user_screen_name;
          tweet.tweet_url = "https://twitter.com/" + tweet.user_screen_name + "/status/" + tweet.tweet_id;
      
          // Add hashtags
          for (var j = 0; j < tweets[i].entities.hashtags.length; j++){
            tweet.tweet_hashtags.push(tweets[i].entities.hashtags[j].text)
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
    tweet.user_profile_image_url = tweet.user_profile_image_url.substring(0, tweet.user_profile_image_url.length - 11);
    tweet.user_profile_image_url = tweet.user_profile_image_url + fileType;
      
          formatedTweets.push(tweet);
        }
        return formatedTweets;
    },
    getTweetsFromUser: function(userScreenName, tweetCount, client, callback) {
        client.get(
          "/statuses/user_timeline",
          { screen_name: userScreenName, count: tweetCount },
          function(error, tweets, response) {
            var formatedTweets = self.formatJson(tweets);
            callback(formatedTweets);
          }
        );
    },
    getTweetsFromUsers: function(userScreenNames, tweetCount, client, callback) {
        var popularTweets = [];
        var pushedCount = 0;
        for (var i = 0; i < userScreenNames.length; i++) {
          self.getTweetsFromUser(userScreenNames[i], tweetCount, client, (result) => {
            for(var j = 0; j < result.length;j++) {
                popularTweets.push(result[j]);
            }
            pushedCount += 1;
            if(pushedCount == userScreenNames.length) {
                callback(popularTweets);
            }
          });
        }
    }
  };