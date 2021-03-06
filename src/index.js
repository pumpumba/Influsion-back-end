if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const express = require("express");
const { Pool, Client } = require("pg");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
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
    if (process.env.NODE_ENV !== "test") {
        console.log(err, res);
    }
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
    if (process.env.NODE_ENV !== "test") {
        console.log(err, res);
    }
});

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

var aggregateCloudComponent = require("./api/aggregateCloudComponent").getRoutes(client);
app.use("/aggregate", aggregateCloudComponent);
var twitterCloudComponent = require("./api/twitterCloudComponent");
app.use("/twitter", twitterCloudComponent);
var youtubeCloudComponent = require("./api/youtubeCloudComponent");
app.use("/youtube", youtubeCloudComponent);

var instagramCloudComponent = require("./api/instagramCloudComponent");
app.use("/instagram", instagramCloudComponent);

//Main page routing
app.get("/", (req, res) => {
    res.send(
        "<h1>Hello! Welcome to Pumba!</h1> <p>See the project Wiki for more information.</p>"
    );
});

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

//Get all the platform account names for a specific platform
app.post("/db/get_platform_accounts", (req, res) => {
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

app.post("/db/remove_excluded_or_promoted_influencer", (req, res) => {
    var inputObj = req.body;
    var dbRequest = "DELETE FROM INFLUENCERPROMOTED WHERE INFLUENCERID = " + inputObj.influencerId +";";
    client.query(dbRequest, (err, dbResult) => {
        var dbResults = dbResult;
        if (dbResults != undefined && dbResults != null) {
            dbResults["deleteSuccess"] = true;
        } else {
            dbResults = {};
            dbResults["deleteSuccess"] = false;
        }
        res.json(dbResults);
    });
});

app.post("/db/exclude_influencer", (req, res)=> {
    var inputObj = req.body;
    var dbRequest = "INSERT INTO INFLUENCERPROMOTED(INFLUENCERID, PROMOTIONID, PROMOTIONTYPE) VALUES ("+ inputObj.influencerId +", 1, 'demotion');";
    client.query(dbRequest, (err, dbResult) => {
        var dbResults = dbResult;
        if (dbResults != undefined && dbResults != null) {
            dbResults["createSuccess"] = true;
        } else {
            dbResults = {};
            dbResults["createSuccess"] = false;
        }
        res.json(dbResults);
    });
});

app.get("/db/list_all_excluded_influencers", (req, res)=> {
    var dbRequest = "SELECT * FROM INFLUENCER WHERE INFLUENCERID IN(SELECT INFLUENCERID FROM INFLUENCERPROMOTED WHERE PROMOTIONTYPE = 'demotion');";
    client.query(dbRequest, (err, dbResult) => {
        var dbResults = dbResult;
        console.log(dbResults);
        if (dbResults != undefined && dbResults != null) {
            dbResults["retrieveSuccess"] = true;
        } else {
            dbResults = {};
            dbResults["retrieveSuccess"] = false;
        }
        res.json(dbResults['rows']);
    });
});

app.get("/db/list_all_promoted_influencers", (req, res)=> {
    var dbRequest = "SELECT * FROM INFLUENCER WHERE INFLUENCERID IN(SELECT INFLUENCERID FROM INFLUENCERPROMOTED WHERE PROMOTIONTYPE = 'promotion');";
    client.query(dbRequest, (err, dbResult) => {
        var dbResults = dbResult;
        if (dbResults != undefined && dbResults != null) {
            dbResults["retrieveSuccess"] = true;
        } else {
            dbResults = {};
            dbResults["retrieveSuccess"] = false;
        }
        res.json(dbResults['rows']);
    });
});

app.get("/db/list_all_promoted_posts", (req, res)=> {
    var dbRequest = "SELECT * FROM POST WHERE (PROMOTEDPOPULAR = TRUE OR PROMOTEDFOLLOWING = TRUE);";
    client.query(dbRequest, (err, dbResult) => {
        var dbResults = dbResult;
        if (dbResults != undefined && dbResults != null) {
            dbResults["retrieveSuccess"] = true;
        } else {
            dbResults = {};
            dbResults["retrieveSuccess"] = false;
        }
        res.json(dbResults['rows']);
    });
});

app.post("/db/promote_influencer", (req, res)=> {
    var inputObj = req.body;
    var dbRequest = "INSERT INTO INFLUENCERPROMOTED(INFLUENCERID, PROMOTIONID, PROMOTIONTYPE) VALUES ("+ inputObj.influencerId +", 1, 'promotion');";
    client.query(dbRequest, (err, dbResult) => {
        var dbResults = dbResult;
        if (dbResults != undefined && dbResults != null) {
            dbResults["createSuccess"] = true;
        } else {
            dbResults = {};
            dbResults["createSuccess"] = false;
        }
        res.json(dbResults);
    });
});

app.post("/db/remove_promote_tag_post_popular", (req, res) =>  {
    var inputObj = req.body;
    var postID = inputObj.postid;
    var dbRequestCheckPost = "SELECT * FROM POST WHERE POSTID = "+ postID + ";";
    client.query(dbRequestCheckPost, (err, dbResult1) => {
        if(dbResult1['rows'].length == 0) {
            var dbResults = {};
            dbResults['removePromoteSuccess'] = false;
            res.json(dbResults);
        }
        else {
            var dbRequest = "UPDATE POST SET PROMOTEDPOPULAR = FALSE WHERE POSTID = " + postID + ";";
            client.query(dbRequest, (err, dbResult) => {
                var dbResults = {};
                if(dbResult != undefined) {
                    dbResults['removePromoteSuccess'] = true;
                    res.json(dbResults);
                }
                else {
                    dbResults['removePromoteSuccess'] = false;
                    res.json(dbResults);
                }
            });
        }
    });
});

app.post("/db/remove_promote_tag_post_following", (req, res) =>  {
    var inputObj = req.body;
    var postID = inputObj.postid;
    var dbRequestCheckPost = "SELECT * FROM POST WHERE POSTID = "+ postID + ";";
    client.query(dbRequestCheckPost, (err, dbResult1) => {
        if(dbResult1['rows'].length == 0) {
            var dbResults = {};
            dbResults['removePromoteSuccess'] = false;
            res.json(dbResults);
        }
        else {
            var dbRequest = "UPDATE POST SET PROMOTEDFOLLOWING = FALSE WHERE POSTID = " + postID + ";";
            client.query(dbRequest, (err, dbResult) => {
                var dbResults = {};
                if(dbResult != undefined) {
                    dbResults['removePromoteSuccess'] = true;
                    res.json(dbResults);
                }
                else {
                    dbResults['removePromoteSuccess'] = false;
                    res.json(dbResults);
                }
            });
        }
    });
});

app.post("/db/promote_post_following", (req, res) =>  {
    var inputObj = req.body;
    var postID = inputObj.postid;
    var dbRequestCheckPost = "SELECT * FROM POST WHERE POSTID = "+ postID + ";";
    client.query(dbRequestCheckPost, (err, dbResult1) => {
        if(dbResult1['rows'].length == 0) {
            var dbResults = {};
            dbResults['promoteSuccess'] = false;
            res.json(dbResults);
        }
        else {
            var dbRequest = "UPDATE POST SET PROMOTEDFOLLOWING = TRUE WHERE POSTID = " + postID + ";";
            client.query(dbRequest, (err, dbResult) => {
                var dbResults = {};
                if(dbResult != undefined) {
                    dbResults['promoteSuccess'] = true;
                    res.json(dbResults);
                }
                else {
                    dbResults['promoteSuccess'] = false;
                    res.json(dbResults);
                }
            });
        }
    });
});

app.post("/db/promote_post_popular", (req, res) =>  {
    var inputObj = req.body;
    var postID = inputObj.postid;
    var dbRequestCheckPost = "SELECT * FROM POST WHERE POSTID = "+ postID + ";";
    client.query(dbRequestCheckPost, (err, dbResult1) => {
        if(dbResult1['rows'].length == 0) {
            var dbResults = {};
            dbResults['promoteSuccess'] = false;
            res.json(dbResults);
        }
        else {
            var dbRequest = "UPDATE POST SET PROMOTEDPOPULAR = TRUE WHERE POSTID = " + postID + ";";
            client.query(dbRequest, (err, dbResult) => {
                var dbResults = {};
                if(dbResult != undefined) {
                    dbResults['promoteSuccess'] = true;
                    res.json(dbResults);
                }
                else {
                    dbResults['promoteSuccess'] = false;
                    res.json(dbResults);
                }
            });
        }
    });
});

// Create ad
app.post("/db/create_ad", (req, res) => {
  var inputObj = req.body;
  var dbRequest = "INSERT INTO TVOPERATORCONTENT(TITLE, TVOPERATORID, IMGURL, TEXTDESCRIPTION, ADDITIONALINFORMATION, SHOWINPOPULARFEED, READMOREURL, SHOWINFOLLOWINGFEED) \
    VALUES ('" + inputObj.title + "', \
    " + inputObj.tvoperatorid + ", \
    '" + inputObj.imgurl + "', \
    '" + inputObj.textdescription + "', \
    '" + inputObj.additionalinformation + "', \
    " + inputObj.showinpopularfeed + ", \
    '" + inputObj.read_more_url + "', \
    " + inputObj.showinfollowingfeed + ");";

    client.query(dbRequest, (err, dbResult) => {
      var dbResults = dbResult;
      if (dbResults != undefined && dbResults != null) {
        dbResults["createSuccess"] = true;
      } else {
        dbResults = {};
        dbResults["createSuccess"] = false;
      }

      res.json(dbResults);
    });
});

// Remove ad
app.post("/db/remove_ad", (req, res) => {
  var inputObj = req.body;

  // Remove from TVOPERATORCONTENTCLICK first
  var dbRequest1 = "DELETE FROM TVOPERATORCONTENTCLICK WHERE ADID =" + inputObj.id + ";";
  client.query(dbRequest1, (err, dbResult1) => {
      if (dbResult1 != undefined && dbResult1 != null) {

        // Remove from TVOPERATORCONTENT
        var dbRequest2 = "DELETE FROM TVOPERATORCONTENT WHERE ADID = " + inputObj.id + ";";
        client.query(dbRequest2, (err, dbResult2) => {
            var dbResults2 = dbResult2;
            if (dbResults2 != undefined && dbResults2 != null) {
                dbResults2["deleteSuccess"] = true;
            } else {
                dbResults2 = {};
                dbResults2["deleteSuccess"] = false;
            }

            res.json(dbResults2);
        });

      } else {
          dbResults1 = {};
          dbResults1["deleteSuccess"] = false;
          res.json(dbResults1);
      }
  });


});

// Get ads
app.get("/db/get_ads", (req, res) => {
  var dbRequest = "SELECT * FROM TVOPERATORCONTENT;";
  client.query(dbRequest, (err, dbResult) => {
      var dbResults = dbResult;
      if (dbResults != undefined && dbResults != null) {
          dbResults["retrieveSuccess"] = true;
      } else {
          dbResults = {};
          dbResults["retrieveSuccess"] = false;
      }

      res.json(dbResults);
  });
});

// Returns posts from all influencers that a user follows.
app.get("/db/get_followed_infl_posts", (req, res) => {
    var usrID = req["query"]["userid"];
    var dbRequest = "SELECT * FROM POST AS P WHERE P.INFLID IN(SELECT INFLID FROM USRFLWINFL WHERE FLWRID = " + usrID + ") ORDER BY POSTED DESC;"
    client.query(dbRequest, (err, dbResult) => {
        console.log(dbResult); //TODO: We get a problem if login is WHAT? Who wrote this?
        var dbResults = dbResult;

        if (dbResults != undefined && dbResults != null) {
            dbResults["retrieveSuccess"] = true;
        } else {
            dbResults = {};
            dbResults["retrieveSuccess"] = false;
        }

        res.json(dbResults);
    });
});

// Unfollow an influencer by specifiying user_id for user, and influencer_id for influencer
app.post("/db/unfollow_influencer", (req, res) => {
    var inputObj = req.body;
    var userID = inputObj.user_id;
    var influencerID = inputObj.influencer_id;
    dbFunctions.unfollowInfluencer(userID, influencerID, client, (response) => {
        res.json(response);
    });
});

// Makes a user follow an influencer.
app.post("/db/add_follow_influencer", (req, res) => {
    var inputObj = req.body;
    var userID = inputObj.user_id;
    var influencerID = inputObj.influencer_id;
    var names = ["real_name", "influencer_id"];
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
        res.json(response);
    });
});

