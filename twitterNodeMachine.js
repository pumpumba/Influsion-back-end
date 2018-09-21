const Twitter = require('machinepack-twitter');
//Enter your authorisation keys below in the following constants
const consumerKeyPumba = '';
const consumerSecretPumba = '';
const accessTokenPumba = '';
const accessSecretPumba = '';

module.exports = {
  search: function (query) {
    return Twitter.searchTweets({
      q: query,
      consumerKey: consumerKeyPumba,
      consumerSecret: consumerSecretPumba,
      accessToken: accessTokenPumba,
      accessSecret: accessSecretPumba,
    }).exec((err, result)=>{
      if (err) {
        console.log("Failure at twitter search!");
        console.log(err);
        return res.serverError(err);
      }
      console.log("Success at twitter search!");
      console.log(result);
      return result;
    });
  },
  getUser: function (username) {
    Twitter.getUserProfile({

      screenName: username,
      consumerKey: consumerKeyPumba,
      consumerSecret: consumerSecretPumba,
      accessToken: accessTokenPumba,
      accessSecret: accessSecretPumba,
    }).exec((err, result)=>{
      if (err) {
        console.log("Failure at twitter search!");
        console.log(err);
        return res.serverError(err);
      }
      console.log("Success at twitter search!");
      console.log(result);
      return result;
    });
  }
};
