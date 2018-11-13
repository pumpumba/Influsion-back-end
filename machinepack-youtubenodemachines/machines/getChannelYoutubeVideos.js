
// The getChannelYoutubeVideos node machine

module.exports = {
  friendlyName: "Get Channel Youtube Videos",
  description: "Get Youtube videos from a channel",
  extendedDescription:
    "Get content from Youtube by providing Google email, Google private key, a channel ID or channel name, and a count of results.",
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
    channelID: {
      example: "UC-lHJZR3Gqxm24_Vd_AJ5Yw",
      description: "The channel ID",
      required: false
    },
    channelName: {
      example: "Pewdiepie",
      description: "The user name of the channel",
      required: false
    },
    count: {
      example: 20,
      description: "The maximum amount of videos you want. Is 5 as default and can max be 50.",
      required: false
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
      description: "Returns youtube videos from channel"
    }
  },
  fn: function(inputs, exits) {
    // Define required variables
    var _ = require("lodash");
    const { google } = require("googleapis");
    var youtubeAPICalls = require("../youtubeAPICalls");
    var privatekey = inputs.googlePrivateKey;
    let youtube = google.youtube("v3");

    // Configure a JWT auth client
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

    // Make sure that either a channel ID or channel name is specified
    if (!_.isUndefined(inputs.channelID)) {
      // Call the getVideos function
      youtubeAPICalls.getVideos(jwtClient, youtube, inputs.channelID, inputs.count, (result) => {
        return exits.success(result);
      });
    } else if (!_.isUndefined(inputs.channelName)) {
      // Call the getVideosUsername function
      youtubeAPICalls.getVideosUsername(jwtClient, youtube, inputs.channelName, inputs.count, (result) => {
        return exits.success(result);
      });
    } else {
      return exits.error(new Error("Error. A channel ID or a channel name must be provided."));
    }
  }
};