// Returns the influencerID, the influencer account name and the platform linked to the account name in a string.
// TODO: Not really a good function; should rather return a json object.
app.post("/db/get_follow_list_accounts", (req, res) => {
    var inputObj = req.body;
    var userID = inputObj.user_id;
    dbFunctions.getFollowListAccounts(userID, client, (response) => {
        res.json(response);
    });
});

// Creates a tv operator account.
app.post("/db/create_tv_operator", (req, res) => {

  var inputObj = req.body;
  var tv_op_name = inputObj.operatorname;
  var pwd = inputObj.password;
  var email = inputObj.email;
  bcrypt.hash(pwd, saltRounds, function (err, hash) {
    var dbRequest = "INSERT INTO TVOPERATOR (TVOPERATORNAME, HASHEDPWD, EMAIL) VALUES ('" + tv_op_name + "', '" + hash + "', '"+email+"');"

    client.query(dbRequest, (err, dbResult) => {
      if (dbResult != null && dbResult != undefined) {
          res.json(dbResult);
      } else {
          res.json(err);
      }


        });

    });

});

// Logs in a tv operator.
app.post("/db/login_tv_operator", (req, res) => {
    var inputObj = req.body;
    var password = inputObj.password; //TODO: Change to hashed version of password
    var tv_op_name = inputObj.operatorname;
    var dbRequest = "SELECT * FROM TVOPERATOR WHERE TVOPERATORNAME = '" + tv_op_name + "'";
    client.query(dbRequest, (err, dbResult) => {
        var dbResults = dbResult["rows"][0];

        if (dbResults != undefined) {
            var hashPassword = dbResult["rows"][0].hashedpwd;

            bcrypt.compare(password, hashPassword, function (err, resultCompare) {
                if (resultCompare == true) {
                    dbResults["loginSuccess"] = true;
                } else {
                    dbResults = {};
                    dbResults["loginSuccess"] = false;
                }
                res.json({ dbResults });
            });
        } else {
            dbResults = {};
            dbResults["loginSuccess"] = false;
            res.json({ dbResults });
        }
    });
});

