
// The getChannelYoutube node machine

module.exports = {
  friendlyName: "Get Channel Information Youtube Videos",
  description: "Get Youtube channel information",
  extendedDescription:
    "Get content from Youtube by providing Google email, Google private key, and a channel ID or channel name.",
  inputs: {
    googleEmail: {
      example: "SERVICE_ACCOUNT_NAME@PROJECT_ID.iam.gserviceaccount.com",
      description: "The required google private service account email.",
      required: true
    },
    googlePrivateKey: {
      example: "vNIXE0xscrmjlyV-12Nj_BvUPaw=",
      description: "The required google private service account key.",
      required: true
    },
    channelName: {
      example: "Pewdiepie",
      description: "The user name of the channel",
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
      description: "Returns youtube channel"
    }
  },
  fn: function(inputs, exits) {
    // Define required variables
    var _ = require("lodash");
    const { google } = require("googleapis");
    var youtubeAPICalls = require("../youtubeAPICalls");
    var privatekey = inputs.googlePrivateKey;
    let youtube = google.youtube("v3");

    // Configure a JWT auth client for autharization
    let jwtClient = new google.auth.JWT(
      inputs.googleEmail,
      null,
      inputs.googlePrivateKey,
      ["https://www.googleapis.com/auth/youtube"]
    );

    // Authenticate
    jwtClient.authorize(function(err, tokens) {
      if (err) {
        console.log(err);
        return;
      } else {
        console.log("Successfully connected!");
      }
    });

    // Make sure that a channel name is specified
    if (!_.isUndefined(inputs.channelName)) {
      // Call the getChannelUsername function
      youtubeAPICalls.getChannelInformationUsername(jwtClient, youtube, inputs.channelName, (result) => {
        return exits.success(result);
      });
    } else {
      return exits.error(new Error("Error. A channel name must be provided."));
    }
  }
};
