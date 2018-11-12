
module.exports = {
  //Gets a Youtube channel based on the channel id
  getChannel: function(channel_id, callback) {
    require("dotenv").load();
    var YoutubeNodeMachine = require("../../machinepack-youtubenodemachines");

    YoutubeNodeMachine.getChannelYoutube({
      googleEmail: process.env.GOOGLE_CLIENT_EMAIL,
      googlePrivateKey: process.env.GOOGLE_PRIVATE_KEY,
      channelID: channel_id
    }).exec((err, result) => {
      if (err) {
        console.log("Error at getChannelYoutube");
        console.log(err);
      } else {
        callback(result);
        successFlag = true;
      }
    });
  },
  //Gets a Youtube channel based on the channel name
  getChannelUsername: function(username, callback) {
    require("dotenv").load();
    var YoutubeNodeMachine = require("../../machinepack-youtubenodemachines");

    YoutubeNodeMachine.getChannelYoutube({
      googleEmail: process.env.GOOGLE_CLIENT_EMAIL,
      googlePrivateKey: process.env.GOOGLE_PRIVATE_KEY,
      channelName: username
    }).exec((err, result) => {
      if (err) {
        console.log("Error at getChannelYoutube");
        console.log(err);
      } else {
        callback(result);
        successFlag = true;
      }
    });
  },
  //Gets a number of videos from a specified channel based on count (number of videos) and channel id
  getVideos: function(channel_id, count, callback) {
    require("dotenv").load();
    var YoutubeNodeMachine = require("../../machinepack-youtubenodemachines");

    YoutubeNodeMachine.getChannelYoutubeVideos({
      googleEmail: process.env.GOOGLE_CLIENT_EMAIL,
      googlePrivateKey: process.env.GOOGLE_PRIVATE_KEY,
      channelID: channel_id
    }).exec((err, result) => {
      if (err) {
        console.log("Error at getChannelYoutubeVideos");
        console.log(err);
      } else {
        callback(result);
        successFlag = true;
      }
    });
  },
  //Gets a number of videos from a specified channel based on count (number of videos) and channel name
  getVideosUsername: function(username, count, callback) {
    require("dotenv").load();
    var YoutubeNodeMachine = require("../../machinepack-youtubenodemachines");

    YoutubeNodeMachine.getChannelYoutubeVideos({
      googleEmail: process.env.GOOGLE_CLIENT_EMAIL,
      googlePrivateKey: process.env.GOOGLE_PRIVATE_KEY,
      channelName: username
    }).exec((err, result) => {
      if (err) {
        console.log("Error at getChannelYoutubeVideos");
        console.log(err);
      } else {
        callback(result);
        successFlag = true;
      }
    });
 }
};
