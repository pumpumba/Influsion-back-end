process.env.NODE_ENV = "test";

//let mongoose = require("mongoose");
//const twitterNodeMachine = require("../src/api/twitterNodeMachine");

//Require the dev-dependencies
let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../src/index");
let should = chai.should();

chai.use(chaiHttp);
//Our parent block
/*
  * Test the /GET route
  */
describe("/GET twitter health", () => {
  it("it should GET the health of the twitter API", done => {
    chai
      .request(server)
      .get("/twitter/health")
      .end((err, res) => {
        res.should.have.status(200);
        /*
        res.body.should.be.a("array");
        res.body.length.should.be.eql(0); */
        done();
      });
  });
});
