//const http = require("http");
const express = require("express");
//const fs = require("fs");

const hostname = "0.0.0.0";
const port = 8080;

const app = express();

youtube = require("./api/youtube");

app.get("/", (req, res) => {
  res.send("Hello world!");
})

app.get("/api/youtube", (req, res) => {
  //var user = req.params.user;
  youtube.getYoutube((result) => {
    //res.json(result);
    //console.log(result)
    //res.send(result)
    //console.log("Klar!");
    res.send(result);
  });
});

app.listen(port, hostname);


/*
const {google} = require('googleapis');
const http = require('http');
const url = require('url');
const querystring = require('querystring');
const opn = require('opn');
const destroyer = require('server-destroy');
const fs = require('fs');
const path = require('path');
*/

/*
async function runSample() {
  console.log("We are running a sample");
  const res = await youtube.search.list({
    part: 'id,snippet',
    q: 'Node.js on Google Cloud',
  });
  console.log("Here is our response!!");
  console.log(res.data);
}

runSample()
*/
/*

const keyPath = path.join(__dirname, 'oauth2.keys.json');
const uri = 'http://localhost:8081/oauth2callback';

app.oAuth2Client = new google.auth.OAuth2(
      googleClientIDPumba,
      googleClientSecretPumba,
      uri
    );



const youtube = google.youtube({
  version: 'v3',
  auth: app.oAuth2Client,
});

console.log(app.oAuth2Client);
app.get("/", (req, res) => {
  //console.log(process.cwd());
  //res.send("Hello World!");
  res.sendFile(__dirname + "/index.html");
});

app.listen(port, hostname);
console.log(`Running on http://${hostname}.${port}`);

*/

/*
async function runSample() {
  console.log("We are running a sample");
  const res = await youtube.search.list({
    part: 'id,snippet',
    q: 'Node.js on Google Cloud',
  });
  console.log("Here is our response!!");
  console.log(res.data);
}


const scopes = ['https://www.googleapis.com/auth/youtube'];

app.authenticate = async function(scopes) {
  return new Promise((resolve, reject) => {
    // grab the url that will be used for authorization
    console.log("Hellooooooooooo");
    this.authorizeUrl = this.oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes.join(' '),
    });
    console.log("Came here");
    const server = http
      .createServer(async (req, res) => {
        try {
          if (req.url.indexOf('/oauth2callback') > -1) {
            const qs = querystring.parse(url.parse(req.url).query);
            res.end(
              'Authentication successful! Please return to the console.'
            );
            server.destroy();
            const {tokens} = await this.oAuth2Client.getToken(qs.code);
            this.oAuth2Client.credentials = tokens;
            resolve(this.oAuth2Client);
          }
        } catch (e) {
          reject(e);
        }
      })
      .listen(8082, () => {
        // open the browser to the authorize url to start the workflow
        opn(this.authorizeUrl, {wait: false}).then(cp => cp.unref());
      });
      console.log("Came here three");
    destroyer(server);
    console.log("destroyed server!!!");
  });
}

console.log(app.oAuth2Client);
app
  .authenticate(scopes)
  .then(console.log("Hejhej"))
  .then(runSample)
  .then(console.log("Hejhej"))
  .catch(console.error);
*/

/* fs.readFile("index.html", (err, html) => {
  if (err) {
    throw err;
  }

  const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader("Content-type", "text/html");
    res.write(html);
    res.end();
  });

  server.listen(port, hostname, () => {
    console.log("Server started on port " + port);
  });
}); */
