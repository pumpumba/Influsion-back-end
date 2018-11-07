
module.exports = {
  getChannel: function(channel_id, count, callback) {
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
        res.json(result);
        successFlag = true;
      }
    });
  },
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
        res.json(result);
        successFlag = true;
      }
    });
  },
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
        res.json(result);
        successFlag = true;
      }
    });
  },
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
        res.json(result);
        successFlag = true;
      }
    });
 }
};
