--CREATE TABLE INFLUENCER (
--  INFLUENCERID INT PRIMARY KEY NOT NULL,
--  INFLUENCERNAME VARCHAR(30) NOT NULL,
--  REALNAME VARCHAR(30),
--  AGE INT,
--  COUNTRYID INT REFERENCES LOCATION(LOCATIONID),
--  CITYID INT REFERENCES LOCATION(LOCATIONID)
--);


INSERT INTO LOCATION (LOCATIONNAME, LOCATIONTYPE) VALUES ('Sweden', 'COUNTRY');
INSERT INTO LOCATION (LOCATIONNAME, LOCATIONTYPE) VALUES ('United States', 'COUNTRY');
-- locationtype has to be inserted with caps!
INSERT INTO LOCATION (LOCATIONNAME, LOCATIONTYPE, COUNTRYID) VALUES ('New York', 'CITY', (select locationid from location where location.locationname = 'United States'));
INSERT INTO LOCATION (LOCATIONNAME, LOCATIONTYPE, COUNTRYID) VALUES ('Stockholm', 'CITY', (select locationid from location where location.locationname = 'Sweden'));
INSERT INTO INFLUENCER (INFLUENCERNAME, REALNAME, AGE) VALUES ('Bill Gates', 'Bill Gates', 62);
INSERT INTO INFLUENCER (INFLUENCERNAME, REALNAME, AGE, CITYID, COUNTRYID) VALUES ('Jockiboi', 'Joakim Lundell', 33, (select locationid from location where location.locationname = 'Stockholm'),(select locationid from location where location.locationname = 'Sweden'));

-- Update country of a specific influencer
UPDATE INFLUENCER SET COUNTRYID = (select locationid from location where location.locationname = 'United States') WHERE INFLUENCERNAME = 'Bill Gates';

-- Create a user
INSERT INTO USR (USRNAME, HASHEDPWD, EMAIL, AGE, SEX)
  VALUES ('Filleboy', 'BAJSBAJS', 'c.filip.cornell@gmail.com', 24, TRUE);

-- INSERT a visit to a specific influencer
INSERT INTO USRVISIT (USRID, INFLID, TYPEOFVISIT)
    VALUES ((SELECT USRID FROM USR WHERE USRNAME = 'Filleboy'), (SELECT INFLUENCERID FROM INFLUENCER WHERE INFLUENCERNAME = 'Bill Gates'), 'instagrampost');

--Insert that a user wants to follow a specific influencer
INSERT INTO USRFLWINFL (FLWRID, INFLID)
    VALUES (
      (SELECT USRID
        FROM USR
        WHERE USRNAME = 'Filleboy'),
      (SELECT INFLUENCERID
        FROM INFLUENCER
        WHERE INFLUENCERNAME = 'Bill Gates'));

-- Get all posts from a specific platform
SELECT * FROM POST
  WHERE PLATFORM = 'instagram';

-- Get all posts from an influencer
SELECT * FROM POST
  WHERE INFLID = 1;

-- Get all posts from a specific platform and influencer
SELECT * FROM POST
  WHERE PLATFORM = 'instagram' AND INFLID = 1;



-- Get all posts from a user's favorite influencers
SELECT * FROM POST AS P
  WHERE P.INFLID = (SELECT INFLID FROM USRFLWINFL WHERE FLWRID = 1);

-- Get complete list of influencers followed by a user (without platform info)
SELECT * FROM INFLUENCER AS I
  WHERE I.INFLUENCERID = (SELECT INFLID FROM USRFLWINFL WHERE FLWRID = 1);

-- Get complete list of influencers followed by a user with their platformaccountinfo
WITH INFLUENCERWITHPLATFORMACCOUNTS AS (
  SELECT INFLUENCER.*, PLATFORMACCOUNT.* FROM INFLUENCER
  INNER JOIN PLATFORMACCOUNT ON
  INFLUENCER.INFLUENCERID = PLATFORMACCOUNT.INFLID
  )
SELECT * FROM INFLUENCERWITHPLATFORMACCOUNTS AS I
  WHERE I.INFLUENCERID = (SELECT INFLID FROM USRFLWINFL WHERE FLWRID = 1);

  -- Select all influencers with their countries and include null values
  SELECT * FROM (
    SELECT influencer.*, location.locationname AS Country FROM influencer
    LEFT join location on
    influencer.countryid = location.locationid
    AND LOCATIONTYPE = 'COUNTRY' -- UNNECESSARY
    and influencer.influencername = 'Bill Gates')
    AS influencerWLocation;

-- Select all influencers having countries and include countries
SELECT * FROM (
  SELECT influencer.*, location.locationname AS Country FROM influencer
  inner join location on
  influencer.countryid = location.locationid
  AND LOCATIONTYPE = 'COUNTRY' -- UNNECESSARY
  and influencer.influencername = 'Bill Gates')
  AS influencerWLocation;

-- Select all users from a specific country
SELECT * FROM (
  SELECT influencer.*, location.locationname AS Country FROM influencer
  inner join location on
  influencer.cityid = location.locationid
  AND LOCATIONTYPE = 'CITY' -- UNNECESSARY
  and influencer.influencername = 'Bill Gates')
  AS influencerWLocation;


-- Get latest visits by which users to which influencers
WITH LATESTVISITS AS (
  SELECT * FROM usrvisit
  ORDER BY VISITTIME DESC
  LIMIT 100 --This is how many
)
SELECT u.usrname, i.INFLUENCERNAME, LATESTVISITS.visittime as lastVisited from usr as u
  INNER join LATESTVISITS on u.usrid = LATESTVISITS.usrid
  inner join influencer as i on LATESTVISITS.inflid = i.influencerID
  ORDER BY VISITTIME DESC;

-- List all users by number of visits
SELECT COUNT(*) AS NRVISITORS FROM USRVISIT;

--- Count how many visits has been to a user
SELECT COUNT(*) FROM USRVISIT WHERE USRVISIT.INFLID = (SELECT influencerID FROM Influencer where Influencer.REALNAME = 'Bill Gates');

-- Count number of users following a specific
SELECT COUNT(*) FROM USRVISIT WHERE USRVISIT.INFLID = (SELECT influencerID FROM Influencer where Influencer.REALNAME = 'Bill Gates');

-- Retrieve all influencers and all their platform accounts based on id or name

SELECT * FROM (
  SELECT INFLUENCER.*, PLATFORMACCOUNT.* FROM INFLUENCER
  INNER JOIN PLATFORMACCOUNT ON
  INFLUENCER.INFLUENCERID = PLATFORMACCOUNT.INFLID
) AS INFLUENCERWITHPLATFORMACCOUNTS;

-- Perform a search for influencers based on keywords

-- Select all promoted influencers and all their platformaccounts based on

-- Count number of visits on a profile based on

SELECT COUNT(*) FROM USRVISIT WHERE INFLID = (SELECT influencerID FROM INFLUENCER where REALNAME = 'Jockiboi');


-- Get all posts related to a tag

SELECT * FROM POST WHERE POST.POSTID = ANY(
  SELECT POSTID FROM TAGFORPOST WHERE TAGFORPOST.TAGID = ANY(SELECT TAGID FROM TAG WHERE TAGNAME = 'metoo')
);
