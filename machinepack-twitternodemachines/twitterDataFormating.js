var self = module.exports = {
    popularTweetsLoaded: function(popularTweets) {
        popularTweets.sort(function(a, b) {
            return a.favorite_count - b.favorite_count;
        });
        return popularTweets;
    },

    twitterAccountFormat: function(accountInformation) {
      if(accountInformation != undefined) {
        var imageUrl = profileImageFormat(accountInformation.profile_image_url);
        var regex = /'/gi;
        var jsonContent = JSON.stringify(accountInformation).replace(regex, "''");
        var essentialInformation = {
          "platform" : 'twitter',
          "accountName" : accountInformation.screen_name,
          "followersCount" : accountInformation.followers_count,
          "createdAtUnixTime" : new Date(accountInformation.created_at).getTime(),
          "accountUrl" : 'https://twitter.com/' + accountInformation.screen_name,
          "imageUrl": imageUrl,
          "verified": accountInformation.verified,
          "platformContent": null
        };
      }
      return essentialInformation;
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
            tweet.tweetText = removeLinkInTweetText(tweet);
            if(!(tweet.tweetText != undefined)) {
              tweet.tweetText = tweets[i].text;
            }
            tweet.userUrl = "https://twitter.com/" + tweet.userScreenName;
            tweet.tweetUrl = "https://twitter.com/" + tweet.userScreenName + "/status/" + tweet.tweetId;

            // Add hashtags
            tweet.tweetHashtags = addHashTags(tweets[i]);

            // Add media
            tweet.tweetMedia = addMedia(tweets[i]);

            // Get the higher res image
            tweet.userProfileImageUrl = profileImageFormat(tweet.userProfileImageUrl);
            //Add the tweet to the list of tweets
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
  var profileImageFormat = function(oldImageUrl) {
    var imageUrl = oldImageUrl;
    var n = imageUrl.lastIndexOf(".");
    var fileType = imageUrl.substring(n, imageUrl.length);
    imageUrl = imageUrl.substring(0, n - 7);
    imageUrl = imageUrl + fileType;
    return imageUrl;
  };
  var addHashTags = function(tweet) {
    hashtags = [];
    for (var j = 0; j < tweet.entities.hashtags.length; j++){
      hashtags.push(tweet.entities.hashtags[j].text)
    }
    return hashtags;
  };
  var addMedia = function(tweet) {
    media = [];
    if (tweet.entities.media != null) {
      if (tweet.extended_entities != null) { // Multiple pictures/media
        for (var j = 0; j < tweet.extended_entities.media.length; j++){
          media.push(tweet.extended_entities.media[j].media_url);
        }
      } else { // One picture/media
        for (var j = 0; j < tweet.entities.media.length; j++){
          media.push(tweet.entities.media[j].media_url);
        }
      }
    }
    return media;
  }

  var removeLinkInTweetText = function(tweet) {
    var tweetText;
    var textLength = tweet.tweetText.length;
    var urlLength = '… http://t.co'.length;
    if(textLength > urlLength) {
      for(var k = 0; k<(textLength - urlLength - 1);k++) {
        if(tweet.tweetText.substring(k, urlLength + k) == '… http://t.co' || tweet.tweetText.substring(k, urlLength + k + 1) == '… https://t.co') {
          tweetText = tweet.tweetText.substring(0, k + 2);
          break;
        }
      }
    }
    else {
      tweetText = tweet.tweetText;
    }
    return tweetText;
  }
