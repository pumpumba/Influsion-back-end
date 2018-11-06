var self = module.exports = {
    popularPostsLoaded: function(popularPosts) {
        popularPosts.sort(function(a, b) {
            return a.like_count - b.like_count;
        });
        return popularPosts;
    },
    formatJson: function(instagramResponse) {
      var formatedInstaPosts = []

      for (var i = 0; i < instagramResponse.business_discovery.media.data.length; i++) {
        var instaPost = {
          "platform": "Instagram",
          "user_id": instagramResponse.business_discovery.id,
          "user_url": "",
          "user_name": instagramResponse.business_discovery.name,
          "user_screen_name": instagramResponse.business_discovery.username,
          "user_followers_count": instagramResponse.business_discovery.followers_count,
          // "user_verified": instagramResponse[i].user.verified,
          "user_profile_image_url": instagramResponse.business_discovery.profile_picture_url,
          "post_like_count" : instagramResponse.business_discovery.media.data[i].like_count,
          "post_id": instagramResponse.business_discovery.media.data[i].id,
          "post_url": instagramResponse.business_discovery.media.data[i].permalink,
          "post_text": instagramResponse.business_discovery.media.data[i].caption,
          "post_created_at": instagramResponse.business_discovery.media.data[i].timestamp,
          "post_media": [],
          "post_hashtags": []
        };

        instaPost.user_url = "https://instagram.com/" + instaPost.user_screen_name + "/";

        //get post_hashtags
        var regex = /(?:^|\s)(?:#)([a-zA-Z\d]+)/gm;
        var match;
        while ((match = regex.exec(instaPost.post_text))) {
            instaPost.post_hashtags.push(match[1]);
        }

        if(instagramResponse.business_discovery.media.data[i].children){
          for(var j=0; j < instagramResponse.business_discovery.media.data[i].children.data.length; j++){
            instaPost.post_media.push(instagramResponse.business_discovery.media.data[i].children.data[j].media_url);
          }
        }
        else{
          instaPost.post_media.push(instagramResponse.business_discovery.media.data[i].media_url);
        };

        formatedInstaPosts.push(instaPost);
      }
      return formatedInstaPosts;
    },
    getInstaPostsFromUser: function(username, postCount, access_token, instagram_id, callback) {
      const https = require("https");
      var url = "https://graph.facebook.com/" + instagram_id + "?fields=business_discovery.username(" + username + "){id, username, name, followers_count, profile_picture_url, media.limit(" + postCount + "){id,permalink,caption,timestamp,like_count,media_url, children{media_url}}}&access_token=" + access_token;
      var instagramResponse;

      https
        .get(url, function(res) {
          var body = "";

          res.on("data", function(chunk) {
            body += chunk;
          });

          res.on("end", function() {
            instagramResponse = self.formatJson(JSON.parse(body));
            callback(instagramResponse);
          });
        })
        .on("error", function(e) {
          console.log("Got an error: ", e);
        });
    },
    getInstaPostsFromUsers: function(screen_names, postCount, access_token, instagram_id, callback) {
      var popularPosts = [];
      var pushedCount = 0;
      for (var i = 0; i < screen_names.length; i++) {
        self.getInstaPostsFromUser(screen_names[i], postCount, access_token, instagram_id, (result) => {
          for(var j = 0; j < result.length;j++) {
              popularPosts.push(result[j]);
          }
          pushedCount += 1;
          if(pushedCount == screen_names.length) {
              callback(popularPosts);
          }
        });
      }
    }
  };
