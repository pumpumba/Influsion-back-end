const Twitter = require('machinepack-twitter');
const consumerKeyPumba = 'CDSKGGqFMalwOQWA0oDKEdOG2';
const consumerSecretPumba = 'CTJWRfhguuwrJcBLz4hBX5hqcPDNI5d0o6YjobODqoev9UQJqL';
const accessTokenPumba = '988054291767148544-z83ZcCSHjpNYCl6DXW9VLDtzfJJOxTC';
const accessSecretPumba = 'Uw9Fo5tzjGPMxw7V2W2WxK7eHDNIm0uxBuyZgP6mAg2HT';

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
