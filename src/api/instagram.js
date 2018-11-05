const https = require("https");
require("dotenv").config({ path: __dirname + "/./../../.env" });

const access_token = process.env.INSTAGRAM_ACCESS_TOKEN;
const instagram_id = process.env.INSTAGRAM_ID;

var instagramResponse = "";

module.exports = {
  getInstaPosts: function(username, postCount, callback) {
    getInstaPosts(username, postCount, callback);
  },

  getPopularPosts: function(callback) {
    var popularPosts = [];
    var screen_names = ["joakimlundell", "katyperry"];

    for (var i = 0; i < screen_names.length; i++) {
      getInstaPosts(screen_names[i], 3, (result) => {
        for (var j = 0; j < result.length; j++) {
          popularPosts.push(result[j]);
        }
        // popularPostsLoaded(popularPosts, callback);
      });

    }
    callback(popularPosts);
  }
};

// function popularPostsLoaded(popularPosts, callback) {
//   if (popularPosts.length >= 18) {
//     popularPosts.sort(function(a, b) {
//       return parseFloat(a.business_discovery.followers_count) - parseFloat(b.business_discovery.followers_count);
//   });
//     callback(popularPosts);
//   }
// }

function getInstaPosts(username, postCount, callback) {

    var url = "https://graph.facebook.com/" + instagram_id + "?fields=business_discovery.username(" + username + "){id, username, name, followers_count, profile_picture_url, media.limit(" + postCount + "){id,permalink,caption,children,timestamp,like_count,media_url}}&access_token=" + access_token;

    https
      .get(url, function(res) {
        var body = "";

        res.on("data", function(chunk) {
          body += chunk;
        });

        res.on("end", function() {
          instagramResponse = formatJson(JSON.parse(body));
        });
      })
      .on("error", function(e) {
        console.log("Got an error: ", e);
      });
    callback(instagramResponse);
}

function formatJson(instagramResponse) {
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
      "post_likes" : instagramResponse.business_discovery.media.data[i].like_count,
      "post_id": instagramResponse.business_discovery.media.data[i].id,
      "post_url": instagramResponse.business_discovery.media.data[i].permalink,
      "post_text": instagramResponse.business_discovery.media.data[i].caption,
      "media_url": instagramResponse.business_discovery.media.data[i].media_url,
      "post_created_at": instagramResponse.business_discovery.media.data[i].timestamp,
      "hash_tag" : "",
      "post_carousel" : []
    };

    instaPost.user_url = "https://instagram.com/" + instaPost.user_screen_name + "/";

    //carousel

    // for (var i = 0; i < instagramResponse.business_discovery.media.data[i].children.length; i++) {
    //   console.log("varv " + i + " i children-loopen");
    // }

    formatedInstaPosts.push(instaPost);
  }
  return formatedInstaPosts;
}
