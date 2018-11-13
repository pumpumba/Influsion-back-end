module.exports = {
  getRoutes: function(client) {
    var express = require("express");
    const bodyParser = require("body-parser");
    var functions = require('./aggregateCloudFunctions');

    app = express.Router();

    app.get("/", (req, res) => {
      res.send(
        "<h1>Hello! Welcome to Pumba!</h1> <p>See the project Wiki for more information.</p>"
      );
    });

    app.get("/health", (req, res) => {
      functions.health(req, res);
    });

    app.get("/filters", (req, res) => {
      functions.filters(req, res);
    });
    app.use(
      bodyParser.urlencoded({
        extended: true
      })
    );
    app.use(bodyParser.json());

    app.post("/content", (req, res) => {
      functions.content(req, res, client);
    });

    app.get("/search", (req, res) => {
      res.send("This request is currently not available");
    });

    app.post("/adminstrator", (req, res) => {
      functions.adminstrator(req, res);
    });

    return app;
  }

}