// Returns a user based on user id (sent in as usrid)
app.get("/db/get_user", (req, res) => {
    var usrID = req["query"]["usrid"];
    var dbRequest = "SELECT * FROM USR WHERE usrid = " + usrID + ";";
    client.query(dbRequest, (err, dbResult) => {
        var dbResults = dbResult["rows"];
        if (dbResults != undefined) {
            dbResults["retrieveSuccess"] = true;
        } else {
            dbResults = {};
            dbResults["retrieveSuccess"] = false;
        }
        res.json(dbResults);
    });
});

// Returns all users stored in the database.
app.get("/db/get_all_users", (req, res) => {
    var dbRequest = "SELECT * FROM USR;";
    client.query(dbRequest, (err, dbResult) => {
        var dbResults = dbResult;
        if (dbResults != undefined) {
            dbResults["retrieveSuccess"] = true;
        } else {
            dbResults = {};
            dbResults["retrieveSuccess"] = false;
        }
        res.json(dbResults);
    });
});

// Adds a visit from a user (send in user_id) to an influencer (send in influencer_id)
// Send in also, which type of vist (as type_of_visit). Can be 'profilevisit', 'instagrampost', 'twitterpost' or 'youtubevideo'
app.post("/db/add_user_visit", (req, res) => {
    var inputObj = req.body;
    var userID = inputObj.user_id;
    var influencerID = inputObj.influencer_id;
    var typeOfVisit = inputObj.type_of_visit;
    dbFunctions.addUserVisit(userID, influencerID, typeOfVisit, client, (response) => {
        res.json(response);
    });
});

