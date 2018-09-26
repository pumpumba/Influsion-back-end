console.log("test");
const https = require("https");
const token = "";
var url =
  "https://api.instagram.com/v1/users/self/media/recent/?access_token=" + token;
var instagramStringResponse;
var instagramJsonResponse;

https
  .get(url, function(res) {
    var body = "";

    res.on("data", function(chunk) {
      body += chunk;
    });

    res.on("end", function() {
      instagramStringResponse = JSON.parse(body);
      instagramJsonResponse = body;
      console.log(typeof instagramJsonResponse);
      console.log(typeof instagramStringResponse);
      console.log("Got a response: ", instagramStringResponse);
    });
  })
  .on("error", function(e) {
    console.log("Got an error: ", e);
  });

exports.getInsta = (callback, limit) => {
  typeof instagramJsonResponse;
};
