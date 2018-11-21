const bcrypt = require('bcrypt');
const saltRounds = 10;
var self = module.exports = {
    //Retrieves all accounts from the database from a specific social media platform.
    getCompletePlatformAccounts: function (platform, databaseClient, callback) {
        var dbRequest = "SELECT * FROM PLATFORMACCOUNT WHERE PLATFORM = '" + platform + "'";
        databaseClient.query(dbRequest, (err, dbResult) => {
            var dbResults = dbResult;

            if (dbResults != undefined && dbResults != null) {
                dbResults["retrieveSuccess"] = true;
            } else {
                dbResults = err;

                dbResults["retrieveSuccess"] = false;
            }
            callback(dbResults);
        });
    },
    getPlatformAccounts: function (platform, databaseClient, callback) {
        var dbRequest = "SELECT INFLID AS INFLUENCERID, ACTNAME AS PLATFORMNAME FROM PLATFORMACCOUNT WHERE PLATFORM = '" + platform + "'";
        databaseClient.query(dbRequest, (err, dbResult) => {
            var dbResults = dbResult;

            if (dbResults != undefined && dbResults != null) {
                dbResults["retrieveSuccess"] = true;
            } else {
                dbResults = err;

                dbResults["retrieveSuccess"] = false;
            }
            callback(dbResults);
        });
    },
    //Retrieves posts from influencers from a specific social media platform that a user follows.
    getFollowedInfluencersPosts: function (userID, limit, platform, databaseClient, callback) {
        var dbRequest = "SELECT * FROM POST AS P WHERE P.INFLID IN(SELECT INFLID FROM USRFLWINFL WHERE FLWRID = " + userID + ") ";
        if (platform != "all")
            dbRequest = dbRequest + "AND platform = '" + platform + "'";

        dbRequest = dbRequest + " ORDER BY POSTED DESC LIMIT " + limit + ";";

        databaseClient.query(dbRequest, (err, dbResult) => {
            //We get a problem if login is
            var dbResults = dbResult;
            if (dbResults != undefined && dbResults != null) {
                dbResults["retrieveSuccess"] = true;
            } else {
                dbResults = err;
                dbResults["retrieveSuccess"] = false;
            }
            callback(dbResults);
        });
    },

    //inserts a post into the database.
    insertPost: function (influencerID, numLikes, platform, userTextContent, unixtime, postID, postUrl, profilePicture, jsonContent, databaseClient, callback) {
        var dbRequest = "INSERT INTO POST(INFLID, NRLIKES, PLATFORM, USRTXTCONTENT, POSTED, POSTURL, PROFILEPIC, PLATFORMCONTENT) \
            VALUES ("+ influencerID + ",\
            "+ numLikes + ", '" + platform + "',\
            '"+ userTextContent + "', to_timestamp(" + unixtime + "),\
            '"+ postUrl + "', '" + profilePicture + "', '" + jsonContent + "'::json);";

        databaseClient.query(dbRequest, (err, dbResult) => {
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

    updatePlatformAccount: function(influencerId, accountName, platform, followersCount, memberSince, actURL, imageURL, isVerified, platformContent, databaseClient, callback) {
        //Put everything into a json object.
        var jsonObject = {
            "ACTNAME": accountName, //check
            "PLATFORM": platform, //not necessary to implement below
            "NRFLWRS": followersCount, //check
            "MEMBERSINCE": memberSince, //MUST BE UNIX TIME FORMAT
            "ACTURL": actURL, //check
            "IMGURL": imageURL, //check
            "VERIFIED": isVerified, //check
            "PLATFORMCONTENT": platformContent
        }
        console.log(jsonObject);
        // We loop through the json object. If something is not defined,
        // then we simply do not add this to the request.
        var dbRequest = "UPDATE PLATFORMACCOUNT SET ";
        for (key in jsonObject) {
            if (jsonObject[key] != undefined) {
                switch (key) {
                    case "ACTNAME":
                    case "ACTURL":
                    case "IMGURL":
                    dbRequest = dbRequest + key + " = '" + jsonObject[key] + "', ";
                    break;
                    case "NRFLWRS":
                    case "VERIFIED":
                    dbRequest = dbRequest + key + " = " + jsonObject[key] + ", ";
                    break;
                    case "MEMBERSINCE":
                    dbRequest = dbRequest + key + " = to_timestamp(" + jsonObject[key] + "), ";
                    break;
                    case "PLATFORMCONTENT":
                    // Do note that we might have to do regex if we send in json objects here, and replace ' with '' to escape.
                    // in that case, do regex on jsonObj[key]
                    dbRequest = dbRequest + key + " = '" + jsonObject[key] + "'::json, ";
                    break;
                }
            }
        }
        // Remove the last , and space, and add the last bit of the request to finish it
        dbRequest = dbRequest.substr(0, dbRequest.length - 2);
        dbRequest = dbRequest + " WHERE INFLID = " + influencerId + " AND PLATFORM = '" + platform + "';";

        // Here, I just send back the actual db request. Should be different when actually implementing it for real.
        databaseClient.query(dbRequest, (err, dbResult) => {
            //console.log(dbResult);
            var dbResults = dbResult;
            if (dbResults != undefined && dbResults["rowCount"] == 1) {
                dbResults["updateSuccess"] = true;
            } else {
                console.log("Failed: ");
                console.log(dbResult);
                dbResults = {};
                dbResults["updateSuccess"] = false;
            }
            callback(dbResults);
        });
    },
    //makes a user unfollows an influencer
    unfollowInfluencer: function (userID, influencerID, databaseClient, callback) {
        var dbRequest = "DELETE FROM USRFLWINFL WHERE FLWRID = " + userID + " AND INFLID = " + influencerID + ";";
        console.log(dbRequest);
        databaseClient.query(dbRequest, (err, dbResult) => {
            var dbResults = dbResult;
            if (dbResults != undefined) {
                dbResults["deleteSuccess"] = true;
            } else {
                dbResults = err;
                dbResults["deleteSuccess"] = false;
            }
            callback(dbResults);
        });
    },
    //makes a user follow an influencer
    addFollowInfluencer: function (userID, influencerID, databaseClient, callback) {
        var dbRequest = "INSERT INTO USRFLWINFL (FLWRID, INFLID) VALUES (" + userID + "," + influencerID + ");";


        databaseClient.query(dbRequest, (err, dbResult) => {
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

    //Retrieves the platforms accounts of a users followed influencers.
    getPlatformAccountsFromFollowedInfluencers: function (userID, orderBy, databaseClient, callback) {

        var dbRequest = "WITH INFLUENCERWITHPLATFORMACCOUNTS AS ( \
            SELECT INFLUENCER.*, PLATFORMACCOUNT.* FROM INFLUENCER \
            INNER JOIN PLATFORMACCOUNT ON \
            INFLUENCER.INFLUENCERID = PLATFORMACCOUNT.INFLID \
            AND INFLUENCER.INFLUENCERID IN(SELECT INFLID FROM USRFLWINFL";
        if (userID != undefined) {
            dbRequest = dbRequest + " WHERE FLWRID = " + userID;
        }
        dbRequest = dbRequest + ") \
        ) \
          SELECT * FROM INFLUENCERWITHPLATFORMACCOUNTS AS I ";
        if (orderBy != undefined) {
            dbRequest = dbRequest + "ORDER BY " + orderBy;
        }
        dbRequest = dbRequest + ";";
        databaseClient.query(dbRequest, (err, dbResult) => {
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

    //Retrieves the influencer accounts which a user follows
    getFollowListAccounts: function (userID, databaseClient, callback) {
        var dbRequest = "WITH B AS ( \
            SELECT I.INFLUENCERNAME, U.INFLID \
            FROM USRFLWINFL AS U, INFLUENCER AS I \
            WHERE U.FLWRID = "+ userID + " AND U.INFLID = I.INFLUENCERID \
          ) \
          SELECT B.INFLUENCERNAME, ARRAY(SELECT INFLID || ' : ' || ACTNAME || ' : ' || PLATFORM \
            FROM PLATFORMACCOUNT \
            WHERE INFLID = B.INFLID) FROM B;";
        databaseClient.query(dbRequest, (err, dbResult) => {
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

    //Adds into the database that a user visited an influencer
    addUserVisit: function (userID, influencerID, typeOfVisit, databaseClient, callback) {
        var dbRequest = "INSERT INTO USRVISIT(USRID, INFLID, TYPEOFVISIT) VALUES (" + userID + "," + influencerID + ",'" + typeOfVisit + "');";
        databaseClient.query(dbRequest, (err, dbResult) => {
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

    //Modifies a users account information
    modifyUser: function (password, username, age, email, sex, userID, databaseClient, callback) {
        bcrypt.hash(password, saltRounds, function (err, hash) {
            var dbRequest = "UPDATE USR SET USRNAME = '" + username + "', HASHEDPWD = '" + hash + "', age = " + age + ", email = '" + email + "', sex = '" + sex + "' WHERE usrid = " + userID + ";";
            databaseClient.query(dbRequest, (err, dbResult) => {
                console.log(dbResult); //We get a problem if login is
                var dbResults = dbResult;
                if (dbResults != undefined) {


                    dbResults["updateSuccess"] = true;
                } else if (dbResults == undefined) {
                    dbResults = err;
                    dbResults["updateSuccess"] = false;

                } else if (dbResults["rowCount"] == 2) {
                    console.log("2 or more updated. GRAVE ERROR in database.");
                } else {
                    dbResults = err;
                    dbResults["updateSuccess"] = false;
                }
                callback(dbResults);
            });
        });
    },
    //Makes an insertion to the database, sends in the request.
    insertionToDB: function (databaseClient, dbRequest, callback) {
        databaseClient.query(dbRequest, (err, dbResult) => {


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
    //Registers a user into the database
    registerUser: function (password, username, age, email, sex, databaseClient, callback) {
        var saltRounds = 10;
        bcrypt.hash(password, saltRounds, function (err, hash) {
            // Store hash in your password DB.
            var dbRequest = "INSERT INTO USR (USRNAME, HASHEDPWD, EMAIL, AGE, SEX) VALUES ('" + username + "', '" + hash + "', '" + email + "', " + age + ", '" + sex + "');"
            self.insertionToDB(databaseClient, dbRequest, (response) => {
                callback(response);
            });
        });
    },
    //Gets the latest posts from a specific social media platform(if specified, otherwise from all platforms)
    getLatestPosts: function (userID, platform, limit, databaseClient, callback) {
        var dbRequest = "WITH INFLLIST AS ( \
            SELECT INFLID \
            FROM USRFLWINFL \
            WHERE FLWRID = "+ userID + " \
            ), P AS ( \
            SELECT * FROM POST ";
        if (platform != 'all') {
            dbRequest = dbRequest + " WHERE PLATFORM  = '" + platform + "' ";
        }

        dbRequest = dbRequest + "ORDER BY POSTED DESC LIMIT " + limit + " \
          ) \
          SELECT *, (SELECT (COUNT(*) >= 1) FROM INFLLIST WHERE INFLID IN(P.INFLID)) AS USRFOLLOWINGINFLUENCER \
            FROM P ORDER BY POSTED DESC";
        databaseClient.query(dbRequest, (err, dbResult) => {
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
    //Retrives posts/content from a specific influencer from a specific platform if provided
    getContentFromInfluencer: function (platform, influencerID, limit, userID, databaseClient, callback) {
        var dbRequest = "WITH P AS ( \
            SELECT * FROM POST \
            WHERE ";
        if (platform != 'all') {
            dbRequest = dbRequest + "PLATFORM = '" + platform + "' AND ";
        }
        dbRequest = dbRequest + "INFLID = " + influencerID + " \
            ORDER BY POSTED DESC \
          "
        if (limit != undefined) {
            dbRequest = dbRequest + " LIMIT " + limit;
        }
        dbRequest = dbRequest + "), INFLLIST AS ( \
            SELECT INFLID \
            FROM USRFLWINFL \
            WHERE FLWRID = "+ userID + " \
          )\
           SELECT *, (SELECT (COUNT(*) >= 1) FROM INFLLIST WHERE INFLID IN(P.INFLID)) AS USRFOLLOWINGINFLUENCER \
            FROM P ORDER BY POSTED DESC";
        dbRequest = dbRequest + ";";
        databaseClient.query(dbRequest, (err, dbResult) => {

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
    //Logins a user by doing a check in the database if login credentials are correct.
    login: function (password, username, databaseClient, callback) {
        var dbRequest = "SELECT * FROM usr WHERE usrname = '" + username + "'";
        databaseClient.query(dbRequest, (err, dbResult) => {
            if (dbResult["rows"][0] == undefined) {
                callback({ loginSuccess: false });
            }
            else {
                var dbResults = dbResult["rows"][0];
                var hashPassword = dbResult["rows"][0].hashedpwd;

                bcrypt.compare(password, hashPassword, function (err, resultCompare) {
                    if (resultCompare == true) {
                        dbResults["loginSuccess"] = true;
                    } else {
                        dbResults = err;
                        dbResults["loginSuccess"] = false;
                    }
                    callback({ dbResults });
                });
            }
        });
    },
    //Retrieves all influencers stored in database.
    getInfluencer: function (databaseClient, callback) {
        dbRequest = "SELECT * FROM INFLUENCER";
        databaseClient.query(dbRequest, (err, dbResult) => {

            callback(dbResult["rows"]);

        });
    }
}
