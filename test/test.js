process.env.NODE_ENV = "test";
//Require the dev-dependencies
let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../src/index");
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const { Pool, Client } = require("pg");
const dbData = require("./dbTestData")
let should = chai.should();

//DATABASE
// pools will use environment variables
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

chai.use(chaiHttp);

describe("/GET aggregate health", () => {
  it("it should GET the health of the API", done => {
    chai
      .request(server)
      .get("/aggregate/health")
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});
describe("/GET available filters for the API", () => {
  it("it should GET all available filters", done => {
    chai
      .request(server)
      .get("/aggregate/filters")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("array");
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
        //res.body.length.should.be.eql(0);
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
        //res.body.length.should.be.eql(0);
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
        done();
      });
  });

});

insertDBData();
//Insert data into DB
function insertDBData() {
  dbData.data.forEach(element => {
    client.query(element, (err, res) => {
      if (err) {
        console.log(err)
      }
    })
  });
  testWithFilledDB();
};

function testWithFilledDB() {
  describe("/GET influencers from DB", () => {
    it("it should GET all influencers", done => {
      chai
        .request(server)
        .get("/db/get_influencer")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          done();
        });
    });
  });

  //Update each platform individually
  describe("/POST update content in filled DB from each platform individually", () => {
    it("it should update twitter content in an filled DB", done => {
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
          done();
        });
    });
    it("it should update instagram content in an filled DB", done => {
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
          done();
        });
    });
    it("it should update youtube content in an filled DB", done => {
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
          done();
        });
    });
  });

  //UpdatePlatform for each platform individually
  describe("/POST update platform accounts in filled DB from each platform individually", () => {
    it("it should update twitter platform accounts in an filled DB", done => {
      chai
        .request(server)
        .post("/aggregate/content")
        .type("application/x-www-form-urlencoded")
        .send({
          'assetType[0]': 'tweet',
          'filterType[0]': 'update platform accounts'
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          done();
        });
    });
    it("it should update instagram platform accounts in an filled DB", done => {
      chai
        .request(server)
        .post("/aggregate/content")
        .type("application/x-www-form-urlencoded")
        .send({
          'assetType[0]': 'instagram post',
          'filterType[0]': 'update platform accounts'
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          done();
        });
    });
    it("it should update youtube platform accounts  in an filled DB", done => {
      chai
        .request(server)
        .post("/aggregate/content")
        .type("application/x-www-form-urlencoded")
        .send({
          'assetType[0]': 'youtube video',
          'filterType[0]': 'update platform accounts'
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          done();
        });
    });
  });

  //Get posts from each platform individually
  describe("/POST get popular content from filled database from each platform individually", () => {
    it("it should get youtube content from an filled DB", done => {
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
          done();
        });
    });

    it("it should get instagram content from an filled DB", done => {
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
          done();
        });
    });

    it("it should get twitter content from an filled DB", done => {
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
          done();
        });
    });
  });

  //Get posts from all platforms at the same time 
  describe("/POST get popular content in filled DB from all platforms", () => {
    it("it should get content from all platforms from a filled DB", done => {
      chai
        .request(server)
        .post("/aggregate/content")
        .type("application/x-www-form-urlencoded")
        .send({
          'assetType[0]': 'all',
          'filterType[0]': 'popular',
          filterValue: '1',
          limit: '5'
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          done();
        });
    });
  });

  //Get influencer MKHBD 
  describe("/POST get influencer with id=1 from a filled DB", () => {
    it("it should get influencer with id=1", done => {
      chai
        .request(server)
        .post("/aggregate/content")
        .type("application/x-www-form-urlencoded")
        .send({
          'assetType[0]': 'all',
          'filterType[0]': 'influencer',
          'filterValue[0]': '1',
          'filterValue[1]': '1'
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          done();
        });
    });
  });

  //Get user MKHBD 
  describe("/POST get user with id=1 from a filled DB", () => {
    it("it should get user with id=1", done => {
      chai
        .request(server)
        .post("/aggregate/content")
        .type("application/x-www-form-urlencoded")
        .send({
          'assetType[0]': 'all',
          'filterType[0]': 'user',
          'filterValue[0]': '1'
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          done();
        });
    });
  });
};

