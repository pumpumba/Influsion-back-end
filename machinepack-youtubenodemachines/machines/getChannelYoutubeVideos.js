module.exports = {
  friendlyName: "Get Channel Youtube Videos",
  description: "Get Youtube videos from a channelr",
  extendedDescription:
    "Get content from Youtube by providing...",
  inputs: {
    googleEmail: {
      example: "?",
      description: "The required google private service account email.",
      required: true
    },
    googlePrivateKey: {
      example: "?",
      description: "The required google private service account key.",
      required: true
    },
    channelID: {
      example: "?",
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
    var util = require("util");
    var _ = require("lodash");

    //let privatekey = require("./pumbagoogleprivatekey.json");

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

    // Authenticate request
    jwtClient.authorize(function(err, tokens) {
      if (err) {
        console.log(err);
        return;
      } else {
        console.log("Successfully connected!");
      }
    });

    require("dotenv").load();

    /*
    // Configure a JWT auth client
    let jwtClient = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      null,
      process.env.GOOGLE_PRIVATE_KEY,
      ["https://www.googleapis.com/auth/youtube"]
    );

    // Authenticate request
    jwtClient.authorize(function(err, tokens) {
      if (err) {
        console.log(err);
        return;
      } else {
        console.log("Successfully connected!");
      }
    });
    */

    if (!_.isUndefined(inputs.channelID)) {
      youtubeAPICalls.getVideos(jwtClient, youtube, inputs.channelID, inputs.count, (result) => {
        return exits.success(result);
      });
    } else if (!_.isUndefined(inputs.channelName)) {
      youtubeAPICalls.getVideosUsername(jwtClient, youtube, inputs.channelName, inputs.count, (result) => {
        return exits.success(result);
      });
    } else {
      return exits.error(new Error("Error. A channel ID or a channel name must be provided."));
    }
  }
};
