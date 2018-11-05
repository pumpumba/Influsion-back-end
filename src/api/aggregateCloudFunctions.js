const dbFunctions = require('../dbFunctions');
var self = module.exports = {
  health: function (req, res) {
    res.send(
      "<h1>Hello! Welcome to Pumba!</h1> <p> For Twitter API alternative, go to ./api/twitter </p>"
    );
  },
  filters: function (req, res) {
    var filterType = req["query"]["filterType"];
    var assetType = req["query"]["assetType"];
    switch (assetType) {
      case "content":
        switch (filterType) {
          case "influencer":
            res.json(['Popular', "<enter your influencers username>"])
            break;
          case 'user':
            res.json(['<enter your user ID here']);
            break;
          default:
            res.json(['Nothing available']);
        }
      case "tweet":
        switch (filterType) {
          case "search":
            res.json(["<enter your influencers username>"]);
            break;
          case "user_id":
            res.json(['<enter your user ID here>']);
            break;
          case "popular":
            res.json(['<no entry needed>']);
            break;
          case "update":
            res.json(['<enter your user ID here>']);
            break;
          default:
            res.json(["Nothing available"]);
        }
        break;
      case "YouTube video":
        switch (filterType) {
          case "influencer":
            res.json(["Popular", "<enter your user username>"]);
            break;
          case "user":
            res.json(['<enter your user ID here>']);
            break;
          default:
            res.json(["Nothing available"]);
        }
        break;
      case "Instagram post":
        switch (filterType) {
          case "influencer":
            res.json(["Popular", "<enter your user username>"]);
            break;
          case "user":
            res.json(['<enter your user ID here>']);
            break;
          default:
            res.json(["Nothing available"]);
        }
        break;
      default:
        res.json(["Nothing available"]);
    }
  },
  content: function (req, res, client) {
    //var Instagram = require("../../machinepack-instagramnodemachines");
    //var Youtube = require("../../machinepack-youtubenodemachines");
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
    self.getContent(assetTypes, filterTypes, filterValue, context,  currentAsset, currentFilter, resultObj, client, (response) => {
      resultObj = response;
      res.json(resultObj);
    });
  },

  getContent: function(assetTypes, filterTypes, filterValue, context, currentAssetNum, currentFilterNum, resultObj, client, callback) {
    switch (assetTypes[currentAssetNum]) {
      case "tweet":
        switch (filterTypes[currentFilterNum]) {
          case "user_id":
            dbFunctions.getLatestPostsFromFollowedInfluencers(filterValue, 'twitter', 5, client, (response) => {
              result = response['rows'];
              for(var k = 0; k<result.length;k++) {
                resultObj.push(result[k]);
              }
              if(currentAssetNum != (assetTypes.length - 1)) {
                self.getContent(assetTypes, filterTypes, filterValue, context, currentAssetNum + 1, currentFilterNum + 1, resultObj, callback);
              }
              else {
                callback(resultObj);
              }
            });
            break;
          case "popular":
            dbFunctions.getLatestPosts('Twitter', 5, client, (response) => {
              result = response['rows'];
              for(var k = 0; k<result.length;k++) {
                resultObj.push(result[k]);
              }
              if(currentAssetNum != (assetTypes.length - 1)) {
                self.getContent(assetTypes, filterTypes, filterValue, context, currentAssetNum + 1, currentFilterNum + 1, resultObj, callback);
              }
              else {
                callback(resultObj);
              }
            });
            break;
          case "Search":
            res.json({
              errorMessage:
                "Search option is not available at the moment"
            });
            break;
          case "Update":
            dbFunctions.getPlatformAccountsFromFollowedInfluencers(filterValue, undefined, client, (response1) => {
              var influencers = response1['rows'];
              var twitterAccounts = [];
              for(var k = 0; k<influencers.length;k++) {
                console.log(k);
                resultObj.push(influencers[k]);
              }
              var currentInfluencerAccount = 0;
              if(currentInfluencerAccount < influencers.length) {
                var tweets = [];
                self.getContentFromInfluencerTwitter(influencers, currentInfluencerAccount, tweets, 10, (response2) => {
                  if(response2.length != 0) {
                    self.storeTwitterContent(response2, 0, client, (response3) => {
                      dbFunctions.getLatestPostsFromFollowedInfluencers(filterValue, 'twitter', 5, client, (response4) => {
                        console.log("Heres comes response4!");
                        console.log(response4);
                        result = response4['rows'];
                        console.log("final");
                        for(var k = 0; k<result.length;k++) {
                          console.log(k);
                          resultObj.push(result[k]);
                        }
                        if(currentAssetNum != (assetTypes.length - 1)) {
                          self.getContent(assetTypes, filterTypes, filterValue, context, currentAssetNum + 1, currentFilterNum + 1, resultObj, callback);
                        }
                        else {
                          callback(resultObj);
                        }
                      });
                    });
                  }
                  else {
                    if(currentAssetNum != (assetTypes.length - 1)) {
                      self.getContent(assetTypes, filterTypes, filterValue, context, currentAssetNum + 1, currentFilterNum + 1, resultObj, callback);
                    }
                    else {
                      callback(resultObj);
                    }
                  }
                });
              }
              else {
                if(currentAssetNum != (assetTypes.length - 1)) {
                  self.getContent(assetTypes, filterTypes, filterValue, context, currentAssetNum + 1, currentFilterNum + 1, resultObj, callback);
                }
                else {
                  callback(resultObj);
                }
              }
            });
            break;
          default:
            res.json({
              errorMessage:
                "The cloud component failed to provide any content"
            });
        }
        break;
      default:
        res.json({
          errorMessage: "The cloud component failed to provide any content"
        });
      }
    },

    getContentFromInfluencersFromPlatform: function(userID, influencerAccounts, currentInfluencer, resultObj, client, platform, callback) {
      dbFunctions.getContentFromInfluencer(platform, influencerAccounts[currentInfluencer]['influencerid'], 5, userID, client, (response) => {
        for(var k = 0; k<response.length;k++) {
          resultObj.push(response[k]);
        }
        if(currentInfluencer != (influencerAccounts.length - 1)) {
          self.getContentFromInfluencersFromPlatform(userID, influencerAccounts, currentInfluencer + 1, resultObj, client, platform, callback);
        }
        else {
          callback(resultObj);
        }
      });
    },

    getContentFromInfluencerTwitter: function(influencers, currentInfluencer, resultObj, limit, callback) {
      var Twitter = require("machinepack-twitternodemachines");
      Twitter.getUserTweets({
        consumerKey: process.env.TWITTER_CONSUMER_KEY,
        consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
        accessToken: process.env.TWITTER_ACCESS_TOKEN,
        accessSecret: process.env.TWITTER_ACCESS_SECRET,
        bearerToken: process.env.TWITTER_BEARER_TOKEN,
        userID: 50393960, //influencers[currentInfluencer]['influencerid'],
        count: limit
      }).exec((err, result) => {
        console.log(result);
        if (err) {
          console.log("Error at getPopularTweets");
          console.log(err);
        } else {
          for(var k = 0; k<result.length;k++) {
            resultObj.push(result[k]);
          }
          if(currentInfluencer != (influencers.length - 1)) {
            self.getContentFromInfluencerTwitter(influencers, currentInfluencer + 1, resultObj, limit, callback);
          }
          else {
            callback(resultObj);
          }
        }
      });
    },

    storeTwitterContent: function(tweets, tweetNum, client, callback) {
      dbFunctions.insertPost(tweets[tweetNum].user_name, tweets[tweetNum].tweet_favorite_count, tweets[tweetNum].platform, tweets[tweetNum].tweet_text, tweets[tweetNum].tweet_created_at, tweets[tweetNum].tweet_url, JSON.stringify(tweets[tweetNum]), client, (response) => {
        if(tweetNum != tweets.length - 1) {
          self.storeTwitterContent(tweets, tweetNum + 1, client, callback);
        }
        else {
          callback(response);
        }
      });
    }
  }