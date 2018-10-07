var self = module.exports = {
    popularTweetsLoaded: function(popularTweets) {
        popularTweets.sort(function(a, b) {
            return a.favorite_count - b.favorite_count;
        });
        console.log("Popular: ");
        console.log(popularTweets[0]);
        return popularTweets;
    },
    formatJson: function(tweets) {
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
          console.log("One formatted tweet: ");
          console.log(tweet);
        }
        console.log('Finished formated tweets list: ');
        console.log(formatedTweets);
        return formatedTweets;
    },
    getTweetsFromUser: function(username, tweetCount, client, callback) {
        client.get(
          "/statuses/user_timeline",
          { screen_name: username, count: tweetCount },
          function(error, tweets, response) {
            var formatedTweets = self.formatJson(tweets);
            callback(formatedTweets);
          }
        );
    },
    getTweetsFromUsers: function(screen_names, tweetCount, client, callback) {
        var popularTweets = [];
        var pushedCount = 0;
        for (var i = 0; i < screen_names.length; i++) {
          self.getTweetsFromUser(screen_names[i], tweetCount, client, (result) => {
            console.log("name: " + screen_names[i]);
            console.log("Tweets from one user: ");
            console.log(result);
            for(var j = 0; j < result.length;j++) {
                popularTweets.push(result[j]);
            }
            pushedCount += 1;
            if(pushedCount == screen_names.length) {
                console.log(popularTweets);
                callback(popularTweets);
            }
          });
        }
    }
  };