app.post("/db/add_user_like", (req, res) => {
    var inputObj = req.body;
    var usrID = inputObj.user_id;
    var postID = inputObj.post_id;
    var dbRequest = "INSERT INTO USRLIKEPOST (USRID, POSTID) VALUES (" + usrID + "," + postID + ");";
    client.query(dbRequest, (err, dbResult) => {

        res.json(dbResult);


    });

});

app.get("/db/get_most_followed_users_clicked_promo", (req,res) => {
  var limit = req["query"]["limit"];
  var ad_id = req["query"]["ad_id"];
  /*var dbRequest = "WITH USERSCLICKEDADV AS ( \
    SELECT DISTINCT(USRID)  \
    FROM TVOPERATORCONTENTCLICK  \
    WHERE ADID = "+ad_id+" \
  ) \
  SELECT INFLID, \
  (SELECT INFLUENCER.INFLUENCERNAME \
    FROM INFLUENCER \
    WHERE INFLUENCER.INFLUENCERID = USRFLWINFL.INFLID) AS INFLUENCERNAME, \
    COUNT(*) AS NRFOLLOWING \
    FROM USRFLWINFL, USERSCLICKEDADV \
    WHERE USRFLWINFL.FLWRID IN(USERSCLICKEDADV.USRID) \
    GROUP BY INFLID \
    ORDER BY NRFOLLOWING \
    DESC LIMIT "+limit+";"*/

    var dbRequest = "WITH USERSCLICKEDADV AS ( \
      SELECT DISTINCT(USRID) \
      FROM TVOPERATORCONTENTCLICK \
      WHERE ADID = "+ad_id+" \
    ) \
    SELECT INFLID, \
    (SELECT INFLUENCER.INFLUENCERNAME \
      FROM INFLUENCER \
      WHERE INFLUENCER.INFLUENCERID = USRFLWINFL.INFLID) AS INFLUENCERNAME, (SELECT json_build_object('platformaccounts', \
        json_agg( \
          json_build_object( \
            'actname', \
            PACC.actname, \
            'platform', \
            PACC.PLATFORM, \
            'imgurl', \
            PACC.IMGURL))) as IMG \
            FROM PLATFORMACCOUNT AS PACC \
            WHERE PACC.INFLID = USRFLWINFL.INFLID \
            GROUP BY PACC.INFLID) AS IMG, \
      COUNT(*) AS NRFOLLOWING \
      FROM USRFLWINFL, USERSCLICKEDADV \
      WHERE USRFLWINFL.FLWRID IN(USERSCLICKEDADV.USRID) \
      GROUP BY INFLID \
      ORDER BY NRFOLLOWING \
      DESC LIMIT "+limit+";";

    client.query(dbRequest, (err, dbResult) => {

      if (dbResult != undefined) {
        var dbResults = dbResult;
        dbResults["retrieveSuccess"] = true;
      } else {
        var dbResults = err;
        dbResults["retrieveSuccess"] = false;
      }
      res.json(dbResults);
    });
});

app.get("/db/get_visits_over_time_for_ad", (req, res) => {
  var ad_id = req["query"]["ad_id"];
  var dbRequest = "WITH DATES AS ( \
    SELECT VISITTIME::date FROM TVOPERATORCONTENTCLICK WHERE ADID = "+ad_id+" \
  ) \
  SELECT (SELECT "+ad_id+") AS ADID, \
    DATES.VISITTIME AS DATEVISITED, \
    COUNT(DATES.VISITTIME) AS NRVISITSONDAY \
    FROM DATES \
    GROUP BY DATEVISITED \
    ORDER BY DATEVISITED ASC;";
  client.query(dbRequest, (err, dbResult) => {

    if (dbResult != undefined) {
      var dbResults = dbResult["rows"];
      dbResults["retrieveSuccess"] = true;
    } else {
      var dbResults = err;
      dbResults["retrieveSuccess"] = false;
    }
    res.json(dbResults);
  });

})

