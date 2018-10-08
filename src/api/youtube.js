const { google } = require("googleapis");
let privatekey = require("./pumbagoogleprivatekey.json");

// Configure a JWT auth client
let jwtClient = new google.auth.JWT(
  privatekey.client_email,
  null,
  privatekey.private_key,
  ["https://www.googleapis.com/auth/youtube"]
);

// Authenticate request
jwtClient.authorize(function(err, tokens) {
  if (err) {
    console.log(err);
    return;
  } else {
    console.log("Successfully connected!");
  }
});

let youtube = google.youtube("v3");

module.exports = {
  getYoutube: function(callback) {
    youtube.search.list(
      {
        auth: jwtClient,
        part: "snippet",
        order: "viewCount",
        q: "pewdiepie",
        type: "video"
      },
      function(err, res) {
        if (err) {
          console.log("The API returned an error: " + err);
        } else {
          callback(res.data.items);
          /*for (var i = 0; i < response.data.items.length; i++) {
             console.log(response.data.items[i].snippet.title);
           }*/
        }
      }
    );
  }
};
