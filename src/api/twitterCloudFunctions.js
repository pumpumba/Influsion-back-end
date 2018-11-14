var self = module.exports = {
  // the twitter/health call
  health: function(req, res) {
    res.send(
      "<h1>Hello! Welcome to Pumba!</h1>"
    );
  },
  //The twitter/filters call
  filters: function(req, res) {
    var filterType = req["query"]["filterType"];
    var assetType = req["query"]["assetType"];
    switch (assetType) {
      case "tweet":
        switch (filterType) {
          case "influencer":
            res.json(["<enter your influencers username>"]);
            break;
          case "popular":
            res.json(['<no input needed>']);
            break;
          default:
            res.json(["Nothing available"]);
        }
        break;
      default:
        res.json(["Nothing available"]);
    }
  },
  //The twitter/content call
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
    getContent(assetTypes, filterTypes, filterValue, context, limit, 0, 0, resultObj, (response) => {
      res.json(response);
    });
  }
};

var callbackFunction = function(result, assetTypes, filterTypes, filterValue, context, limit, currentAssetNum, currentFilterNum, resultObj, callback) {
  if (result != undefined) {
    for (var k = 0; k < result.length; k++) {
      resultObj.push(result[k]);
    }
  }
  if (currentAssetNum != (assetTypes.length - 1)) {
    getContent(assetTypes, filterTypes, filterValue, context, limit, currentAssetNum + 1, currentFilterNum + 1, resultObj, callback);
  }
  else {
    callback(resultObj);
  }
};

var getContent = function(assetTypes, filterTypes, filterValue, context, limit, currentAssetNum, currentFilterNum, resultObj, callback) {
  var Twitter = require("machinepack-twitternodemachines");
  switch (assetTypes[currentAssetNum]) {
    case "tweet":
        switch (filterTypes[currentFilterNum]) {
          case "influencer":
            Twitter.getUserTweets({
              consumerKey: process.env.TWITTER_CONSUMER_KEY,
              consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
              accessToken: process.env.TWITTER_ACCESS_TOKEN,
              accessSecret: process.env.TWITTER_ACCESS_SECRET,
              bearerToken: process.env.TWITTER_BEARER_TOKEN,
              userScreenName: filterValue,
              count: limit
            }).exec((err, response) => {
              callbackFunction(response, assetTypes, filterTypes, filterValue, context, limit, currentAssetNum, currentFilterNum, resultObj, callback);
            });
            break;
          case "popular":
            var screenNames = ["elonmusk", "justinbieber", "barackobama", "potus", "billgates", "beyonce"];
            Twitter.getPopularTweets({
              consumerKey: process.env.TWITTER_CONSUMER_KEY,
              consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
              accessToken: process.env.TWITTER_ACCESS_TOKEN,
              accessSecret: process.env.TWITTER_ACCESS_SECRET,
              bearerToken: process.env.TWITTER_BEARER_TOKEN,
              userScreenNames: screenNames,
              count: limit
            }).exec((err, response) => {
              callbackFunction(response, assetTypes, filterTypes, filterValue, context, limit, currentAssetNum, currentFilterNum, resultObj, callback);
            });
            break;
          default:
            callback("The cloud component failed to provide any content");
        }
      break;
    default:
      callback("The cloud component failed to provide any content");
  }
};