app.get("/db/get_top_clicked_influencers", (req, res) => {
  var limit = req["query"]["limit"];
  if (limit != undefined) {
    var dbRequest = "SELECT COUNT(*) AS NRCLICKS, INFLUENCER.*, (SELECT json_build_object('platformaccounts', \
      json_agg( \
        json_build_object( \
          'actname', \
          PACC.actname, \
          'platform', \
          PACC.PLATFORM, \
          'imgurl', \
          PACC.IMGURL))) as IMG \
          FROM PLATFORMACCOUNT AS PACC \
          WHERE PACC.INFLID = INFLUENCER.INFLUENCERID \
          GROUP BY PACC.INFLID) FROM INFLUENCER \
          INNER JOIN USRVISIT ON INFLUENCER.INFLUENCERID = USRVISIT.INFLID \
          GROUP BY INFLUENCER.INFLUENCERID LIMIT "+limit+";";
  } else {
    var dbRequest = "SELECT COUNT(*) AS NRCLICKS, INFLUENCER.*, (SELECT json_build_object('platformaccounts', \
      json_agg( \
        json_build_object( \
          'actname', \
          PACC.actname, \
          'platform', \
          PACC.PLATFORM, \
          'imgurl', \
          PACC.IMGURL))) as IMG \
          FROM PLATFORMACCOUNT AS PACC \
          WHERE PACC.INFLID = INFLUENCER.INFLUENCERID \
          GROUP BY PACC.INFLID) FROM INFLUENCER \
          INNER JOIN USRVISIT ON INFLUENCER.INFLUENCERID = USRVISIT.INFLID \
          GROUP BY INFLUENCER.INFLUENCERID;";
  }

  client.query(dbRequest, (err, dbResult) => {

    if (dbResult != undefined) {
      var dbResults = dbResult;
      dbResults["retrieveSuccess"] = true;
    } else {
      var dbResults = err;
      dbResults["retrieveSuccess"] = false;
    }
    res.json(dbResults);
  });
});

app.get("/db/get_clicks_promoted_influencers", (req, res) => {
    var inputObj = req.body;
    var promotion_id = req["query"]["promotion_id"];
    var tv_op_id = req["query"]["tv_op_id"];
    var dbRequest = "SELECT I.INFLID, COUNT(*) AS NRCLICKS, (SELECT \
    (COUNT(*) >= 1) \
    FROM INFLUENCERPROMOTED \
    WHERE INFLUENCERID IN(I.INFLID)";

    if (promotion_id != undefined) {
        dbRequest = dbRequest + " AND PROMOTIONID = " + promotion_id + ") AS ISPROMOTEDBYCAMPAIGN";
    } else {
        dbRequest = dbRequest + " AND PROMOTIONID IN(SELECT PROMOTIONID FROM PROMOTION WHERE TVOPERATORID = " + tv_op_id + ")) AS ISPROMOTEDBYCAMPAIGN";
    }


    dbRequest = dbRequest + " FROM USRVISIT AS I GROUP BY I.INFLID \
    ORDER BY NRCLICKS DESC;"
    client.query(dbRequest, (err, dbResult) => {

        if (dbResult != undefined) {
            var dbResults = dbResult["rows"];
            dbResults["retrieveSuccess"] = true;
        } else {
            var dbResults = {};
            dbResults["retrieveSuccess"] = false;
        }
        res.json(dbResults);
    });

});

app.post("/db/influencer_promotion", (req, res) => {
    var inputObj = req.body;
    var promotionType = inputObj.promotion_type;
    var infl_id = inputObj.influencer_id;
    var promotion_id = inputObj.promotion_id;
    var dbRequest = "INSERT INTO INFLUENCERPROMOTED(INFLUENCERID, PROMOTIONID, PROMOTIONTYPE) VALUES (" + infl_id + "," + promotion_id + ", '" + promotionType + "');";
    client.query(dbRequest, (err, dbResult) => {
        var dbResults = dbResult;
        if (dbResults != undefined) {
            dbResults["createSuccess"] = true;
        } else {
            dbResults = {};
            dbResults["createSuccess"] = false;
        }
        res.json(dbResults);
    });
});

app.post("/db/hashtag_promotion", (req, res) => {
    var inputObj = req.body;
    var promotionType = inputObj.promotion_type;
    var tag = inputObj.tag;
    var promotion_id = inputObj.promotion_id;
    var dbRequest = "INSERT INTO TAGPROMOTED(TAGID, PROMOTIONID, PROMOTIONTYPE) VALUES ((SELECT TAGID FROM TAG WHERE TAGNAME = '" + tag + "')," + promotion_id + ", '" + promotionType + "');";
    client.query(dbRequest, (err, dbResult) => {
        var dbResults = dbResult;
        if (dbResults != undefined) {
            dbResults["createSuccess"] = true;
        } else {
            dbResults = {};
            dbResults["createSuccess"] = false;
        }
        res.json(dbResults);
    });
});

app.get("/db/get_counts", (req, res) => {
    var dbRequest = "SELECT (SELECT COUNT(DISTINCT USR) FROM USR) as NRUSERS, (SELECT COUNT(DISTINCT INFLUENCERID) FROM INFLUENCER) AS NRINFLUENCERS;";
    client.query(dbRequest, (err, dbResult) => {
        res.json(dbResult);
    });
});

app.post("/db/add_ad_click", (req, res) => {
  var inputObj = req.body;
  var usrID = inputObj.user_id;
  var adID = inputObj.ad_id;
  var dbRequest = "INSERT INTO TVOPERATORCONTENTCLICK (USRID, ADID) VALUES ("+usrID+","+adID+");";
  client.query(dbRequest, (err, dbResult) => {
    var dbResults = dbResult;
    if (dbResults != undefined) {
      dbResults["insertionSuccess"] = true;
    } else {
      dbResults = {};
      dbResults["insertionSuccess"] = false;
    }
    res.json(dbResults);
  });

});

