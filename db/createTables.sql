-- This document is made to structure and fill up the database with content.
-- Have hashed passwords with a salt.
-- https://stackoverflow.com/questions/2647158/how-can-i-hash-passwords-in-postgresql
CREATE TYPE PF AS ENUM ('instagram', 'twitter', 'youtube');
CREATE TYPE PROMOTIONDEMOTION AS ENUM ('promotion', 'demotion');
CREATE TYPE SEXX AS ENUM ('Male','Female');

--- User table. Containing info about user
-- TODO: Just a detail, but should all username just be lowercase?
CREATE TABLE USR (
  USRID SERIAL PRIMARY KEY,
  USRNAME VARCHAR(20) NOT NULL UNIQUE, -- Max 20 chars for a username.
  HASHEDPWD VARCHAR NOT NULL,
  EMAIL VARCHAR UNIQUE,
  AGE INT,
  SEX SEXX -- Can be "Male" or "Female"
);

-- Specifies Location table, used to
CREATE TABLE LOCATION (
  LOCATIONID SERIAL PRIMARY KEY,
  LOCATIONNAME VARCHAR NOT NULL,
  LOCATIONTYPE VARCHAR NOT NULL,
  REGIONID INTEGER REFERENCES LOCATION(LOCATIONID) DEFAULT NULL,
  COUNTRYID INTEGER REFERENCES LOCATION(LOCATIONID) DEFAULT NULL
);

--
CREATE TABLE INFLUENCER (
  INFLUENCERID SERIAL PRIMARY KEY, -- ID for the influencer in OUR database
  INFLUENCERNAME VARCHAR NOT NULL UNIQUE, -- The name of the influencer, e.g., Pewdiepie
  REALNAME VARCHAR, -- The real name, for example pewdiepie = Felix Kjellberg. For a lot of influencers, this is the same for all.
  AGE INT, -- How old the influencer is
  SEX SEXX, -- Enum type. Can be 'Male' or 'Female' (case-sensitive)
  PICLINK TEXT,
  COUNTRYID INTEGER REFERENCES LOCATION(LOCATIONID) DEFAULT NULL, -- Which country the influencer lives in
  CITYID INTEGER REFERENCES LOCATION(LOCATIONID) DEFAULT NULL -- Which city the influencer lives in
);

CREATE TABLE USRFLWINFL (
  RELATIONID SERIAL PRIMARY KEY, -- Just an id. Not really useful or important atm.
  FLWRID INTEGER REFERENCES USR (USRID) NOT NULL, -- The id of the user following an influencer
  INFLID INTEGER REFERENCES INFLUENCER(INFLUENCERID) NOT NULL -- The id of the influencer a user follows.
);
ALTER TABLE USRFLWINFL -- constraint added to make sure that only one follow exists.
ADD CONSTRAINT UNIQUEFLWRELATION
UNIQUE (FLWRID,INFLID);

CREATE TYPE VISITTYPE AS ENUM ('profilevisit', 'instagrampost', 'twitterpost', 'youtubevideo');

-- Have this table to track the number of visits?
CREATE TABLE USRVISIT ( -- Table that describes a visit to a profile
  RELATIONID SERIAL PRIMARY KEY, -- ID for the usrvisit. Not really useful
  USRID INTEGER REFERENCES USR (USRID) NOT NULL, -- the id of the user that visited the influencer
  INFLID INTEGER REFERENCES INFLUENCER(INFLUENCERID) NOT NULL, -- id of the influencer that was visited
  VISITTIME TIMESTAMPTZ NOT NULL DEFAULT NOW(), --When the visit took place.
  TYPEOFVISIT VISITTYPE NOT NULL -- Type of visit. Did they see a post from a platform, or visit the user's profile?
);

--Table containing the posts from the different platforms. Can contain posts from instagram, youtube or twitter.
CREATE TABLE POST (
  POSTID SERIAL PRIMARY KEY, -- Id of the
  INFLID INTEGER REFERENCES INFLUENCER(INFLUENCERID) NOT NULL, -- ID of the influencer who posted the post, the ID in OUR database.
  NRLIKES INT NOT NULL, -- Number of likes on the platform.
  PLATFORM PF NOT NULL, -- Defining which platform the post comes from
  USRTXTCONTENT TEXT, -- Can be the post description, e.g., the text below an image on instagram etc.
  POSTED TIMESTAMPTZ, -- When the post was posted. Fetchable from platform.
  POSTPLATFORMID VARCHAR, -- The specific id on the platform for the post.
  POSTURL VARCHAR UNIQUE, -- The url for the post
  PLATFORMCONTENT JSON --TODO: decide whether JSONB or JSON is best. JSONB supports indexing, is faster to process but slower to insert.
);

ALTER TABLE POST -- constraint forcing us to store only one of each post. Uses the platform and the id on that platform to make it unique
ADD CONSTRAINT UNIQUEPLATFORMPOSTID
UNIQUE (POSTPLATFORMID,PLATFORM);

