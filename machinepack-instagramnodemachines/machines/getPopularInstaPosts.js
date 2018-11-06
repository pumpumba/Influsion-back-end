module.exports = {
  friendlyName: "Get Popular Insta Posts",
  description: "Gets popular instagram posts from a different users",
  extendedDescription:
    "Get content from Instagram by providing API access token, asset type, filter type, filter value and context.",
  inputs: {
    accessToken: {
      example: "djfh48HUIiuUd73y3hhuIsadsagdui7676aksdjfidsojfiKSHFOUSDHFk3k3k3wr23ujdkafhsdjhfjsdhkjfhdskjJKAHSD728237JKJSHFDSFKJSHDJKFHKJDSHJjhdsfoiushfhsdoifhoiuesdoir4isjofois",
      description: "Your Instagram access API token.",
      required: true
    },
    id: {
      example: "73264732487234723",
      description: "Your Instagram business account ID",
      required: true
    },
    screenNames: {
      example: ["katyperry", "joerogan", "biancaingrsso"],
      type: ["string"],
      description: "The Instagram username of the persons you want posts from",
      required: true
    },
    count: {
      example: 20,
      description: "The maximum amount of posts you want",
      required: true
    }
  },

  exits: {
    error: {
      description: "Unexpected error occurred."
    },
    wrongOrNoKey: {
      description: "Invalid or unprovided API key. All calls must have a key."
    },
    success: {
      description: "Returns posts from User",
        /*example: [
        {
        "platform": "Instagram",
        "user_id": 17841400842646374,
        "user_url": "https://instagram.com/katyperry/",
        "user_name": "KATY PERRY",
        "user_screen_name": "katyperry",
        "user_followers_count": 73216816,
        "user_profile_image_url": "https://scontent.xx.fbcdn.net/v/t51.2885-15/42870413_1417674881696339_3629365214727634944_n.jpg?_nc_cat=1&_nc_ht=scontent.xx&oh=9c2ae778284fc823aa64ade17ef0a2f4&oe=5C3CCD81",
        "post_likes" : 12569,
        "post_id": 17923173121229620,
        "post_url": "https://www.instagram.com/p/Bpzm2k1nfkW/",
        "post_text": "Very proud of my COVERGIRL family!",
        "post_created_at": "2018-11-05T17:07:57+0000",
        "post_like_count": 12569,
        "post_media": ["https://scontent.xx.fbcdn.net/v/t50.2886-16/45176402_307530420095856_4365788819924975616_n.mp4?_nc_cat=101&_nc_ht=scontent.xx&oh=0f2269c01e1488af8d3cff5f36eaed8c&oe=5C71E2D1"],
        "post_hashtags": ["COVERGIRLCRUELTYFREE","COVERGIRLMade"]
          ]
        }
      ] */
    }
  },
  fn: function(inputs, exits) {
    var util = require("util");
    var _ = require("lodash");
    //require("dotenv").config({ path: __dirname + "/./../../.env" });
    var formatFunctions = require("../instaDataFormating");
    if (
      _.isUndefined(inputs.id) ||
      _.isUndefined(inputs.accessToken)
    ) {
      return exits.error(
        new Error(
          "Usage error: `Id` and `accessToken` must ALL be provided."
        )
      );
    }

    const client = [];
    client.push(inputs.accessToken);
    client.push(inputs.id);

    formatFunctions.getInstaPostsFromUsers(
      inputs.screenNames,
      inputs.count,
      client,
      result => {
        return exits.success(formatFunctions.popularPostsLoaded(result));
      }
    );
  }
};