app.get("/db/get_most_followed_influencers", (req, res) => {
    var limit = req["query"]["limit"];
    var dbRequest = "SELECT (SELECT COUNT(*) FROM USRFLWINFL WHERE USRFLWINFL.INFLID = I.INFLUENCERID) AS NRFOLLOWING, I.INFLUENCERNAME, I.INFLUENCERID, (json_build_object('platformaccounts', \
  json_agg( \
    json_build_object( \
      'actname', \
      PACC.actname, \
      'platform', \
      PACC.PLATFORM, \
      'imgurl', \
      PACC.IMGURL))) \
    ) AS IMGS \
      FROM INFLUENCER AS I, PLATFORMACCOUNT AS PACC WHERE I.INFLUENCERID = PACC.INFLID GROUP BY I.INFLUENCERID ORDER BY NRFOLLOWING DESC LIMIT "+limit+";";

    client.query(dbRequest, (err, dbResult) => {
        var dbResults = dbResult["rows"];
        if (dbResults != undefined) {
            dbResults["retrieveSuccess"] = true;
        } else {
            dbResults = {};
            dbResults["retrieveSuccess"] = false;
        }
        res.json(dbResults);
    });
});

app.get("/db/get_for_autosearch", (req, res) => {
    var user_id = req["query"]["user_id"];
    var dbRequest = "WITH INFLLIST AS ( \
    SELECT INFLID \
    FROM USRFLWINFL \
    WHERE FLWRID = "+ user_id + " \
  ), PLATFORMACCOUNTS AS ( \
    SELECT PACC.INFLID, json_build_object('platformaccounts', \
      json_agg( \
        json_build_object( \
          'actname', \
          PACC.actname, \
          'platform', \
          PACC.PLATFORM, \
          'img_url', \
          PACC.IMGURL))) \
          AS PFACCS FROM PLATFORMACCOUNT AS PACC \
          GROUP BY INFLID \
  ), IPC AS ( \
    SELECT INFLUENCER.INFLUENCERNAME, INFLUENCER.REALNAME, PLATFORMACCOUNTS.* FROM INFLUENCER \
    INNER JOIN PLATFORMACCOUNTS ON \
    INFLUENCER.INFLUENCERID = PLATFORMACCOUNTS.INFLID \
  ) \
   SELECT DISTINCT ON (IPC.INFLID, IPC.INFLUENCERNAME, IPC.REALNAME) IPC.*, (SELECT (COUNT(*) >= 1) FROM INFLLIST WHERE INFLLIST.INFLID IN(IPC.INFLID)) AS USRFOLLOWINGINFLUENCER FROM IPC;"
    client.query(dbRequest, (err, dbResult) => {
        var dbResults = dbResult["rows"];
        if (dbResults != undefined) {
            dbResults["retrieveSuccess"] = true;
        } else {
            dbResults = {};
            dbResults["retrieveSuccess"] = false;
        }
        res.json(dbResults);
    });
});

app.post("/db/delete_user_like", (req, res) => {
    var inputObj = req.body;
    var usrID = inputObj.user_id;
    var postID = inputObj.post_id;
    var dbRequest = "DELETE FROM USRLIKEPOST WHERE USRID = " + usrID + " AND POSTID = " + postID + ";"
    client.query(dbRequest, (err, dbResult) => {
        var dbResults = dbResult;
        if (dbResults != undefined) {
            dbResults["deleteSuccess"] = true;
        } else {
            dbResults = {};
            dbResults["deleteSuccess"] = false;
        }
        res.json(dbResults);
    });

});

// Modifies a user's information. All information needs to be sent in, or error will be returned. If something is not changed, send in the old information.
app.post("/db/modify_user", (req, res) => {
    var inputObj = req.body;
    var password = inputObj.password; //TODO: Change to hashed version of password
    var username = inputObj.username;
    var age = inputObj.age; //TODO: Change to hashed version of password
    var email = inputObj.email;
    var sex = inputObj.sex;
    var userID = inputObj.usrid;
    dbFunctions.modifyUser(password, username, age, email, sex, userID, client, (response) => {
        res.json(response);
    });
});
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

//Registers a user. Send in all the information. If something is not specified, send in null
app.post("/db/register_user", (req, res) => {
    var inputObj = req.body;
    var password = inputObj.password;
    var username = inputObj.username;
    var age = inputObj.age;
    var email = inputObj.email;
    var sex = inputObj.sex;
    dbFunctions.registerUser(password, username, age, email, sex, client, (response) => {
        res.json(response);
    });
});

