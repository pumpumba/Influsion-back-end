-- This document is made to structure and fill up the database with content.
-- Have hashed passwords with a salt.
-- https://stackoverflow.com/questions/2647158/how-can-i-hash-passwords-in-postgresql
CREATE TYPE PF AS ENUM ('instagram', 'twitter', 'youtube');

--- User table. Containing info about user
CREATE TABLE USR (
  USRID SERIAL PRIMARY KEY,
  USRNAME VARCHAR(20) NOT NULL UNIQUE,
  HASHEDPWD VARCHAR NOT NULL,
  EMAIL VARCHAR UNIQUE,
  AGE INT,
  SEX BOOLEAN -- 1 for male, 0 for female
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
  INFLUENCERID SERIAL PRIMARY KEY,
  INFLUENCERNAME VARCHAR(30) NOT NULL,
  REALNAME VARCHAR(30),
  AGE INT,
  PICTURELINK TEXT,
  COUNTRYID INTEGER REFERENCES LOCATION(LOCATIONID) DEFAULT NULL,
  CITYID INTEGER REFERENCES LOCATION(LOCATIONID) DEFAULT NULL
);

CREATE TABLE USRFLWINFL (
  RELATIONID SERIAL PRIMARY KEY,
  FLWRID INTEGER REFERENCES USR (USRID) NOT NULL,
  INFLID INTEGER REFERENCES INFLUENCER(INFLUENCERID) NOT NULL
);
ALTER TABLE USRFLWINFL
ADD CONSTRAINT UNIQUEFLWRELATION
UNIQUE (FLWRID,INFLID);

CREATE TYPE VISITTYPE AS ENUM ('profilevisit', 'instagrampost', 'twitterpost', 'youtubevideo');

-- Have this table to track the number of visits?
CREATE TABLE USRVISIT (
  RELATIONID SERIAL PRIMARY KEY,
  USRID INTEGER REFERENCES USR (USRID) NOT NULL,
  INFLID INTEGER REFERENCES INFLUENCER(INFLUENCERID) NOT NULL,
  VISITTIME TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  TYPEOFVISIT VISITTYPE NOT NULL
);

CREATE TABLE POST (
  POSTID SERIAL PRIMARY KEY,
  INFLID INTEGER REFERENCES INFLUENCER(INFLUENCERID) NOT NULL,
  NRLIKES INT NOT NULL,
  PLATFORM PF NOT NULL,
  USRTXTCONTENT TEXT,
  POSTED TIMESTAMPTZ,
  POSTURL VARCHAR, --EXACTLY THE SAME AS
  PLATFORMCONTENT JSON --TODO: decide whether JSONB or JSON is best. JSONB supports indexing, is faster to process but slower to insert.
);

CREATE TABLE USRLIKEPOST (
  USRLIKE SERIAL PRIMARY KEY,
  POSTID INTEGER REFERENCES POST(POSTID),
  USRID INTEGER REFERENCES USR(USRID)
);
ALTER TABLE USRLIKEPOST
ADD CONSTRAINT UNIQUELIKE
UNIQUE (POSTID,USRID);

CREATE TABLE TAG (
  TAGID SERIAL PRIMARY KEY,
  TAGNAME VARCHAR,
  POSTID INTEGER REFERENCES POST (POSTID) DEFAULT NULL,
  INFLID INTEGER REFERENCES INFLUENCER (INFLUENCERID) DEFAULT NULL
);


CREATE TABLE PLATFORMACCOUNT (
  INFLID INTEGER REFERENCES INFLUENCER (INFLUENCERID) NOT NULL,
  -- TODO: WHAT IS THE MAX AMT OF CHARS IN THE NAME
  ACTNAME VARCHAR(30) NOT NULL,
  -- MIGHT HAVE TO BE MODIFIED IF WE INTRODUCE MORE PLATFORMS
  PLATFORM PF NOT NULL,
  NRFLWRS INT NOT NULL, -- IS SUBSCRIBERS FOR YOUTUBE
  MEMBERSINCE DATE,
  ACTURL TEXT NOT NULL,
  VERIFIED BOOLEAN,
  USRDESC TEXT,
  PLATFORMCONTENT JSON
);

CREATE TABLE TVOPERATOR (
  TVOPERATORID SERIAL PRIMARY KEY,
  TVOPERATORNAME VARCHAR NOT NULL,
  HASHEDPWD VARCHAR NOT NULL
);

CREATE TABLE PROMOTION (
  PROMOTIONID SERIAL PRIMARY KEY,
  TVOPERATORID INTEGER REFERENCES TVOPERATOR(TVOPERATORID) NOT NULL,
  STARTDATE TIMESTAMPTZ,
  ENDDATE TIMESTAMPTZ
);

CREATE TABLE TAGFORINFLUENCER (
  TAGID INTEGER REFERENCES TAG(TAGID),
  INFLID INTEGER REFERENCES INFLUENCER(INFLUENCERID)
);

CREATE TABLE TAGFORPOST (
  TAGID INTEGER REFERENCES TAG(TAGID) NOT NULL,
  POSTID INTEGER REFERENCES POST(POSTID)
);

CREATE TABLE TAGPROMOTED (
  TAGID INTEGER REFERENCES TAG(TAGID) NOT NULL,
  PROMOTIONID INTEGER REFERENCES PROMOTION(PROMOTIONID) NOT NULL,
  ISPROMOTION BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE INFLUENCERPROMOTED (
  INFLUENCERID INTEGER REFERENCES INFLUENCER(INFLUENCERID) NOT NULL,
  PROMOTIONID INTEGER REFERENCES PROMOTION(PROMOTIONID) NOT NULL,
  ISPROMOTION BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE LOCATIONPROMOTED (
  LOCATIONID INTEGER REFERENCES LOCATION(LOCATIONID) NOT NULL,
  PROMOTIONID INTEGER REFERENCES PROMOTION(PROMOTIONID) NOT NULL
);
