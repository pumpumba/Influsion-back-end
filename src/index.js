const express = require("express");
const twitterNodeMachine = require("./api/twitterNodeMachine");
instagram = require("./api/instagram");
youtube = require("./api/youtube");
const { Pool, Client } = require("pg");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const saltRounds = 10; // rounds for hashing. The more, the safer

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

var twitterCloudComponent = require("./api/twitterCloudComponent");
app.use("/twitter", twitterCloudComponent);

//Main page routing
app.get("/", (req, res) => {
  res.send(
    "<h1>Hello! Welcome to Pumba!</h1> <p> For Instagram API, go to ./api/instagram <br>For Twitter API, go to ./api/twitter <br>For Youtube API, go to ./api/youtube </p>"
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
  var dbRequest = "SELECT ACTNAME AS PLATFORMNAME FROM PLATFORMACCOUNT WHERE PLATFORM = '"+platform+"'";
  client.query(dbRequest, (err, dbResult) => {
    console.log(dbResult); //We get a problem if login is
    var dbResults = dbResult;

    if (dbResults != undefined && dbResults["rowCount"] >= 1) {
      dbResults["retrieveSuccess"] = true;
    } else {
      dbResults = err;
      dbResults["retrieveSuccess"] = false;
    }

    res.json(dbResults);

  });
});

//Inserts a post with all the information specificed for a post
app.post("/db/insert_post", (req, res) => {
  var inputObj = req.body;
  var names = ["real_name", "nr_likes", "platform", "usr_text_content", "date_posted", "post_url", "jsonContent"];
  var dbRequest = "INSERT INTO POST(INFLID, NRLIKES, PLATFORM, USRTXTCONTENT, POSTED, POSTURL, PLATFORMCONTENT) \
    VALUES ((SELECT INFLUENCERID FROM INFLUENCER WHERE REALNAME =\
     '"+inputObj.real_name+"'),\
     "+inputObj.nr_likes+", '"+inputObj.platform+"',\
    '"+inputObj.usr_text_content+"', "+inputObj.date_posted+",\
     '"+inputObj.post_url+"',"+inputObj.jsonContent+");"
     client.query(dbRequest, (err, dbResult) => {
       console.log(dbResult);
       console.log(err);
       var dbResults = dbResult;
       if (dbResults != undefined && dbResults["rowCount"] == 1) {


         dbResults["createSuccess"] = true;
       } else {
         dbResults = err;
         dbResults["createSuccess"] = false;
       }

       res.json(dbResults);
     });

});

// Unfollow an influencer by specifiying user_id for user, and influencer_id for influencer
app.post("/db/unfollow_influencer", (req,res) => {

  var inputObj = req.body;
  var usrID = inputObj.user_id;
  var inflID = inputObj.influencer_id;
  var dbRequest = "DELETE FROM USRFLWINFL WHERE FLWRID = "+usrID+" AND INFLID = "+inflID+";";
  console.log(dbRequest);
  client.query(dbRequest, (err, dbResult) => {

    var dbResults = dbResult;
    if (dbResults != undefined && dbResuls["rowCount"] >= 1) {


      dbResults["deleteSuccess"] = true;
    } else {
      dbResults = err;
      dbResults["deleteSuccess"] = false;
    }

    res.json(dbResults);
  });
});

app.post("/db/add_follow_influencer", (req,res) => {
  var inputObj = req.body;
  var usrID = inputObj.user_id;
  var inflID = inputObj.influencer_id;
  var names = ["real_name", "influencer_id"];
  for (i in inputObj) {
    if (names.includes(i)) {
      console.log("Yes!");
    }
  }
  var dbRequest = "INSERT INTO USRFLWINFL (FLWRID, INFLID) VALUES ("+usrID+","+inflID+");";

  client.query(dbRequest, (err, dbResult) => {


    var dbResults = dbResult;
    if (dbResults != undefined && dbResults["rowCount"] == 1) {


      dbResults["createSuccess"] = true;
    } else {
      dbResults = err;
      dbResults["createSuccess"] = false;
    }

    res.json(dbResults);
  });
});

//Returns ALL platformaccounts for all influencers a specific user follows
app.post("/db/get_platf_accs_flwdinfls", (req, res) => {
  var inputObj = req.body;
  var usrID = inputObj.user_id;
  var orderBy = inputObj.order_by;
  var dbRequest = "WITH INFLUENCERWITHPLATFORMACCOUNTS AS ( \
    SELECT INFLUENCER.*, PLATFORMACCOUNT.* FROM INFLUENCER \
    INNER JOIN PLATFORMACCOUNT ON \
    INFLUENCER.INFLUENCERID = PLATFORMACCOUNT.INFLID \
    AND INFLUENCER.INFLUENCERID IN(SELECT INFLID FROM USRFLWINFL WHERE FLWRID = "+usrID+") \
  ) \
  SELECT * FROM INFLUENCERWITHPLATFORMACCOUNTS AS I ";
  if (orderBy != undefined) {
    dbRequest = dbRequest+"ORDER BY "+orderBy;
  }
  dbRequest = dbRequest+";";
  console.log(dbRequest);
  client.query(dbRequest, (err, dbResult) => {

    var dbResults = dbResult;
    if (dbResults != undefined) {


      dbResults["retrieveSuccess"] = true;
    } else {
      dbResults = err;
      dbResults["retrieveSuccess"] = false;
    }

    res.json(dbResults);
  });

});

app.post("/db/get_follow_list_accounts", (req, res) => {
  var inputObj = req.body;
  var usrID = inputObj.user_id;
  var dbRequest = "WITH B AS ( \
    SELECT I.INFLUENCERNAME, U.INFLID \
    FROM USRFLWINFL AS U, INFLUENCER AS I \
    WHERE U.FLWRID = "+usrID+" AND U.INFLID = I.INFLUENCERID \
  ) \
  SELECT B.INFLUENCERNAME, ARRAY(SELECT ACTNAME || ' : ' || PLATFORM \
    FROM PLATFORMACCOUNT \
    WHERE INFLID = B.INFLID) FROM B;";
    client.query(dbRequest, (err, dbResult) => {

      var dbResults = dbResult;
      if (dbResults != undefined) {


        dbResults["retrieveSuccess"] = true;
      } else {
        dbResults = err;
        dbResults["retrieveSuccess"] = false;
      }

      res.json(dbResults);
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
  var usrID = inputObj.user_id;
  var inflID = inputObj.influencer_id;
  var typeOfVisit = inputObj.type_of_visit;
  var dbRequest = "INSERT INTO USRVISIT(USRID, INFLID, TYPEOFVISIT) VALUES ("+usrID+","+inflID+",'"+typeOfVisit+"');";
  client.query(dbRequest, (err, dbResult) => {
    console.log(err);
    console.log(dbResult);
    var dbResults = dbResult;
    if (dbResults != undefined && dbResults["rowCount"] == 1) {


      dbResults["createSuccess"] = true;
    } else {
      dbResults = err;
      dbResults["createSuccess"] = false;
    }

    res.json(dbResults);
  });
});

app.post("/db/modify_user", (req,res) => {
  var inputObj = req.body;
  var hashedPwd = inputObj.password; //TODO: Change to hashed version of password
  var usrname = inputObj.username;
  var age = inputObj.age; //TODO: Change to hashed version of password
  var email = inputObj.email;
  var sex = inputObj.sex;
  var usrID = inputObj.usrid;
  console.log(usrID);
  var dbRequest = "UPDATE USR SET USRNAME = '"+usrname+"', HASHEDPWD = '"+hashedPwd+"', age = "+age+", email = '"+email+"', sex = '"+sex+"' WHERE usrid = "+usrID+";"
  console.log(dbRequest);
  client.query(dbRequest, (err, dbResult) => {
    console.log(dbResult); //We get a problem if login is
    var dbResults = dbResult;

    if (dbResults != undefined && dbResults["rowCount"] == 1) {


      dbResults["updateSuccess"] = true;
    } else if (dbResults == undefined) {
      dbResults = err;
      dbResults["updateSuccess"] = false;

    } else if (dbResults["rowCount"] == 2){
      console.log("2 or more updated. GRAVE ERROR in database.");
    } else {
      dbResults = {};
      dbResults["updateSuccess"] = false;
    }

    res.json(dbResults);

  });
});

function insertionToDB(client, dbRequest, callback) {
  client.query(dbRequest, (err, dbResult) => {

    var dbResults = dbResult;
    if (dbResults != undefined && dbResults["rowCount"] == 1) {


      dbResults["createSuccess"] = true;
    } else {
      dbResults = err;
      dbResults["createSuccess"] = false;
    }

    callback(dbResults);
  });
}
app.use(bodyParser.urlencoded({
  extended: true
}))

app.use(bodyParser.json());
app.post("/db/register_user", (req, res)=> {
  var inputObj = req.body;
  var password = inputObj.password; //TODO: Change to hashed version of password
  var usrname = inputObj.username;
  var age = inputObj.age; //TODO: Change to hashed version of password
  var email = inputObj.email;
  var sex = inputObj.sex;

  bcrypt.hash(password, saltRounds, function(err, hash) {
  // Store hash in your password DB.


  var dbRequest = "INSERT INTO USR (USRNAME, HASHEDPWD, EMAIL, AGE, SEX) VALUES ('"+usrname+"', '"+hash+"', '"+email+"', "+age+", '"+sex+"');"

  insertionToDB(client, dbRequest, (response) => {

    res.json(response);
  });

  });

});

app.post("/db/get_latest_posts", (req, res) => {
  var inputObj = req.body;

  var dbRequest = "WITH INFLLIST AS ( \
    SELECT INFLID \
    FROM USRFLWINFL \
    WHERE FLWRID = "+inputObj.user_id+" \
  ), P AS ( \
    SELECT * FROM POST ";
    if (inputObj.platform != undefined) {
      dbRequest = dbRequest+" WHERE PLATFORM  = '"+inputObj.platform+"' ";
    }

    dbRequest = dbRequest+"ORDER BY POSTED DESC LIMIT "+inputObj.top+" \
  ) \
  SELECT *, (SELECT (COUNT(*) >= 1) FROM INFLLIST WHERE INFLID IN(P.INFLID)) AS USRFOLLOWINGINFLUENCER \
    FROM P ORDER BY POSTED DESC";
    client.query(dbRequest, (err, dbResult) => {
      console.log(err);
      console.log(dbResult);
      var dbResults = dbResult;
      if (dbResults != undefined) {


        dbResults["retrieveSuccess"] = true;
      } else {
        dbResults = err;
        dbResults["retrieveSuccess"] = false;
      }

      res.json(dbResults);
    });

});

app.post("/db/get_content_from_infl", (req, res) => {
  var inputObj = req.body;

  var dbRequest = "WITH P AS ( \
    SELECT * FROM POST \
    WHERE PLATFORM = '"+inputObj.platform+"' AND INFLID = "+inputObj.influencer_id+" \
    ORDER BY POSTED DESC \
  "
  if (inputObj.top != undefined) {
    dbRequest = dbRequest+" LIMIT "+ inputObj.top;
  }
  dbRequest = dbRequest+"), INFLLIST AS ( \
    SELECT INFLID \
    FROM USRFLWINFL \
    WHERE FLWRID = "+inputObj.user_id+" \
  )\
   SELECT *, (SELECT (COUNT(*) >= 1) FROM INFLLIST WHERE INFLID IN(P.INFLID)) AS USRFOLLOWINGINFLUENCER \
    FROM P ORDER BY POSTED DESC";
  dbRequest = dbRequest+";";
  console.log(dbRequest);
  client.query(dbRequest, (err, dbResult) => {

    var dbResults = dbResult;
    if (dbResults != undefined) {


      dbResults["retrieveSuccess"] = true;
    } else {
      dbResults = err;
      dbResults["retrieveSuccess"] = false;
    }

    res.json(dbResults);
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
  var usrname = inputObj.username;

  var dbRequest = "SELECT * FROM usr WHERE usrname = '"+usrname+"'"
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

app.get("/db/get_influencer", (req, res) => {
  dbRequest = "SELECT * FROM INFLUENCER";

  client.query(dbRequest, (err, dbResult) => {

    res.json(dbResult["rows"]);

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
