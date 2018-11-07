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
      case "Instagram post":
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
    self.getContent(assetTypes, filterTypes, filterValue, context, limit,  currentAsset, currentFilter, resultObj, client, (response) => {
      resultObj = response;
      res.json(resultObj);
    });
  },

  getContent: function(assetTypes, filterTypes, filterValue, context, limit, currentAssetNum, currentFilterNum, resultObj, client, callback) {
    switch (assetTypes[currentAssetNum]) {
      case "tweet":
        switch (filterTypes[currentFilterNum]) {
          case "influencer":
            dbFunctions.getContentFromInfluencer('twitter', filterValue[0], limit, filterValue[1], client, (response) => {
              result = response['rows'];
              if(result != undefined) {
                for(var k = 0; k<result.length;k++) {
                  resultObj.push(result[k]);
                }
              }

              if(currentAssetNum != (assetTypes.length - 1)) {
                self.getContent(assetTypes, filterTypes, filterValue, context, currentAssetNum + 1, currentFilterNum + 1, resultObj, callback);
              }
              else {
                callback(resultObj);
              }
            });
            break;
          case "user":
            dbFunctions.getFollowedInfluencersPosts(filterValue, limit, 'twitter', client, (response) => {
              result = response['rows'];
              if(result != undefined) {
                for(var k = 0; k<result.length;k++) {
                  resultObj.push(result[k]);
                }
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
            dbFunctions.getLatestPosts(filterValue, 'twitter', limit, client, (response) => {
              console.log(response)
              result = response['rows'];
              console.log(result);
              if(result != undefined) {
                for(var k = 0; k<result.length;k++) {
                  resultObj.push(result[k]);
                }
              }
              if(currentAssetNum != (assetTypes.length - 1)) {
                self.getContent(assetTypes, filterTypes, filterValue, context, currentAssetNum + 1, currentFilterNum + 1, resultObj, callback);
              }
              else {
                callback(resultObj);
              }
            });
            break;
          case "search":
            callback("Search option is not available at the moment");
            break;
          case "update":
            dbFunctions.getPlatformAccounts('twitter', client, (response1) => {
              var influencers = response1['rows'];
              var twitterAccounts = [];
              if(influencers != undefined) {
                for(var k = 0; k<influencers.length;k++) {
                  twitterAccounts.push(influencers[k]);
                }
              }
              var currentInfluencerAccount = 0;
              if(currentInfluencerAccount < twitterAccounts.length) {
                var tweets = [];
                self.getContentFromInfluencerTwitter(twitterAccounts, currentInfluencerAccount, tweets, limit, (response2) => {
                  if(response2.length != 0) {
                    self.storeTwitterContent(response2, 0, client, (response3) => {
                      resultObj.push("Success");
                      if(currentAssetNum != (assetTypes.length - 1)) {
                        self.getContent(assetTypes, filterTypes, filterValue, context, currentAssetNum + 1, currentFilterNum + 1, resultObj, callback);
                      }
                      else {
                        callback(resultObj);
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
            callback("The cloud component failed to provide any content");
        }
        break;
      case 'instagram post':
        switch (filterTypes[currentFilterNum]) {
          case "influencer":
            dbFunctions.getContentFromInfluencer('instagram', filterValue[0], limit, filterValue[1], client, (response) => {
              result = response['rows'];
              if(result != undefined) {
                for(var k = 0; k<result.length;k++) {
                  resultObj.push(result[k]);
                }
              }
              if(currentAssetNum != (assetTypes.length - 1)) {
                self.getContent(assetTypes, filterTypes, filterValue, context, currentAssetNum + 1, currentFilterNum + 1, resultObj, callback);
              }
              else {
                callback(resultObj);
              }
            });
            break;
          case "user":
            dbFunctions.getFollowedInfluencersPosts(filterValue, limit, 'instagram', client, (response) => {
              result = response['rows'];
              if(result != undefined) {
                for(var k = 0; k<result.length;k++) {
                  resultObj.push(result[k]);
                }
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
            dbFunctions.getLatestPosts(filterValue, 'instagram', limit, client, (response) => {
              console.log(response)
              result = response['rows'];
              console.log(result);
              if(result != undefined) {
                for(var k = 0; k<result.length;k++) {
                  resultObj.push(result[k]);
                }
              }
              if(currentAssetNum != (assetTypes.length - 1)) {
                self.getContent(assetTypes, filterTypes, filterValue, context, currentAssetNum + 1, currentFilterNum + 1, resultObj, callback);
              }
              else {
                callback(resultObj);
              }
            });
            break;
          case "search":
            callback("Search option is not available at the moment");
            break;
          case "update":
            dbFunctions.getPlatformAccounts('instagram', client, (response1) => {
              var influencers = response1['rows'];
              var twitterAccounts = [];
              if(influencers != undefined) {
                for(var k = 0; k<influencers.length;k++) {
                  twitterAccounts.push(influencers[k]);
                }
              }
              var currentInfluencerAccount = 0;
              if(currentInfluencerAccount < twitterAccounts.length) {
                var tweets = [];
                self.getContentFromInfluencerInstagram(twitterAccounts, currentInfluencerAccount, tweets, limit, (response2) => {
                  if(response2.length != 0) {
                    self.storeInstagramContent(response2, 0, client, (response3) => {
                      resultObj.push("Success");
                      if(currentAssetNum != (assetTypes.length - 1)) {
                        self.getContent(assetTypes, filterTypes, filterValue, context, currentAssetNum + 1, currentFilterNum + 1, resultObj, callback);
                      }
                      else {
                        callback(resultObj);
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
            callback("The cloud component failed to provide any content");
        }
        break;
      case "youtube video":
        switch (filterTypes[currentFilterNum]) {
          case "influencer":
            dbFunctions.getContentFromInfluencer('youtube', filterValue[0], limit, filterValue[1], client, (response) => {
              result = response['rows'];
              if(result != undefined) {
                for(var k = 0; k<result.length;k++) {
                  resultObj.push(result[k]);
                }
              }
              if(currentAssetNum != (assetTypes.length - 1)) {
                self.getContent(assetTypes, filterTypes, filterValue, context, currentAssetNum + 1, currentFilterNum + 1, resultObj, callback);
              }
              else {
                callback(resultObj);
              }
            });
            break;
          case "user":
            dbFunctions.getFollowedInfluencersPosts(filterValue, limit, 'youtube', client, (response) => {
              result = response['rows'];
              if(result != undefined) {
                for(var k = 0; k<result.length;k++) {
                  resultObj.push(result[k]);
                }
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
            dbFunctions.getLatestPosts(filterValue, 'youtube', limit, client, (response) => {
              console.log(response)
              result = response['rows'];
              console.log(result);
              if(result != undefined) {
                for(var k = 0; k<result.length;k++) {
                  resultObj.push(result[k]);
                }
              }
              if(currentAssetNum != (assetTypes.length - 1)) {
                self.getContent(assetTypes, filterTypes, filterValue, context, currentAssetNum + 1, currentFilterNum + 1, resultObj, callback);
              }
              else {
                callback(resultObj);
              }
            });
            break;
          case "search":
            callback("Search option is not available at the moment");
            break;
          case "update":
          dbFunctions.getPlatformAccounts('youtube', client, (response1) => {
              var influencers = response1['rows'];
              var twitterAccounts = [];
              if(influencers != undefined) {
                for(var k = 0; k<influencers.length;k++) {
                  twitterAccounts.push(influencers[k]);
                }
              }
              var currentInfluencerAccount = 0;
              if(currentInfluencerAccount < twitterAccounts.length) {
                var tweets = [];
                self.getContentFromInfluencerYouTube(twitterAccounts, currentInfluencerAccount, tweets, limit, (response2) => {
                  if(response2.length != 0) {
                    self.storeYouTubeContent(response2, 0, client, (response3) => {
                      resultObj.push("Success");
                      if(currentAssetNum != (assetTypes.length - 1)) {
                        self.getContent(assetTypes, filterTypes, filterValue, context, currentAssetNum + 1, currentFilterNum + 1, resultObj, callback);
                      }
                      else {
                        callback(resultObj);
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
            callback("The cloud component failed to provide any content");
        }
        break;
      case "all":
        switch (filterTypes[currentFilterNum]) {
          case "influencer":
            dbFunctions.getContentFromInfluencer('all', filterValue[0], limit, filterValue[1], client, (response) => {
              result = response['rows'];
              if(result != undefined) {
                for(var k = 0; k<result.length;k++) {
                  resultObj.push(result[k]);
                }
              }
              if(currentAssetNum != (assetTypes.length - 1)) {
                self.getContent(assetTypes, filterTypes, filterValue, context, currentAssetNum + 1, currentFilterNum + 1, resultObj, callback);
              }
              else {
                callback(resultObj);
              }
            });
            break;
          case "user":
            dbFunctions.getFollowedInfluencersPosts(filterValue, limit, 'all', client, (response) => {
              result = response['rows'];
              if(result != undefined) {
                for(var k = 0; k<result.length;k++) {
                  resultObj.push(result[k]);
                }
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
            dbFunctions.getLatestPosts(filterValue, undefined, limit, client, (response) => {
              console.log(response)
              result = response['rows'];
              console.log(result);
              if(result != undefined) {
                for(var k = 0; k<result.length;k++) {
                  resultObj.push(result[k]);
                }
              }
              if(currentAssetNum != (assetTypes.length - 1)) {
                self.getContent(assetTypes, filterTypes, filterValue, context, currentAssetNum + 1, currentFilterNum + 1, resultObj, callback);
              }
              else {
                callback(resultObj);
              }
            });
            break;
          case "search":
            callback("Search option is not available at the moment");
            break;
          default:
            callback("The cloud component failed to provide any content");
        }
        break;
      default:
        callback("The cloud component failed to provide any content");
      }
    },

    getContentFromInfluencersFromPlatform: function(userID, influencerAccounts, currentInfluencer, resultObj, client, platform, callback) {
      dbFunctions.getContentFromInfluencer(platform, influencerAccounts[currentInfluencer]['influencerid'], 5, userID, client, (response) => {
        if(response != undefined) {
          for(var k = 0; k<response.length;k++) {
            resultObj.push(response[k]);
          }
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
        userScreenName: influencers[currentInfluencer].platformname, 
        count: limit
      }).exec((err, result) => {
        if (err) {
          console.log("Error at getPopularTweets");
          console.log(err);
        } else {
          if(result != undefined) {
            for(var k = 0; k<result.length;k++) {
              result[k].realInfluencerName = influencers[currentInfluencer].influencerid
              resultObj.push(result[k]);
            }
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
      var unixtime =  new Date(tweets[tweetNum].tweet_created_at).getTime();
      var regex = /'/gi;
      var userTextContent = tweets[tweetNum].tweet_text.replace(regex, "''");
      var jsonContent = JSON.stringify(tweets[tweetNum]).replace(regex, "''");
      dbFunctions.insertPost(tweets[tweetNum].realInfluencerName, tweets[tweetNum].tweet_favorite_count, tweets[tweetNum].platform, userTextContent, unixtime, tweets[tweetNum].tweet_id, tweets[tweetNum].tweet_url, jsonContent, client, (response) => {
        if(tweetNum != tweets.length - 1) {
          self.storeTwitterContent(tweets, tweetNum + 1, client, callback);
        }
        else {
          callback(response);
        }
      });
    },

    getContentFromInfluencerInstagram: function(influencers, currentInfluencer, resultObj, limit, callback) {
      var Instagram = require("machinepack-instagramnodemachines2");
      Instagram.getInstaPosts({
        accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
        id: process.env.INSTAGRAM_ID,
        screenName: influencers[currentInfluencer].platformname,
        count: limit
      }).exec((err, result) => {
        if (err) {
          console.log("Error at getInstaPosts");
          console.log(err);
        } else {
          if(result != undefined) {
            for(var k = 0; k<result.length;k++) {
              result[k].realInfluencerName = influencers[currentInfluencer].influencerid
              resultObj.push(result[k]);
            }
          }
          if(currentInfluencer != (influencers.length - 1)) {
            self.getContentFromInfluencerInstagram(influencers, currentInfluencer + 1, resultObj, limit, callback);
          }
          else {
            callback(resultObj);
          }
        }
      });
    },

    storeInstagramContent: function(posts, postNum, client, callback) {
      var platform = posts[postNum].platform.toLowerCase();
      var regex = /'/gi;
      var userTextContent = posts[postNum].post_text.replace(regex, "''");
      var datePosted = Date.parse(posts[postNum].post_created_at);
      var jsonContent = JSON.stringify(posts[postNum]).replace(regex, "''");
      dbFunctions.insertPost(posts[postNum].realInfluencerName, posts[postNum].post_like_count, platform, userTextContent, datePosted, posts[postNum].post_id, posts[postNum].post_url, jsonContent, client, (response) => {
        if(postNum != posts.length - 1) {
          self.storeInstagramContent(posts, postNum + 1, client, callback);
        }
        else {
          callback(response);
        }
      });
    },

    getContentFromInfluencerYouTube: function(influencers, currentInfluencer, resultObj, limit, callback) {
      console.log(influencers);
      //var Youtube = require("machinepack-youtubenodemachines"); here we get the nodemachines
      /*Youtube.getUserVideos({
        consumerKey: process.env.TWITTER_CONSUMER_KEY,
        consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
        accessToken: process.env.TWITTER_ACCESS_TOKEN,
        accessSecret: process.env.TWITTER_ACCESS_SECRET,
        bearerToken: process.env.TWITTER_BEARER_TOKEN,
        userScreenName: influencers[currentInfluencer].actname,
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
            self.getContentFromInfluencerYouTube(influencers, currentInfluencer + 1, resultObj, limit, callback);
          }
          else {
            callback(resultObj);
          }
        }
      }); */

      var YoutubeNodeMachine = require("machinepack-youtubenodemachines");
      YoutubeNodeMachine.getChannelYoutubeVideos({
        googleEmail: process.env.GOOGLE_CLIENT_EMAIL,
        googlePrivateKey: process.env.GOOGLE_PRIVATE_KEY,
        channelName: influencers[currentInfluencer].platformname,
        count: limit
      }).exec((err, result) => {
        if (err) {
          console.log("Error at getPopularTweets");
          console.log(err);
        } else {
          if(result != undefined) {
            for(var k = 0; k<result.length;k++) {
              result[k].realInfluencerName = influencers[currentInfluencer].influencerid
              resultObj.push(result[k]);
            }
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

    storeYouTubeContent: function(videos, videoNum, client, callback) {
      var platform = videos[videoNum].platform.toLowerCase();
      var splitedDate = videos[videoNum].video_created_at.split(" ");
      var unixtime = new Date(splitedDate).getTime();
      var regex = /'/gi;
      var userTextContent = videos[videoNum].video_title.replace(regex, "''");
      var jsonContent = JSON.stringify(jsonContent).replace(regex, "''");
      dbFunctions.insertVideo(videos[videoNum].realInfluencerName, videos[videoNum].video_like_count, platform, userTextContent, unixtime, videos[videoNum].video_id, videos[videoNum].video_embeded_url, jsonContent, client, (response) => {
        if(videoNum != videos.length - 1) {
          self.storeYouTubeContent(videos, videoNum + 1, client, callback);
        }
        else {
          callback(response);
        }
      });
    }
  }