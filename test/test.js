process.env.NODE_ENV = "test";

//let mongoose = require("mongoose");
//const twitterNodeMachine = require("../src/api/twitterNodeMachine");

//Require the dev-dependencies
let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../src/index");
const { Pool, Client } = require("pg");
let should = chai.should();

//DATABASE
// pools will use environment variables
// for connection information
const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT
});

// clients will also use environment variables
// for connection information
const client = new Client({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT
});
client.connect();

client.query("SELECT NOW()", (err, res) => {
  if (process.env.NODE_ENV == "test") {
    //console.log(err, res);
  }
  //client.end();
});

dbRequest = "SELECT * FROM INFLUENCER";
client.query(dbRequest, (err, dbResult) => {
  //console.log(err, dbResult)
});

chai.use(chaiHttp);

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
describe("/GET influencers from DB", () => {
  it("it should GET all influencers", done => {
    chai
      .request(server)
      .get("/db/get_influencer")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("array");
        res.body.length.should.be.eql(0);
        done();
      });
  });
});

describe("/POST update content in empty DB from each platform individually", () => {
  it("it should update youtube content in an empty DB", done => {
    chai
      .request(server)
      .post("/aggregate/content")
      .type("application/x-www-form-urlencoded")
      .send({
        'assetType[0]': 'youtube video',
        'filterType[0]': 'update',
        filterValue: '1',
        limit: '2'
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("array");
        res.body.length.should.be.eql(0);
        done();
      });
  });
  it("it should update instagram content in an empty DB", done => {
    chai
      .request(server)
      .post("/aggregate/content")
      .type("application/x-www-form-urlencoded")
      .send({
        'assetType[0]': 'instagram post',
        'filterType[0]': 'update',
        filterValue: '1',
        limit: '2'
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("array");
        res.body.length.should.be.eql(2);
        done();
      });
  });
  it("it should update twitter content in an empty DB", done => {
    chai
      .request(server)
      .post("/aggregate/content")
      .type("application/x-www-form-urlencoded")
      .send({
        'assetType[0]': 'tweet',
        'filterType[0]': 'update',
        filterValue: '1',
        limit: '2'
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("array");
        res.body.length.should.be.eql(2);
        done();
      });
  });
});

describe("/POST get popular content from empty dataase from each platform individually", () => {
  it("it should get youtube content from an empty DB", done => {
    chai
      .request(server)
      .post("/aggregate/content")
      .type("application/x-www-form-urlencoded")
      .send({
        'assetType[0]': 'youtube video',
        'filterType[0]': 'popular',
        filterValue: '1',
        limit: '2'
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("array");
        res.body.length.should.be.eql(0);
        done();
      });
  });

  it("it should get instagram content from an empty DB", done => {
    chai
      .request(server)
      .post("/aggregate/content")
      .type("application/x-www-form-urlencoded")
      .send({
        'assetType[0]': 'instagram post',
        'filterType[0]': 'popular',
        filterValue: '1',
        limit: '2'
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("array");
        res.body.length.should.be.eql(0);
        done();
      });
  });

  it("it should get twitter content from an empty DB", done => {
    chai
      .request(server)
      .post("/aggregate/content")
      .type("application/x-www-form-urlencoded")
      .send({
        'assetType[0]': 'tweet',
        'filterType[0]': 'popular',
        filterValue: '1',
        limit: '2'
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("array");
        res.body.length.should.be.eql(0);
        done();
      });
  });
});
