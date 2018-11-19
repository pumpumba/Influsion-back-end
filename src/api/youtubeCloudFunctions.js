
module.exports = {
  // The youtube/health call
  health: function(req, res) {
    res.status(200);
    res.send("HTTP response 200 code OK.");
  },
  // The youtube/filters call
  filters: function(req, res) {
    var filterType = req["query"]["filterType"];
    var assetType = req["query"]["assetType"];
    switch (assetType) {
      case "youtube video":
        switch (filterType) {
          case "user":
            res.json(["Enter your user ID"]);
            break;
          default:
            res.json(["Nothing available"]);
        }
        break;
      default:
        res.json(["Nothing available"]);
    }
  },
  // The youtube/content call
  content: function(req, res) {
    var inputObj = req.body;
    var context = inputObj.context;
    if (inputObj.filterType == undefined) {
      res.json({ errorMessage: "You need to provide a filterType" });
    }
    var filterTypes = inputObj.filterType;
    if (inputObj.assetType == undefined) {
      res.json({ errorMessage: "You need to provide an assetType" });
    }
    var assetTypes = inputObj.assetType;
    if (inputObj.filterValue == undefined) {
      var filterValue = "";
    } else {
      var filterValue = inputObj.filterValue;
    }
    if (inputObj.context == undefined) {
      var context = "";
    } else {
      var context = inputObj.context;
    }
    if (isNaN(inputObj.offset)) {
      var offset = 0;
    } else {
      var offset = parseInt(inputObj.offset, 10);
    }
    if (isNaN(inputObj.limit)) {
      var limit = 5;
    } else {
      var limit = parseInt(inputObj.limit, 10);
    }
    var resultObj = [];
    var currentAsset = 0;
    var currentFilter = 0;
    getContent(assetTypes, filterTypes, filterValue, context, limit, currentAsset, currentFilter, resultObj, (response) => {
      res.json(response);
    });
  }
};

var getContent = function(assetTypes, filterTypes, filterValue, context, limit, currentAssetNum, currentFilterNum, resultObj, callback) {
  var youtube = require("machinepack-youtubenodemachines");
  switch (assetTypes[currentAssetNum]) {
    case "youtube video":
        switch (filterTypes[currentFilterNum]) {
          case "influencer":
            switch (filterValue) {
              default:
                require("dotenv").load();
                youtube.getChannelYoutubeVideos({
                  googleEmail: process.env.GOOGLE_CLIENT_EMAIL,
                  googlePrivateKey: process.env.GOOGLE_PRIVATE_KEY,
                  channelName: filterValue,
                  count: limit
                }).exec((err, result) => {
                  callbackFunction(result, assetTypes, filterTypes, filterValue, context, currentAssetNum, currentFilterNum, resultObj, callback);
                });
            }
            break;
          default:
            callback("The cloud component failed to provide any content");
        }
      break;
    default:
      callback("The cloud component failed to provide any content");
  }
};

var callbackFunction = function(result, assetTypes, filterTypes, filterValue, context, currentAssetNum, currentFilterNum, resultObj, callback) {
  if (result != undefined) {
    for (var k = 0; k < result.length; k++) {
      resultObj.push(result[k]);
    }
  }
  if (currentAssetNum != (assetTypes.length - 1)) {
    self.getContent(assetTypes, filterTypes, filterValue, context, currentAssetNum + 1, currentFilterNum + 1, resultObj, callback);
  }
  else {
    callback(resultObj);
  }
};
