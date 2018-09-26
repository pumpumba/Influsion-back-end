const express = require("express");

const hostname = "0.0.0.0";
const port = 8080;

const app = express();

app.get("/", (req, res) => {
  res.send("Hello World\n");
});

app.listen(port, hostname);
console.log(`Running on http://${hostname}.${port}`);
