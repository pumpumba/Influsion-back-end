module.exports = {
  getChannel: function(auth, youtube, channel_id, callback) {
    getChannel(auth, youtube, channel_id, callback);
  },
  getChannelUsername: function(auth, youtube, username, callback) {
      getChannelUsername(auth, youtube, username, callback);
  },
  getVideos: function(auth, youtube, channel_id, count, callback) {
      getVideos(auth, youtube, channel_id, count, callback);
  },
  getVideosUsername: function(auth, youtube, username, count, callback) {
   getChannelUsername(auth, youtube, username, (result) => {
     getVideos(auth, youtube, result.channel_id, count, (result) => {
       callback(result);
     });
   });
 }
};

function getChannel(auth, youtube, channelID, callback) {
  youtube.channels.list(
    {
      auth: auth,
      part: "snippet, statistics",
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

function getChannelUsername(auth, youtube, username, callback) {
  youtube.channels.list(
    {
      auth: auth,
      part: "snippet, statistics",
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

function getVideos(auth, youtube, channel_id, count, callback) {
  youtube.search.list(
  {
    auth: auth,
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
    "channel_created_at": (new Date(channel.snippet.publishedAt)).toISOString(),
    "channel_thumbnail_url": channel.snippet.thumbnails.high.url,
    "channel_url": "https://www.youtube.com/channel/" + channel.id,
    "channel_views": channel.statistics.viewCount,
    "channel_subscribers": channel.statistics.subscribersCount,
    "channel_no_of_videos": channel.statistics.videoCount
  };
}

function formatVideosJson(videos) {
  var formatedVideos = []

  if (Array.isArray(videos)) {

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
        "video_created_at": (new Date(videos[i].snippet.publishedAt).toISOString()),
        "video_thumbnail_url": videos[i].snippet.thumbnails.high.url
      };
      video.channel_url = "https://www.youtube.com/channel/" + video.channel_id;
      video.video_url = "https://www.youtube.com/watch?v=" + video.video_id;

      formatedVideos.push(video);
    }
  }

  return formatedVideos;
}
