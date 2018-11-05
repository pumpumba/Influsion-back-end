const https = require("https");
require("dotenv").config({ path: __dirname + "/./../../.env" });

const access_token = process.env.INSTAGRAM_ACCESS_TOKEN;
const instagram_id = process.env.INSTAGRAM_ID;

var instagramResponse = "";

module.exports = {
  getInstaPosts: function(username, postCount, callback) {
    getInstaPosts(username, postCount, callback);
  }
};

function getInstaPosts(username, postCount, callback) {

    var url = "https://graph.facebook.com/" + instagram_id + "?fields=business_discovery.username(" + username + "){id, username, name, followers_count, profile_picture_url, media.limit(" + postCount + "){id,permalink,caption,timestamp,like_count,media_url}}&access_token=" + access_token;

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
      "post_id": instagramResponse.business_discovery.media.data[i].id,
      "post_url": instagramResponse.business_discovery.media.data[i].permalink,
      "post_text": instagramResponse.business_discovery.media.data[i].caption,
      "post_created_at": instagramResponse.business_discovery.media.data[i].timestamp,
      "post_like_count": instagramResponse.business_discovery.media.data[i].like_count,
      "post_media": instagramResponse.business_discovery.media.data[i].media_url,
      "post_hashtags": []
    };

    instaPost.user_url = "https://instagram.com/" + instaPost.user_screen_name + "/";

    //get post_hashtags
    var regex = /(?:^|\s)(?:#)([a-zA-Z\d]+)/gm;
    var match;
    while ((match = regex.exec(instaPost.post_text))) {
        instaPost.post_hashtags.push(match[1]);
    }

    //check if user_verified
    // $response = file_get_contents('https://instagram.com/'.katyperry);
    // if (preg_match('/"user":\{"username":"'.katyperry.'",.*?"isVerified":true\},"__path":".*?'.katyperry.'.*?"/s', $response) || preg_match('/<meta content=".*?official.*?account.*?" name="description" \/>/is', $response)) {
    // print "VERIFIED USER!";
    // }



    formatedInstaPosts.push(instaPost);
  }
  return formatedInstaPosts;
}
