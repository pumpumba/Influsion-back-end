//This node machine contains the function call for getting information about a certain instagram account
module.exports = {
  friendlyName: "Get Insta Posts",
  description: "Gets instagram posts from a user",
  extendedDescription:
    "Get content from Instagram by providing API access token, asset type, filter type, filter value and context.",
  inputs: {
    accessToken: {
      example: "djfh48HUIiuUd73y3hhuIsadsagdui7676aksdjfidsojfiKSHFOUSDHFk3k3k3wr23ujdkafhsdjhfjsdhkjfhdskjJKAHSD728237JKJSHFDSFKJSHDJKFHKJDSHJjhdsfoiushfhsdoifhoiuesdoir4isjofois",
      description: "Your Instagram access API token.",
      required: true
    },
    accessId: {
      example: "73264732487234723",
      description: "Your Instagram business account ID",
      required: true
    },
    screenName: {
      example: "katyperry",
      description: "The Instagram username of the person you want posts from",
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
      description: "Returns information about instagram account",
      /*example: {
                "platform": instagram,
                "accountName": "joerogan",
                "followers_count": 23430251,
                "created_at": "Tue Jun 02 20:12:29 +0000 2009",
                "accountUrl": "https://www.instagram.com/joerogan",
                "imageUrl": "https://scontent.xx.fbcdn.net/v/t51.2885-15",
                "verified": true,

            } */
    }
  },
  fn: function(inputs, exits) {
    var util = require("util");
    var _ = require("lodash");
    var formatFunctions = require("../instaDataFormating");
    //If one of the credentials is not given, an error will occur.
    if (
      _.isUndefined(inputs.accessId) ||
      _.isUndefined(inputs.accessToken)
    ) {
      return exits.error(
        new Error(
          "Usage error: `Id` and `accessToken` must ALL be provided."
        )
      );
    }

    //An array with the credentials for calling the api is created.
    const instagramClient = [];
    instagramClient.push(inputs.accessToken);
    instagramClient.push(inputs.accessId);


    formatFunctions.getInstagramAccountInformation(
      inputs.screenName,
      instagramClient,
      result => {
        return exits.success(result);
      }
    );
  }
};
