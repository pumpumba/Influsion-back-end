const { google } = require("googleapis");
let privatekey = require("./pumbagoogleprivatekey.json");

// Configure a JWT auth client
let jwtClient = new google.auth.JWT(
  privatekey.client_email,
  null,
  privatekey.private_key,
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

let youtube = google.youtube("v3");

module.exports = {
  getChannel: function(channel_id, count, callback) {
    getChannel(channel_id, count, callback);
  },
  getChannelUsername: function(username, callback) {
      getChannelUsername(username, callback);
  },
  getVideos: function(channel_id, count, callback) {
      getVideos(channel_id, count, callback);
  },
  getVideosUsername: function(username, count, callback) {
   getChannelUsername(username, (result) => {
     getVideos(result.channel_id, count, (result) => {
       callback(result);
     });
   });
 }
};

function getChannel(channelID, callback) {
  youtube.channels.list(
    {
      auth: jwtClient,
      part: "snippet",
      order: "date",
      id: channelID,
      maxResults: 1 //integer 0-50, default 5
    },
    function(err, res) {
      if (err) {
        console.log("The API returned an error: " + err);
      } else {
        var formatedChannel = formatChannelJson(res.data.items[0])
        callback(formatedChannel);
      }
    }
  );
}

function getChannelUsername(username, callback) {
  youtube.channels.list(
    {
      auth: jwtClient,
      part: "snippet",
      order: "date",
      forUsername: username,
      maxResults: 1 //integer 0-50, default 5
    },
    function(err, res) {
      if (err) {
        console.log("The API returned an error: " + err);
      } else {
        var formatedChannel = formatChannelJson(res.data.items[0])
        callback(formatedChannel);
      }
    }
  );
}

function getVideos(channel_id, count, callback) {
  youtube.search.list(
  {
    auth: jwtClient,
    part: "snippet",
    order: "date",
    maxResults : count, //integer 0-50, default 5
    channelId: channel_id
  },
  function(err, res) {
    if (err) {
      console.log("The API returned an error: " + err);
    } else {
      var formatedVideos = formatVideosJson(res.data.items);
      callback(formatedVideos);
    }
  }
);
}

function formatChannelJson(channel) {
  return formatedChannel = {
    "channel_id": channel.id,
    "channel_title": channel.snippet.title,
    "channel_description": channel.snippet.description,
    "channel_created_at": channel.snippet.publishedAt,
    "channel_thumbnail_url": channel.snippet.thumbnails.high.url,
    "channel_url": "https://www.youtube.com/channel/" + channel.id
  };
}

function formatVideosJson(videos) {
  var formatedVideos = []

  for (var i = 0; i < videos.length; i++) {
    var video = {
      "platform": "Youtube",
      "channel_id": videos[i].snippet.channelId,
      "channel_url": "",
      "channel_title": videos[i].snippet.channelTitle,
      "video_id": videos[i].id.videoId,
      "video_url": "",
      "video_title": videos[i].snippet.title,
      "video_description": videos[i].snippet.description,
      "video_created_at": videos[i].snippet.publishedAt,
      "video_thumbnail_url": videos[i].snippet.thumbnails.high.url
    };
    video.channel_url = "https://www.youtube.com/channel/" + video.channel_id;
    video.video_url = "https://www.youtube.com/watch?v=" + video.video_id;

    formatedVideos.push(video);
  }
  return formatedVideos;
}
