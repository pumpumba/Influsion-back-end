const https = require("https");
require("dotenv").config({ path: __dirname + "/./../../.env" });
const token = process.env.INSTAGRAM_TOKEN;
var url =
  "https://api.instagram.com/v1/users/self/media/recent/?access_token=" + token;
var instagramResponse;

module.exports = {
  getInsta: function(callback) {
    https
      .get(url, function(res) {
        var body = "";

        res.on("data", function(chunk) {
          body += chunk;
        });

        res.on("end", function() {
          instagramResponse = JSON.parse(body);
        });
      })
      .on("error", function(e) {
        console.log("Got an error: ", e);
      });
    callback(instagramResponse);
  }
};
