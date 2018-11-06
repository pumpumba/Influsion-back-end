const bcrypt = require('bcrypt');
var self = module.exports = {
    getPlatformAccounts: function(platform, client, callback) {
        //TODO: Change to hashed version of password
        var dbRequest = "SELECT INFLID AS INFLUENCERID, ACTNAME AS PLATFORMNAME FROM PLATFORMACCOUNT WHERE PLATFORM = '"+platform+"'";
        client.query(dbRequest, (err, dbResult) => {
            console.log(dbResult); //We get a problem if login is
            var dbResults = dbResult;

            if (dbResults != undefined && dbResults["rowCount"] >= 1) {
            dbResults["retrieveSuccess"] = true;
            } else {
            dbResults = err;
            dbResults["retrieveSuccess"] = false;
            }
            callback(Results);
        });
    },

    getFollowedInfluencersPosts: function(userID, limit, platform, client, callback) {
        var dbRequest = "SELECT * FROM POST AS P WHERE P.INFLID IN(SELECT INFLID FROM USRFLWINFL WHERE FLWRID = "+userID+") ";
        if (platform != "all")
            dbRequest = dbRequest+"AND platform = '"+platform+"'";

        dbRequest = dbRequest+" ORDER BY POSTED DESC LIMIT "+limit+";";
        client.query(dbRequest, (err, dbResult) => {
            console.log(dbResult); //We get a problem if login is
            var dbResults = dbResult;
            if (dbResults != undefined && dbResults["rowCount"] >= 1) {
                dbResults["retrieveSuccess"] = true;
                callback(dbResults);
            } else {
                dbResults = err;
                callback(false);
                //dbResults["retrieveSuccess"] = false;
            }
            //callback(dbResults);
        });
    },

    insertPost: function(realName, numLikes, platform, userTextContent, datePosted, postID, postUrl, jsonContent, client, callback) {
        splitedDate = datePosted.split(" ");
        var unixtime = new Date(datePosted).getTime();
        var regex = /'/gi;
        userTextContent = userTextContent.replace(regex, "''");
        console.log(typeof(jsonContent));
        jsonContent = jsonContent.replace(regex, "''");
        var dbRequest = "INSERT INTO POST(INFLID, NRLIKES, PLATFORM, USRTXTCONTENT, POSTED, POSTURL, PLATFORMCONTENT) \
            VALUES ((SELECT INFLUENCERID FROM INFLUENCER WHERE REALNAME =\
            '"+realName+"'),\
            "+numLikes+", '"+platform+"',\
            '"+userTextContent+"', to_timestamp("+unixtime+"),\
            '"+postUrl+"', '"+jsonContent+"'::json);";
        console.log(dbRequest);

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
                callback(dbResults);
        });
    },

    unfollowInfluencer: function(userID, influencerID, client, callback) {
        var dbRequest = "DELETE FROM USRFLWINFL WHERE FLWRID = "+userID+" AND INFLID = "+influencerID+";";
        console.log(dbRequest);
        client.query(dbRequest, (err, dbResult) => {
            var dbResults = dbResult;
            if (dbResults != undefined && dbResults["rowCount"] >= 1) {
                dbResults["deleteSuccess"] = true;
            } else {
                dbResults = err;
                dbResults["deleteSuccess"] = false;
            }
            callback(dbResults);
        });
    },

    addFollowInfluencer: function(userID, influencerID, client, callback) {
        var names = ["real_name", "influencer_id"];
        for (i in inputObj) {
            if (names.includes(i)) {
            console.log("Yes!");
            }
        }
        var dbRequest = "INSERT INTO USRFLWINFL (FLWRID, INFLID) VALUES ("+userID+","+influencerID+");";

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
    },

    getPlatformAccountsFromFollowedInfluencers: function(userID, orderBy, client, callback) {
        var dbRequest = "WITH INFLUENCERWITHPLATFORMACCOUNTS AS ( \
            SELECT INFLUENCER.*, PLATFORMACCOUNT.* FROM INFLUENCER \
            INNER JOIN PLATFORMACCOUNT ON \
            INFLUENCER.INFLUENCERID = PLATFORMACCOUNT.INFLID \
            AND INFLUENCER.INFLUENCERID IN(SELECT INFLID FROM USRFLWINFL WHERE FLWRID = "+userID+") \
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
            callback(dbResults);
        });
    },

    getFollowListAccounts: function(userID, client, callback) {
        var dbRequest = "WITH B AS ( \
            SELECT I.INFLUENCERNAME, U.INFLID \
            FROM USRFLWINFL AS U, INFLUENCER AS I \
            WHERE U.FLWRID = "+userID+" AND U.INFLID = I.INFLUENCERID \
          ) \
          SELECT B.INFLUENCERNAME, ARRAY(SELECT INFLID || ' : ' || ACTNAME || ' : ' || PLATFORM \
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
            callback(dbResults);
        });
    },

    addUserVisit: function(userID, influencerID, typeOfVisit, client, callback) {
        var dbRequest = "INSERT INTO USRVISIT(USRID, INFLID, TYPEOFVISIT) VALUES ("+userID+","+influencerID+",'"+typeOfVisit+"');";
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
            callback(dbResults);
        });
    },

    modifyUser: function(hashedPassword, username, age, email, sex, userID, client, callback) {
        console.log(userID);
        var dbRequest = "UPDATE USR SET USRNAME = '"+username+"' HASHEDPWD = '"+hashedPassword+"', age = "+age+", email = '"+email+"', sex = "+sex+" WHERE usrid = "+userID+";"
        client.query(dbRequest, (err, dbResult) => {
            console.log(dbResult); //We get a problem if login is
            var dbResults = dbResult;

            if (dbResults != undefined && dbResults["rowCount"] == 1) {


            dbResults["updateSuccess"] = true;
            } else if (dbResults == undefined) {
            dbResults = {};
            dbResults["updateSuccess"] = false;

            } else if (dbResults["rowCount"] == 2){
            console.log("2 or more updated. GRAVE ERROR in database.");
            } else {
            dbResults = {};
            dbResults["updateSuccess"] = false;
            }

            callback(dbResults);
        });
    },

    insertionToDB: function(client, dbRequest, callback) {
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
    },

    registerUser: function(password, username, age, email, sex, callback) {
        bcrypt.hash(password, saltRounds, function(err, hash) {
            // Store hash in your password DB.
              var dbRequest = "INSERT INTO USR (USRNAME, HASHEDPWD, EMAIL, AGE, SEX) VALUES ('"+username+"', '"+hash+"', '"+email+"', "+age+", "+sex+");"
              self.insertionToDB(client, dbRequest, (response) => {
                callback(response);
              });
        });
    },

    getLatestPosts: function(userID, platform, top, client, callback) {
        var dbRequest = "WITH INFLLIST AS ( \
            SELECT INFLID \
            FROM USRFLWINFL \
            WHERE FLWRID = "+userID+" \
            ), P AS ( \
            SELECT * FROM POST ";
            if (platform != undefined) {
              dbRequest = dbRequest+" WHERE PLATFORM  = '"+platform+"' ";
            }

            dbRequest = dbRequest+"ORDER BY POSTED DESC LIMIT "+top+" \
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
              callback(dbResults);
            });
    },

    getContentFromInfluencer: function(platform, influencerID, top, userID, client, callback) {
        var dbRequest = "WITH P AS ( \
            SELECT * FROM POST \
            WHERE ";
        if(platform != 'all') {
            dbRequest = dbRequest + "PLATFORM = '"+platform+"' AND ";
        }
        dbRequest = dbRequest + "INFLID = "+influencerID+" \
            ORDER BY POSTED DESC \
          "
          if (top != undefined) {
            dbRequest = dbRequest+" LIMIT "+ top;
          }
          dbRequest = dbRequest+"), INFLLIST AS ( \
            SELECT INFLID \
            FROM USRFLWINFL \
            WHERE FLWRID = "+userID+" \
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
            callback(dbResults);
          });
    },

    login: function(password, username, client, callback) {
        var dbRequest = "SELECT * FROM usr WHERE usrname = '"+username+"'"
        //var dbRequest = "SELECT * FROM usr WHERE (usrname = '"+usrname+"' AND HASHEDPWD = '"+hashedPwd+"')"

        client.query(dbRequest, (err, dbResult) => {
            var dbResults = dbResult["rows"][0];
            var hashPassword = dbResult["rows"][0].hashedpwd;

            bcrypt.compare(password, hashPassword, function(err, resultCompare) {
            if (resultCompare == true) {
                dbResults["loginSuccess"] = true;
            } else {
                dbResults = {};
                dbResults["loginSuccess"] = false;
            }

            callback({dbResults});
            });
        });
    },

    getInfluencer: function(client, callback) {
        dbRequest = "SELECT * FROM INFLUENCER";
        client.query(dbRequest, (err, dbResult) => {

            callback(dbResult["rows"]);

        });
    }
}
