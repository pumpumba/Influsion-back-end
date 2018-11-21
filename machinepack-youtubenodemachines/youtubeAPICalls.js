
// This file contains all the functions that the youtube node machines use

module.exports = {
  getChannel: function(auth, youtube, channel_id, callback) { // Get a Youtube channel via channel ID
    getChannel(auth, youtube, channel_id, callback);
  },
  getChannelUsername: function(auth, youtube, username, callback) { // Get a Youtube channel via channel name
      getChannelUsername(auth, youtube, username, callback);
  },
  getChannelInformationUsername: function(auth, youtube, username, callback) { // Get a Youtube channel via channel name
      getChannelInformationUsername(auth, youtube, username, callback);
  },
  getVideos: function(auth, youtube, channel_id, count, callback) { // Get Youtube videos via channel ID
      getVideos(auth, youtube, channel_id, count, callback);
  },
  getVideosUsername: function(auth, youtube, username, count, callback) { // Get Youtube videos via channel name
   getChannelUsername(auth, youtube, username, (result) => { // Get the channel
     if (result === undefined || (Array.isArray(result) && (result.length == 0))) { // Check if a result was not found
       callback([]);
     } else {
       getVideos(auth, youtube, result.channel_id, count, (result) => { // Get the videos
         callback(result);
       });
     }
   });
 }
};

// Get a Youtube channel via channel ID
function getChannel(auth, youtube, channelID, callback) {
  youtube.channels.list( // Call the Youtube API
    {
      auth: auth,
      part: "snippet, statistics",
      order: "date",
      id: channelID,
      maxResults: 1 // Integer 0-50, default 5
    },
    function(err, res) {
      if (err) {
        console.log("The API returned an error: " + err);
      } else {
        if (res.data.items[0] !== undefined) { // Check if a result was found
          var formatedChannel = formatChannelJson(res.data.items[0]) // Format the recieved JSON object
          callback(formatedChannel);
        } else {
            callback([]);
        }
      }
    }
  );
}

// Get a Youtube channel via channel name
function getChannelUsername(auth, youtube, username, callback) {
  youtube.channels.list( // Call the Youtube API
    {
      auth: auth,
      part: "snippet, statistics",
      order: "date",
      forUsername: username,
      maxResults: 1 // Integer 0-50, default 5
    },
    function(err, res) {
      if (err) {
        console.log("The API returned an error: " + err);
      } else {
        if (res.data.items[0] !== undefined) { // Check if a result was found
          var formatedChannel = formatChannelJson(res.data.items[0]) // Format the recieved JSON object
          callback(formatedChannel);
        } else {
          callback([]);
        }
      }
    }
  );
}

// Get a Youtube channel information via channel name
function getChannelInformationUsername(auth, youtube, username, callback) {
  youtube.channels.list( // Call the Youtube API
    {
      auth: auth,
      part: "snippet, statistics",
      order: "date",
      forUsername: username,
      maxResults: 1 // Integer 0-50, default 5
    },
    function(err, res) {
      if (err) {
        console.log("The API returned an error: " + err);
      } else {
        if (res.data.items[0] !== undefined) { // Check if a result was found
          var formatedChannel = formatChannelInformationJson(res.data.items[0]) // Format the recieved JSON object
          callback(formatedChannel);
        } else {
          callback([]);
        }
      }
    }
  );
}

// Get Youtube videos via channel ID
function getVideos(auth, youtube, channel_id, count, callback) {
  youtube.search.list( // Call the Youtube API
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
      if (res.data.items !== undefined) { // Check if a result was found
        getVideoStatistics(auth, youtube, res.data.items, count, callback); // Get video statistics
      } else {
        callback([]);
      }
    }
  });
}

// Get video statistics
function getVideoStatistics(auth, youtube, items, count, callback) {

  // Convert the video ID:s of the provided videos to the appropriate format
  var IDs = "";
  if (Array.isArray(items)) {
    for (var i = 0; i < items.length; i++) {
      if (i != 0) {
        IDs += ", "
      }
      IDs += items[i].id.videoId;
    }
  }

  youtube.videos.list( // Call the Youtube API
  {
    auth: auth,
    part: "statistics",
    id: IDs,
    maxResults: count //integer 0-50, default 5
  },
  function(err, res) {
    if (err) {
      console.log("The API returned an error: " + err);
    } else {
      var formatedVideos = formatVideosJson(items, res.data.items); // Format the recieved JSON object filled with videos
      callback(formatedVideos);
    }
  });
}

// Format the JSON object containing the channel data
function formatChannelJson(channel) {
  return formatedChannel = {
    "platform": "Youtube",
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

// Format the JSON object containing the channel data
function formatChannelInformationJson(channel) {
  return formatedChannel = {
    "platform": "youtube",
    "accountName": channel.snippet.title,
    "followersCount": channel.statistics.subscribersCount,
    "createdAtUnixTime": (new Date(channel.snippet.publishedAt)).toISOString(),
    "accountUrl": "https://www.youtube.com/channel/" + channel.id,
    "imageUrl": channel.snippet.thumbnails.high.url,
    "platformContent": null
  };
}

// Format the JSON object containing the video data
function formatVideosJson(videos, statistics) {
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
        "video_embeded_url": "",
        "video_title": videos[i].snippet.title,
        "video_description": videos[i].snippet.description,
        "video_created_at": (new Date(videos[i].snippet.publishedAt).toISOString()),
        "video_thumbnail_url": videos[i].snippet.thumbnails.high.url,
        "video_view_count": "",
        "video_like_count": "",
        "video_dislike_count": "",
        "video_comment_count": ""
      };
      video.channel_url = "https://www.youtube.com/channel/" + video.channel_id;
      video.video_url = "https://www.youtube.com/watch?v=" + video.video_id;
      video.video_embeded_url = "https://www.youtube.com/embed/" + video.video_id;

      formatedVideos.push(video);
    }
  }

  // Add statistics
  if (Array.isArray(statistics)) {
    for (var i = 0; i < statistics.length; i++) {
      formatedVideos[i].video_view_count = statistics[i].statistics.viewCount;
      formatedVideos[i].video_like_count = statistics[i].statistics.likeCount;
      formatedVideos[i].video_dislike_count = statistics[i].statistics.dislikeCount;
      formatedVideos[i].video_comment_count = statistics[i].statistics.commentCount;
    }
  }

  return formatedVideos;
}
