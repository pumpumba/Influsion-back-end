//This file contains functions for the instagram graph api.
//They are sorting an array, formating a Json object the way we want it,
//getting content from one user and getting content from several users.
var self = module.exports = {
    //A function that takes an array of Json objects and sorts it by likes.
    popularPostsLoaded: function(popularPosts) {
        popularPosts.sort(function(a, b) {
            return a.like_count - b.like_count;
        });
        return popularPosts;
    },

    instagramAccountFormat: function(accountInformation) {
      console.log(accountInformation);
      if(!(accountInformation.hasOwnProperty("error"))) {
        if((accountInformation.business_discovery.hasOwnProperty("profile_picture_url"))){
        var imageUrl = accountInformation.business_discovery.profile_picture_url;
        var regex = /'/gi;
        var jsonContent = JSON.stringify(accountInformation).replace(regex, "''");
      }
        var essentialInformation = {
          "platform" : 'instagram',
          "accountName" : accountInformation.business_discovery.username,
          "followersCount" : accountInformation.business_discovery.followers_count,
          "createdAtUnixTime": null,
          "accountUrl" : 'https://www.instagram.com/' + accountInformation.business_discovery.username,
          "imageUrl": imageUrl,
          "verified": null,
          "platformContent": null
        };
      }
      return essentialInformation;
    },

    //This function takes the recieved content as an Json object and formats it the way we want it.
    formatJson: function(instagramResponse) {
      var formatedInstaPosts = [];
      if(!(instagramResponse.hasOwnProperty("error"))) { //Taking care of empty posts.
        if((instagramResponse.business_discovery.hasOwnProperty("media"))){
        //Loop through the number of Json objects.
        for (var i = 0; i < instagramResponse.business_discovery.media.data.length; i++) {
          var instaPost = {
            "platform": "instagram",
            "userId": instagramResponse.business_discovery.id,
            "userUrl": "",
            "userName": instagramResponse.business_discovery.name,
            "userScreenName": instagramResponse.business_discovery.username,
            "userFollowersCount": instagramResponse.business_discovery.followers_count,
            "userProfileImageUrl": instagramResponse.business_discovery.profile_picture_url,
            "postLikeCount" : instagramResponse.business_discovery.media.data[i].like_count,
            "postId": instagramResponse.business_discovery.media.data[i].id,
            "postUrl": instagramResponse.business_discovery.media.data[i].permalink,
            "postText": instagramResponse.business_discovery.media.data[i].caption,
            "postCreatedAt": instagramResponse.business_discovery.media.data[i].timestamp,
            "postMedia": [],
            "postHashtags": []
          };

          instaPost.userUrl = "https://instagram.com/" + instaPost.userScreenName + "/";

          //We retrieve the hashtags from a post by going through the posts caption.
          var regex = /(?:^|\s)(?:#)([a-zA-Z\d]+)/gm;
          var match;
          while ((match = regex.exec(instaPost.postText))) {
              instaPost.postHashtags.push(match[1]);
          }

          //If there is a image carousel in the post we get all of the photos, otherwise we
          //just add the single photo.
          if(instagramResponse.business_discovery.media.data[i].children){
            for(var j=0; j < instagramResponse.business_discovery.media.data[i].children.data.length; j++){
              instaPost.postMedia.push(instagramResponse.business_discovery.media.data[i].children.data[j].media_url);
            }
          }
          else{
            instaPost.postMedia.push(instagramResponse.business_discovery.media.data[i].media_url);
          };

          formatedInstaPosts.push(instaPost);
        }
      }
      }
      return formatedInstaPosts;
    },
    //This function gets content from an instagram user by making a call. Takes in a user name,
    //number of posts wanted and the credentials. Returns a Json object of content.
    getInstagramPostsFromUser: function(userName, postCount, instagramClient, callback) {
      const https = require("https");
      //The url we make the call with.
      var url = "https://graph.facebook.com/" + instagramClient[1] + "?fields=business_discovery.username("
                + userName + "){id, username, name, followers_count, profile_picture_url, media.limit("
                + postCount + "){id,permalink,caption,timestamp,like_count,media_url, children{media_url}}}&access_token="
                + instagramClient[0];

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
    //This function gets content from several instagram users by making a call to the function
    //getInstagramPostsFromUser. Takes in an array of user names, number of posts wanted and the credentials.
    //Returns an array of Json objects with content.
    getInstagramPostsFromUsers: function(screenNames, postCount, instagramClient, callback) {
      var popularPosts = [];
      var pushedCount = 0;
      for (var i = 0; i < screenNames.length; i++) {
        self.getInstagramPostsFromUser(screenNames[i], postCount, instagramClient, (result) => {
          for(var j = 0; j < result.length;j++) {
              popularPosts.push(result[j]);
          }
          pushedCount += 1;
          if(pushedCount == screenNames.length) {
              callback(popularPosts);
          }
        });
      }
    },

    getInstagramAccountInformation: function(userName, instagramClient, callback) {
      const https = require("https");
      //The url we make the call with.
      var url = "https://graph.facebook.com/" + instagramClient[1] + "?fields=business_discovery.username("
                + userName + "){username, followers_count, profile_picture_url}&access_token="
                + instagramClient[0];

      var instagramResponse;

      https
        .get(url, function(res) {
          var body = "";

          res.on("data", function(chunk) {
            body += chunk;
          });

          res.on("end", function() {
            instagramResponse = self.instagramAccountFormat(JSON.parse(body));
            callback(instagramResponse);
          });
        })
        .on("error", function(e) {
          console.log("Got an error: ", e);
        });
    }
  };