// Deletes a user and
app.post("/db/delete_user", (req, res) => {
    var inputObj = req.body;
    var usrID = inputObj.usrid;
    var password = inputObj.password;
    var dbRequest = "SELECT * FROM USR WHERE usrid = " + usrID + ";";

    client.query(dbRequest, (err, dbResult) => {
        var dbResults = dbResult["rows"][0];

        if (dbResults != undefined) {
            var hashPassword = dbResult["rows"][0].hashedpwd;
            /*
            DELETE FROM USRLIKEPOST WHERE USRID = "+ usrID + "; \
                DELETE FROM USRVISIT WHERE usrid = "+ usrID + "; \ */

            bcrypt.compare(password, hashPassword, function (err, resultCompare) {
                if (resultCompare == true) {
                    var dbRequest = "BEGIN; \
          DELETE FROM USRFLWINFL WHERE FLWRID = "+ usrID + "; \
          DELETE FROM USRLIKEPOST WHERE USRID = "+ usrID + "; \
          DELETE FROM USRVISIT WHERE usrid = "+ usrID + "; \
          DELETE FROM USR WHERE usrid = "+ usrID + "; \
          COMMIT;";
                    client.query(dbRequest, (err, dbResult) => {
                        var dbResults = dbResult;
                        console.log("We are here");
                        console.log(dbResults);
                        if (dbResults != undefined) {
                            dbResults = {};
                            dbResults["deleteSuccess"] = true;
                            res.json(dbResults);
                        } else {
                            dbResults = {};
                            dbResults["deleteSuccess"] = false;
                            res.json(dbResults);
                        }
                    });

                } else {
                    dbResults = {};
                    dbResults["deleteSuccess"] = false;
                    res.json(dbResults);
                }
            });
        } else {
            dbResults = {};
            dbResults["deleteSuccess"] = false;

            res.json({ dbResults });
        }
    });
});

// Returns the latest posts
app.post("/db/get_latest_posts", (req, res) => {
    var inputObj = req.body;
    dbFunctions.getLatestPosts(inputObj.user_id, inputObj.platform, inputObj.top, client, (response) => {
        res.json(response);
    });

});

// Returns all the content from an influencer (send in influencerID, platform (can be 'all'))
// Send in top (optional) which limits the number of posts.
app.post("/db/get_content_from_infl", (req, res) => {
    var inputObj = req.body;
    dbFunctions.getContentFromInfluencer(inputObj.platform, inputObj.influencer_id, inputObj.top, inputObj.user_id, client, (response) => {
        res.json(response);
    });
});

// Same as modify user but for tv operators.
app.post("/db/change_tv_op_info", (req, res) => {
    var inputObj = req.body;
    var tv_op_id = inputObj.tv_op_id;
    var tv_op_name = inputObj.operatorname;
    var pwd = inputObj.password;

    var dbRequestCheckOperator = "SELECT * FROM TVOPERATOR WHERE TVOPERATORID = "+ tv_op_id + ";";
    client.query(dbRequestCheckOperator, (err, dbResult1) => {
        if(dbResult1['rows'].length == 0) {
            var dbResults = {};
            dbResults['updateSuccess'] = false;
            res.json(dbResults);
        }
        else {
            bcrypt.hash(pwd, saltRounds, function (err, hash) {
                var dbRequest = "UPDATE TVOPERATOR SET TVOPERATORNAME = '" + tv_op_name + "', HASHEDPWD = '" + hash + "' WHERE TVOPERATORID = " + tv_op_id + ";"
                client.query(dbRequest, (err, dbResult) => {

                    res.json(dbResult);


                });
            });
        }
    });
});

