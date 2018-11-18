var self = module.exports = {
    popularTweetsLoaded: function(popularTweets) {
        popularTweets.sort(function(a, b) {
            return a.favorite_count - b.favorite_count;
        });
        return popularTweets;
    },
    formatJson: function(tweets) {
        var formatedTweets = [];

        if((Array.isArray(tweets))) {
          for (var i = 0; i < tweets.length; i++) {
            var tweet = {
              "platform": "twitter",
              "userId": tweets[i].user.id,
              "userUrl": "",
              "userName": tweets[i].user.name,
              "userScreenName": tweets[i].user.screen_name,
              "userFollowersCount": tweets[i].user.followers_count,
              "userVerified": tweets[i].user.verified,
              "userProfileImageUrl": tweets[i].user.profile_image_url,
              "tweetId": tweets[i].id_str,
              "tweetText": tweets[i].text,
              "tweetUrl": "",
              "tweetFavoriteCount": tweets[i].favorite_count,
              "tweetRetweetCount": tweets[i].retweet_count,
              "tweetCreatedAt": tweets[i].created_at,
              "tweetHashtags": [],
              "tweetMedia": []
            };
            var textLength = tweet.tweetText.length;
            var urlLength = 'http://t.co'.length;
            if(textLength > urlLength) {
              for(var k = 0; k<(textLength - urlLength - 1);k++) {
                if(tweet.tweetText.substring(k, urlLength + k) == 'http://t.co' || tweet.tweetText.substring(k, urlLength + k + 1) == 'https://t.co') {
                  tweet.tweetText = tweet.tweetText.substring(0, k);
                  break;
                }
              }
            }
            tweet.userUrl = "https://twitter.com/" + tweet.userScreenName;
            tweet.tweetUrl = "https://twitter.com/" + tweet.userScreenName + "/status/" + tweet.tweetId;

            // Add hashtags
            for (var j = 0; j < tweets[i].entities.hashtags.length; j++){
              tweet.tweetHashtags.push(tweets[i].entities.hashtags[j].text)
            }

            // Add media
            if (tweets[i].entities.media != null) {
              if (tweets[i].extended_entities != null) { // Multiple pictures/media
                for (var j = 0; j < tweets[i].extended_entities.media.length; j++){
                  tweet.tweetMedia.push(tweets[i].extended_entities.media[j].media_url);
                }
              } else { // One picture/media
                for (var j = 0; j < tweets[i].entities.media.length; j++){
                  tweet.tweetMedia.push(tweets[i].entities.media[j].media_url);
                }
              }
            }

            // Get the higher res image
            var n = tweet.userProfileImageUrl.lastIndexOf(".");
            var fileType = tweet.userProfileImageUrl.substring(n, tweet.userProfileImageUrl.length);
            tweet.userProfileImageUrl = tweet.userProfileImageUrl.substring(0, n - 7);
            tweet.userProfileImageUrl = tweet.userProfileImageUrl + fileType;

            formatedTweets.push(tweet);
          }
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
