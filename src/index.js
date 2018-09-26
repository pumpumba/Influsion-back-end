const express = require("express");

const hostname = "0.0.0.0";
const port = 8080;

const app = express();

instagram = require("./api/instagram");

app.get("/", (req, res) => {
  res.send("Hello World\n");
});

app.get("/api/instagram", (req, res) => {
  result = instagram.getInsta(result => {
    res.json(result);
  });
});

app.listen(port, hostname);
console.log(`Running on http://${hostname}.${port}`);
