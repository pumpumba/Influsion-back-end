//const http = require("http");
const express = require("express");
//const fs = require("fs");

const hostname = "0.0.0.0";
const port = 8080;

const app = express();

app.get("/", (req, res) => {
  res.send("Hello World\n");
});

app.listen(port, hostname);
console.log(`Running on http://${hostname}.${port}`);

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