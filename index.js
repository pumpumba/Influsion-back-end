//const http = require("http");
const express = require("express");
const Twitter = require('machinepack-twitter');
const twitterNodeMachine = require('./twitterNodeMachine');
//const fs = require("fs");

const hostname = "0.0.0.0";
const port = 8080;

const app = express();

app.get("/", (req, res) => {
    var obj = twitterNodeMachine.getUserTweets('kembal');
});

app.listen(port, hostname);
console.log(`Running on http://${hostname}.${port}`);
