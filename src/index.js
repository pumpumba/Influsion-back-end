const express = require("express");
const twitterNodeMachine = require("./api/twitterNodeMachine");
instagram = require("./api/instagram");
youtube = require("./api/youtube");
const { Pool, Client } = require("pg");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const saltRounds = 10; // rounds for hashing. The more, the safer
var dbFunctions = require('./dbFunctions');
const hostname = "0.0.0.0";
const port = 8080;
const app = express();

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

pool.query("SELECT NOW()", (err, res) => {
  console.log(err, res);
  pool.end();
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
  console.log(err, res);
  //client.end();
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

var twitterCloudComponent = require("./api/aggregateCloudComponent").getRoutes(client);
app.use("/twitter", twitterCloudComponent);

//Main page routing
app.get("/", (req, res) => {
  res.send(
    "<h1>Hello, friends! Welcome to Pumba!</h1> <p> For Instagram API, go to ./api/instagram <br>For Twitter API, go to ./api/twitter <br>For Youtube API, go to ./api/youtube </p>"
  );
});

//Youtube routing
app.get("/api/youtube", (req, res) => {
  youtube.getYoutube(result => {
    res.json(result);
  });
});

//Instagram routing
app.get("/api/instagram", (req, res) => {
  var result = instagram.getInsta(result => {
    res.json(result);
  });
});

app.use(bodyParser.urlencoded({
  extended: true
}))

app.use(bodyParser.json());

//Get all the platform account names for a specific platform
app.post("/db/get_platform_accounts", (req,res) => {
  var inputObj = req.body;
  var platform = inputObj.platform; //TODO: Change to hashed version of password
  dbFunctions.getPlatformAccounts(platform, client, (response) => {
    res.json(response);
  });
});

//Inserts a post with all the information specificed for a post
app.post("/db/insert_post", (req, res) => {
  var inputObj = req.body;
  dbFunctions.insertPost(inputObj.real_name, inputObj.nr_likes, 
    inputObj.platform, inputObj.usr_text_content, inputObj.date_posted, 
    inputObj.post_url, inputObj.jsonContent, client, (response) => {
      res.json(response);
    });
});

// Unfollow an influencer by specifiying user_id for user, and influencer_id for influencer
app.post("/db/unfollow_influencer", (req,res) => {
  var inputObj = req.body;
  var userID = inputObj.user_id;
  var influencerID = inputObj.influencer_id;
  dbFunctions.unfollowInfluencer(userID, influencerID, client, (response) => {
    res.json(response);
  });
});

app.post("/db/add_follow_influencer", (req,res) => {
  var inputObj = req.body;
  var userID = inputObj.user_id;
  var influencerID = inputObj.influencer_id;
  dbFunctions.addFollowInfluencer(userID, influencerID, client, (response) => {
    res.json(response);
  });
});

//Returns ALL platformaccounts for all influencers a specific user follows
app.post("/db/get_platf_accs_flwdinfls", (req, res) => {
  var inputObj = req.body;
  var userID = inputObj.user_id; //ss
  var orderBy = inputObj.order_by;
  dbFunctions.getPlatformAccountsFromFollowedInfluencers(userID, orderBy, client, (response) => {
    for(var i = 0; i < response['rows'].length; i++) {
      console.log(response['rows'][i]['influencerid']);
    }
    console.log(response['rows'])
    res.json(response);
  });
});

app.post("/db/get_follow_list_accounts", (req, res) => {
  var inputObj = req.body;
  var userID = inputObj.user_id;
  dbFunctions.getFollowListAccounts(userID, client, (response) => {
    res.json(response);
  });
});

app.post("/db/create_tv_operator", (req, res) => {
  var inputObj = req.body;
  var tv_op_name = inputObj.operatorname;
  var pwd = inputObj.password;
  bcrypt.hash(pwd, saltRounds, function(err, hash) {


  var dbRequest = "INSERT INTO TVOPERATOR (TVOPERATORNAME, HASHEDPWD) VALUES ('"+tv_op_name+"', '"+hash+"');"

  insertionToDB(client, dbRequest, (response) => {

    res.json(response);
  });

  });

});

app.post("/db/login_tv_operator", (req, res) => {
  var inputObj = req.body;
  //console.log(inputObj.username);
  var password = inputObj.password; //TODO: Change to hashed version of password
  var tv_op_name = inputObj.operatorname;

  var dbRequest = "SELECT * FROM TVOPERATOR WHERE TVOPERATORNAME = '"+tv_op_name+"'";
  //var dbRequest = "SELECT * FROM usr WHERE (usrname = '"+usrname+"' AND HASHEDPWD = '"+hashedPwd+"')"

  client.query(dbRequest, (err, dbResult) => {
    var dbResults = dbResult["rows"][0];

    if (dbResults != undefined) {
      var hashPassword = dbResult["rows"][0].hashedpwd;

      bcrypt.compare(password, hashPassword, function(err, resultCompare) {
        if (resultCompare == true) {
          dbResults["loginSuccess"] = true;
        } else {
          dbResults = {};
          dbResults["loginSuccess"] = false;
        }

        res.json({dbResults});
      });
    } else {
      dbResults = {};
      dbResults["loginSuccess"] = false;
      res.json({dbResults});
    }
  });
});

app.post("/db/add_user_visit", (req, res) =>  {
  var inputObj = req.body;
  var userID = inputObj.user_id;
  var influencerID = inputObj.influencer_id;
  var typeOfVisit = inputObj.type_of_visit;
  dbFunctions.addUserVisit(userID, influencerID, typeOfVisit, client, (response) => {
    res.json(response);
  });
});

app.post("/db/modify_user", (req,res) => {
  var inputObj = req.body;
  var hashedPassword = inputObj.password; //TODO: Change to hashed version of password
  var username = inputObj.username;
  var age = inputObj.age; //TODO: Change to hashed version of password
  var email = inputObj.email;
  var sex = inputObj.sex;
  var userID = inputObj.usrid;
  dbFunctions.modifyUser(hashedPassword, username, age, email, sex, userID, client, (response) => {
    res.json(response);
  });
});
app.use(bodyParser.urlencoded({
  extended: true
}))

app.use(bodyParser.json());
app.post("/db/register_user", (req, res)=> {
  var inputObj = req.body;
  var password = inputObj.password; //TODO: Change to hashed version of password
  var username = inputObj.username;
  var age = inputObj.age; //TODO: Change to hashed version of password
  var email = inputObj.email;
  var sex = inputObj.sex;
  dbFunctions.registerUser(password, username, age, email, sex, client, (response) => {
    res.json(response);
  });
});

app.post("/db/get_latest_posts", (req, res) => {
  var inputObj = req.body;
  dbFunctions.getLatestPosts(inputObj.platform, inputObj.top, client, (response) => {
    res.json(response);
  });
  /*dbFunctions.getLatestPostsFromFollowedInfluencers(inputObj.user_id, inputObj.platform, inputObj.top, client, (response) => {
    res.json(response);
  }); */
});

app.post("/db/get_content_from_infl", (req, res) => {
  var inputObj = req.body;
  dbFunctions.getContentFromInfluencer(inputObj.platform, inputObj.influencer_id, inputObj.top, inputObj.user_id, client, (response) => {
    res.json(response);
  });
});

app.post("/db/change_tv_op_info", (req, res) => {
  var inputObj = req.body;
  var tv_op_id = inputObj.tv_op_id;
  var tv_op_name = inputObj.operatorname;
  var pwd = inputObj.password;

  bcrypt.hash(pwd, saltRounds, function(err, hash) {


  var dbRequest = "UPDATE TVOPERATOR SET TVOPERATORNAME = '"+tv_op_name+"', HASHEDPWD = '"+hash+"' WHERE TVOPERATORID = "+tv_op_id+";"

  insertionToDB(client, dbRequest, (response) => {

    res.json(response);
  });

  });

});

app.post("/db/login", (req, res) => {
  var inputObj = req.body;
  //console.log(inputObj.username);
  var password = inputObj.password; //TODO: Change to hashed version of password
  var username = inputObj.username;
  dbFunctions.login(password, username, client, (response) => {
    res.json(response);
  });
});

app.get("/db/get_influencer", (req, res) => {
  dbFunctions.getInfluencer(client, (response) => {
    res.json(response);
  });
});

// Jesper test av users. Kan/ska tas bort
app.get("/db/get_user", (req, res) => {
  dbRequest = "SELECT * FROM USR";
  client.query(dbRequest, (err, dbResult) => {
    res.json(dbResult["rows"]);
  });

});



//TODO: THIS ONE SHOULD NOT BE GET, IT SHOULD BE POST, RIGHT?
app.get("/db/add_influencer", (req, res) => {
  //db/get_influencer?realname=FilipCornell&Influencer_name=FilipCornell&age=24

  //dbRequest = "INSERT INTO INFLUENCER (INFLUENCERNAME, REALNAME, AGE) VALUES ("++"'Jockiboi', 'Joakim Lundell', 33);";
  dbRequest = "INSERT INTO INFLUENCER (INFLUENCERNAME, REALNAME, AGE) VALUES ('Jockiboi', 'Joakim Lundell', 33);";
  client.query(dbRequest, (err, dbResult) => {
    //console.log(err, res);
    res.json(dbResult);
    //client.end();
  });
});

//Twitter routing
app.get("/api/twitter", (req, res) => {
  var reqType = req["query"]["request_type"];

  if (reqType === "get_user_tweets") {
    var username = req["query"]["username"];
    var tweetCount = req["query"]["count"];

    twitterNodeMachine.getUserTweets(username, tweetCount, result => {
      res.json(result);
    });
  } else if (reqType === "popular") {
    twitterNodeMachine.getPopularTweets(result => {
      res.json(result);
    });
  } else {
    res.send("Error: This request type is not defined");
  }
});

app.listen(port, hostname);
console.log(`Running on http://${hostname}.${port}`);