-- Table enabling the user to like a specific post from an influencer.
CREATE TABLE USRLIKEPOST (
  USRLIKE SERIAL PRIMARY KEY,
  POSTID INTEGER REFERENCES POST(POSTID),
  USRID INTEGER REFERENCES USR(USRID)
);
ALTER TABLE USRLIKEPOST -- Constraint that only allows one like per post per user.
ADD CONSTRAINT UNIQUELIKE
UNIQUE (POSTID,USRID);

-- Tags that can be related to both a user and
CREATE TABLE TAG (
  TAGID SERIAL PRIMARY KEY,
  TAGNAME VARCHAR UNIQUE
);

-- Stores the information of an account of an influencer on a specific platform.
CREATE TABLE PLATFORMACCOUNT (
  INFLID INTEGER REFERENCES INFLUENCER (INFLUENCERID) NOT NULL,
  -- TODO: WHAT IS THE MAX AMT OF CHARS IN THE NAME
  ACTNAME VARCHAR NOT NULL,
  -- MIGHT HAVE TO BE MODIFIED IF WE INTRODUCE MORE PLATFORMS
  PLATFORM PF NOT NULL,
  NRFLWRS INT, -- IS SUBSCRIBERS FOR YOUTUBE
  MEMBERSINCE DATE,
  ACTURL TEXT,
  IMGURL TEXT,
  VERIFIED BOOLEAN,
  USRDESC TEXT,
  PLATFORMCONTENT JSON
);

ALTER TABLE PLATFORMACCOUNT
ADD CONSTRAINT UNIQUEPLATFORMACT
UNIQUE (ACTNAME,PLATFORM);

-- A tv operator.
CREATE TABLE TVOPERATOR (
  TVOPERATORID SERIAL PRIMARY KEY,
  TVOPERATORNAME VARCHAR UNIQUE NOT NULL, -- Changed to unique.
  HASHEDPWD VARCHAR NOT NULL
);

-- TODO: DECIDE WHETHER TO USE THIS ONE OR NOT.
CREATE TABLE TVOPERATORCONTENT (
  ADID SERIAL PRIMARY KEY,
  TITLE VARCHAR NOT NULL,
  TVOPERATORID INTEGER REFERENCES TVOPERATOR(TVOPERATORID) NOT NULL,
  IMGURL VARCHAR,
  TEXTDESCRIPTION VARCHAR
);

-- A promotion that can be created by a tv operator.
CREATE TABLE PROMOTION (
  PROMOTIONID SERIAL PRIMARY KEY,
  PROMOTIONNAME VARCHAR NOT NULL,
  TVOPERATORID INTEGER REFERENCES TVOPERATOR(TVOPERATORID) NOT NULL,
  STARTDATE TIMESTAMPTZ,
  ENDDATE TIMESTAMPTZ
);

-- Relation between tag and influencer. Enables that a tag can be related to multiple influencer and vice versa.
CREATE TABLE TAGFORINFLUENCER (
  TAGID INTEGER REFERENCES TAG(TAGID),
  INFLID INTEGER REFERENCES INFLUENCER(INFLUENCERID)
);

-- Relation between tag and post. Enables that a tag can be related to multiple posts and vice versa.
CREATE TABLE TAGFORPOST (
  TAGID INTEGER REFERENCES TAG(TAGID) NOT NULL,
  POSTID INTEGER REFERENCES POST(POSTID)
);

-- Table to make it possible to promote content with specific tags.
CREATE TABLE TAGPROMOTED (
  TAGID INTEGER REFERENCES TAG(TAGID) NOT NULL,
  PROMOTIONID INTEGER REFERENCES PROMOTION(PROMOTIONID) NOT NULL,
  PROMOTIONTYPE PROMOTIONDEMOTION NOT NULL DEFAULT 'promotion'
);

ALTER TABLE TAGPROMOTED -- constraint forcing us to store only one promotion/demotion for a tag for each promotion
ADD CONSTRAINT UNIQUETAGPROMOTIONPERPROMOTION
UNIQUE (TAGID,PROMOTIONID);

-- If a promotion promotes or demotes an influencer, this should be used.
CREATE TABLE INFLUENCERPROMOTED (
  INFLUENCERID INTEGER REFERENCES INFLUENCER(INFLUENCERID) NOT NULL,
  PROMOTIONID INTEGER REFERENCES PROMOTION(PROMOTIONID) NOT NULL,
  PROMOTIONTYPE PROMOTIONDEMOTION NOT NULL DEFAULT 'promotion'
);

ALTER TABLE INFLUENCERPROMOTED -- constraint forcing us to store only one promotion/demotion for a tag for each promotion
ADD CONSTRAINT UNIQUEINFLUENCERPROMOTIONPERPROMOTION
UNIQUE (INFLUENCERID,PROMOTIONID);

-- If a specific location is promoted by a promotion, this table will be used.
CREATE TABLE LOCATIONPROMOTED (
  LOCATIONID INTEGER REFERENCES LOCATION(LOCATIONID) NOT NULL,
  PROMOTIONID INTEGER REFERENCES PROMOTION(PROMOTIONID) NOT NULL
);
