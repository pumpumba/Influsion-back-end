require("dotenv").config({ path: __dirname + "/./../../.env" });
const googleClientIDPumba = process.env.GOOGLE_CLIENT_ID;
const googleClientSecretPumba = process.env.GOOGLE_CLIENT_SECRET;
console.log(googleClientIDPumba);
console.log(googleClientSecretPumba);
const { google } = require("googleapis");
//let privatekey = require("./pumbagoogleprivatekey.json");

// Configure a JWT auth client
let jwtClient = new google.auth.JWT(
  googleClientIDPumba,
  null,
  googleClientSecretPumba,
  ["https://www.googleapis.com/auth/youtube"]
);
console.log("test1");
// Authenticate request
//HÄR BLIR DET FEL! " Error: error:0906D06C:PEM routines:PEM_read_bio:no start line"
jwtClient.authorize(function(err, tokens) {
  if (err) {
    console.log(err);
    return;
  } else {
    console.log("Successfully connected!");
  }
});

console.log("test2");
let youtube = google.youtube("v3");

console.log("test3");

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
          //console.log('Video list from Youtube:');
          console.log("Hmmm...");

          callback(res.data.items);
          for (var i = 0; i < response.data.items.length; i++) {
            console.log(response.data.items[i].snippet.title);
          }
        }
      }
    );
  }
};