// Logs in a user by checking password and username.
app.post("/db/login", (req, res) => {
    var inputObj = req.body;
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

//TODO: THIS ONE SHOULD NOT BE GET, IT SHOULD BE POST, RIGHT?
//TODO: This one should be changed to actually be able to add any influencer.
app.get("/db/add_influencer", (req, res) => {
    dbRequest = "INSERT INTO INFLUENCER (INFLUENCERNAME, REALNAME, AGE) VALUES ('Jockiboi', 'Joakim Lundell', 33);";
    client.query(dbRequest, (err, dbResult) => {
        res.json(dbResult);
    });
});

app.post("/db/search_influencer", (req, res) => {
    var inputObj = req.body;
    var keyword = inputObj.keyword;

    // Make to lowercase
    keyword = keyword.toLowerCase();
    var dbRequest = "SELECT DISTINCT ON (I.INFLUENCERID, I.INFLUENCERNAME, I.REALNAME) I.INFLUENCERID, I.INFLUENCERNAME, I.REALNAME, P.IMGURL FROM INFLUENCER AS I \
    INNER JOIN PLATFORMACCOUNT AS P ON I.INFLUENCERID = P.INFLID \
    WHERE LOWER(I.INFLUENCERNAME) LIKE '%"+ keyword + "%' OR LOWER(I.REALNAME) LIKE '%" + keyword + "%' OR LOWER(P.ACTNAME) LIKE '%" + keyword + "%';";
    client.query(dbRequest, (err, dbResult) => {

        res.json(dbResult);

    });


});

app.listen(port, hostname);
console.log(`Running on http://${hostname}.${port}`);

app.get("/db/get_user_ages", (req, res) => {
    var dbRequest = "SELECT AGE FROM USR;";
    client.query(dbRequest, (err, dbResult) => {
        res.json(dbResult);
    });
});

// Updates a platformaccount with the info sent in.
/* OBSERVE: THIS FUNCTION ONLY RETURNS THE CORRECT REQUEST. I HAVE TRIED THE REQUESTS IN TERMINAL,
  BUT IT STILL REMAINS TO IMPLEMENT COMPLETE FUNCTIONALITY, BUT THIS SHOULD BE DONE IN ANOTHER PLACE.
*/
app.post("/db/update_platform_acc", (req, res) => {
    var inputObj = req.body;

    //Put everything into a json object.
    var jsonObj = {
        "ACTNAME": inputObj.actname, //check
        "PLATFORM": inputObj.platform, //not necessary to implement below
        "NRFLWRS": inputObj.nr_flwrs, //check
        "MEMBERSINCE": inputObj.member_since, //MUST BE UNIX TIME FORMAT
        "ACTURL": inputObj.act_url, //check
        "IMGURL": inputObj.img_url, //check
        "VERIFIED": inputObj.is_verified, //check
        "PLATFORMCONTENT": inputObj.platform_content
    }
    console.log(jsonObj);
    // We loop through the json object. If something is not defined,
    // then we simply do not add this to the request.
    var dbRequest = "UPDATE PLATFORMACCOUNT SET ";
    for (key in jsonObj) {
        if (jsonObj[key] != undefined) {
            switch (key) {
                case "ACTNAME":
                case "ACTURL":
                case "IMGURL":
                    dbRequest = dbRequest + key + " = '" + jsonObj[key] + "', ";
                    break;
                case "NRFLWRS":
                case "VERIFIED":
                    dbRequest = dbRequest + key + " = " + jsonObj[key] + ", ";
                    break;
                case "MEMBERSINCE":
                    dbRequest = dbRequest + key + " = to_timestamp(" + jsonObj[key] + "), ";
                    break;
                case "PLATFORMCONTENT":
                    // Do note that we might have to do regex if we send in json objects here, and replace ' with '' to escape.
                    // in that case, do regex on jsonObj[key]
                    dbRequest = dbRequest + key + " = '" + jsonObj[key] + "'::json, ";
                    break;
            }
        }


    }
    // Remove the last , and space, and add the last bit of the request to finish it
    dbRequest = dbRequest.substr(0, dbRequest.length - 2);
    dbRequest = dbRequest + " WHERE INFLID = " + inputObj.inflid + " AND PLATFORM = '" + inputObj.platform + "';";

    // Here, I just send back the actual db request. Should be different when actually implementing it for real.
    res.send(dbRequest);
});

app.get("/db/get_all_info_infl", (req, res) => {
    var infl_id = req["query"]["influencer_id"];
    var dbRequest = "WITH PLATFORMACCOUNTS AS ( \
    SELECT PACC.INFLID, json_build_object('platformaccounts', \
      json_agg( \
        json_build_object('nr_flwrs', \
          PACC.NRFLWRS, \
          'member_since', \
          PACC.MEMBERSINCE, \
          'act_url', \
          PACC.ACTURL, \
          'is_verified', \
          PACC.VERIFIED, \
          'usr_desc', \
          PACC.USRDESC, \
          'platform', \
          PACC.platform, \
          'piclink', \
          PACC.imgurl, \
          'actname', \
          PACC.actname, \
          'platform_content', \
          PACC.platformcontent))) \
          AS PFACCS FROM PLATFORMACCOUNT AS PACC \
          WHERE INFLID = "+ infl_id + " \
          GROUP BY INFLID \
  ), USERPOSTS AS ( \
    SELECT P.INFLID, json_build_object('platformaccounts', \
      json_agg( \
        json_build_object('post_id', \
          P.POSTID, \
          'nr_likes', \
          P.NRLIKES, \
          'platform', \
          P.PLATFORM, \
          'usr_text_content', \
          P.USRTXTCONTENT, \
          'posted', \
          P.POSTED, \
          'post_platform_id', \
          P.POSTPLATFORMID, \
          'platform_content', \
          P.platformcontent))) \
          AS posts FROM POST AS P \
          WHERE INFLID = "+ infl_id;
    if (req["query"]["post_platform"] != undefined) {
        dbRequest = dbRequest + " AND platform = '" + req["query"]["post_platform"] + "'";
    }

    dbRequest = dbRequest + " GROUP BY INFLID \
  ), IPC AS ( \
    SELECT INFLUENCER.*, USERPOSTS.POSTS, PLATFORMACCOUNTS.PFACCS FROM INFLUENCER \
    INNER JOIN PLATFORMACCOUNTS ON \
    INFLUENCER.INFLUENCERID = PLATFORMACCOUNTS.INFLID \
    INNER JOIN USERPOSTS ON \
    PLATFORMACCOUNTS.INFLID = USERPOSTS.INFLID \
  ) \
  SELECT * FROM IPC;"
    console.log()
    client.query(dbRequest, (err, dbResult) => {
        var dbResults = dbResult;
        if (dbResults != undefined) {
            dbResults["retrieveSuccess"] = true;
        } else {
            dbResults = {};
            dbResults["retrieveSuccess"] = false;
        }
        res.json(dbResults);
    });

});


app.get("/db/get_avg_age_usrs_click", (req, res) => {
  var ad_id = req["query"]["ad_id"];

  console.log(ad_id);
  var dbRequest = "WITH USERSCLICKED AS ( \
    SELECT DISTINCT(USRID) FROM TVOPERATORCONTENTCLICK WHERE ADID = "+ad_id+" \
  ) \
  SELECT CAST (AVG(USR.AGE) AS INTEGER) AS AVGAGE FROM USR, USERSCLICKED WHERE USR.USRID = USERSCLICKED.USRID;"
  client.query(dbRequest, (err, dbResult) => {
    var dbResults = dbResult["rows"];
    if (dbResults != undefined) {
      dbResults["retrieveSuccess"] = true;
    } else {
      dbResults = err;
      dbResults["retrieveSuccess"] = false;
    }
    res.json(dbResults);
  });
});

//For testing
module.exports = app;
