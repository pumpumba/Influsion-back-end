module.exports = {
  friendlyName: "Get User Tweets",
  description: "Gets tweets from a user",
  extendedDescription:
    "Get content from Twitter by providing API bearer token, asset type, filter type, filter value and context.",
  inputs: {
    consumerKey: {
      example: "ODUfdisauPUdufsoUSF",
      description: "Your Twitter consumer API key.",
      required: false
    },
    consumerSecret: {
      example: "ODUfdisauPUdufsoUSF",
      description: "Your Twitter consumer API secret.",
      required: false
    },
    accessToken: {
      example: "ODUfdisauPUdufsoUSF",
      description: "Your Twitter access API token.",
      required: false
    },
    accessSecret: {
      example: "ODUfdisauPUdufsoUSF",
      description: "Your Twitter access API secret.",
      required: false
    },
    bearerToken: {
      example: "ODUfdisauPUdufsoUSF",
      description: "Your Twitter Bearertoken API key.",
      required: false
    },
    userScreenName: {
      example: "elonmusk",
      description: "The Twitter user screen name of person you want tweets from",
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
      description: "Returns tweets from User",
        /*example: {
          "id": 44196397,
          "id_str": "44196397",
          "name": "Elon Musk",
          "screen_name": "elonmusk",
          "location": "",
          "profile_location": null,
          "description": "",
          "url": null,
          "entities": {
              "description": {
                  "urls": []
              }
          },
          "protected": false,
          "followers_count": 23430251,
          "friends_count": 76,
          "listed_count": 47485,
          "created_at": "Tue Jun 02 20:12:29 +0000 2009",
          "favourites_count": 1816,
          "utc_offset": null,
          "time_zone": null,
          "geo_enabled": false,
          "verified": true,
          "statuses_count": 5949,
          "lang": "en",
          "status": "",
          "contributors_enabled": false,
          "is_translator": false,
          "is_translation_enabled": false,
          "profile_background_color": "C0DEED",
          "profile_background_image_url": "http://abs.twimg.com/images/themes/theme1/bg.png",
          "profile_background_image_url_https": "https://abs.twimg.com/images/themes/theme1/bg.png",
          "profile_background_tile": false,
          "profile_image_url": "http://pbs.twimg.com/profile_images/972170159614906369/0o9cdCOp_normal.jpg",
          "profile_image_url_https": "https://pbs.twimg.com/profile_images/972170159614906369/0o9cdCOp_normal.jpg",
          "profile_banner_url": "https://pbs.twimg.com/profile_banners/44196397/1354486475",
          "profile_link_color": "0084B4",
          "profile_sidebar_border_color": "C0DEED",
          "profile_sidebar_fill_color": "DDEEF6",
          "profile_text_color": "333333",
          "profile_use_background_image": true,
          "has_extended_profile": false,
          "default_profile": false,
          "default_profile_image": false,
          "following": null,
          "follow_request_sent": null,
          "notifications": null,
          "translator_type": "none"
      } */
    }
  },
  fn: function(inputs, exits) {
    var util = require("util");
    var _ = require("lodash");
    var request = require("request");
    var Twitter = require("twitter");
    var formatFunctions = require("../twitterDataFormating");
    // If no bearer token was provided, then `consumerKey`, `consumerSecret`,
    // `accessToken`, and `accessSecret` must ALL be provided.
    if (
      _.isUndefined(inputs.bearerToken) &&
      (_.isUndefined(inputs.consumerKey) ||
        _.isUndefined(inputs.consumerSecret) ||
        _.isUndefined(inputs.accessToken) ||
        _.isUndefined(inputs.accessSecret))
    ) {
      return exits.error(
        new Error(
          "Usage error: If `bearerToken` was not provided, then `consumerKey`, `consumerSecret`, `accessToken`, and `accessSecret` must ALL be provided."
        )
      );
    }
    var client = new Twitter({
      consumer_key: inputs.consumerKey,
      consumer_secret: inputs.consumerSecret,
      access_token_key: inputs.accessToken,
      access_token_secret: inputs.accessSecret,
      bearer_token: inputs.bearerToken
    });
    client.get(
        "/users/show",
        { screen_name: inputs.userScreenName },
        function(error, response) {
        var result = response;
        result.status = "";
        return exits.success(formatFunctions.twitterAccountFormat(result));
        }
    );
  }
};