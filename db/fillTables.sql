-- This file is partially intended to fill DB with some sample content, but also develop queries
--

INSERT INTO USR (USRNAME, HASHEDPWD, EMAIL, AGE, SEX)
  VALUES ('Filleboy', 'BAJSBAJS', 'c.filip.cornell@gmail.com', 24, 'Male');

INSERT INTO LOCATION (LOCATIONNAME, LOCATIONTYPE) VALUES ('Sweden', 'COUNTRY');
INSERT INTO LOCATION (LOCATIONNAME, LOCATIONTYPE) VALUES ('United States', 'COUNTRY');

-- locationtype has to be inserted with caps!
INSERT INTO LOCATION (LOCATIONNAME, LOCATIONTYPE, COUNTRYID) VALUES ('New York', 'CITY', (select locationid from location where location.locationname = 'United States'));
INSERT INTO LOCATION (LOCATIONNAME, LOCATIONTYPE, COUNTRYID) VALUES ('Stockholm', 'CITY', (select locationid from location where location.locationname = 'Sweden'));
INSERT INTO INFLUENCER (INFLUENCERNAME, REALNAME, AGE, PICLINK, SEX) VALUES ('Bill Gates', 'Bill Gates', 62, 'https://pbs.twimg.com/profile_images/988775660163252226/XpgonN0X_400x400.jpg', 'Male');
INSERT INTO INFLUENCER (INFLUENCERNAME, REALNAME, AGE, CITYID, COUNTRYID, SEX) VALUES ('Jockiboi', 'Joakim Lundell', 33, (select locationid from location where location.locationname = 'Stockholm'),(select locationid from location where location.locationname = 'Sweden'), 'Male');

-- Add a platform account
INSERT INTO PLATFORMACCOUNT(INFLID, ACTNAME, PLATFORM, NRFLWRS, MEMBERSINCE, ACTURL) VALUES ((SELECT INFLUENCERID FROM INFLUENCER WHERE INFLUENCERNAME = 'Bill Gates'), 'BillG', 'instagram', 23121, (SELECT NOW()::date), 'instagram.com/BillG');
INSERT INTO PLATFORMACCOUNT(INFLID, ACTNAME, PLATFORM, NRFLWRS, MEMBERSINCE, ACTURL) VALUES ((SELECT INFLUENCERID FROM INFLUENCER WHERE INFLUENCERNAME = 'Bill Gates'), 'BillGates', 'twitter', 211121, (SELECT NOW()::date), 'twitter.com/BillG');
INSERT INTO PLATFORMACCOUNT(INFLID, ACTNAME, PLATFORM, NRFLWRS, MEMBERSINCE, ACTURL) VALUES ((SELECT INFLUENCERID FROM INFLUENCER WHERE INFLUENCERNAME = 'Jockiboi'), 'Jockiboi', 'instagram', 23121, (SELECT NOW()::date), 'instagram.com/Jockiboi');
-- added this to be able to add sample influencer promotion information.
SELECT * FROM INFLUENCER;
INSERT INTO TVOPERATOR(TVOPERATORNAME, HASHEDPWD) VALUES ('Zenterio1', 'Zenterio');
INSERT INTO TVOPERATOR(TVOPERATORNAME, HASHEDPWD) VALUES ('Another TV Operator', 'Zenterio');
--INSERT INTO TVOPERATORCONTENT(TVOPERATORID, TITLE, IMGURL, SHOWINPOPULARFEED) VALUES (1, 'Zenterio standard promotion', 'picture1.jpg', TRUE);
--INSERT INTO TVOPERATORCONTENT(TVOPERATORID, TITLE, IMGURL, SHOWINPOPULARFEED) VALUES (1, 'Zenterio standard promotion', 'picture2.jpg', TRUE);
--INSERT INTO TVOPERATORCONTENT(TVOPERATORID, TITLE, IMGURL, SHOWINFOLLOWINGFEED) VALUES (1, 'Zenterio standard promotion', 'picture3.jpg', TRUE);
INSERT INTO PROMOTION(TVOPERATORID, PROMOTIONNAME, PICTURE, POPULARFEED) VALUES (1, 'Zenterio standard promotion', 'picture1.jpg', TRUE);
INSERT INTO PROMOTION(TVOPERATORID, PROMOTIONNAME, PICTURE, POPULARFEED) VALUES (1, 'Zenterio selected promotion', 'picture2.jpg', TRUE);
INSERT INTO PROMOTION(TVOPERATORID, PROMOTIONNAME, PICTURE, FOLLOWINGFEED) VALUES (2, 'TV operator''s promotion', 'picture3.jpg', TRUE);
--INSERT INTO INFLUENCERPROMOTED(INFLUENCERID, PROMOTIONID) VALUES (1,1);
INSERT INTO INFLUENCERPROMOTED(INFLUENCERID, PROMOTIONID, PROMOTIONTYPE) VALUES (2,1, 'demotion');
--INSERT INTO INFLUENCERPROMOTED(INFLUENCERID, PROMOTIONID, PROMOTIONTYPE) VALUES (2,1, 'demotion');
INSERT INTO INFLUENCERPROMOTED(INFLUENCERID, PROMOTIONID, PROMOTIONTYPE) VALUES (1,1, 'demotion');
--INSERT INTO INFLUENCERPROMOTED(INFLUENCERID, PROMOTIONID, PROMOTIONTYPE) VALUES (1,1, 'promotion');
INSERT INTO TAG (TAGNAME) VALUES ('metoo');
INSERT INTO TAGPROMOTED(TAGID, PROMOTIONID, PROMOTIONTYPE) VALUES ((SELECT TAGID FROM TAG WHERE TAGNAME = 'metoo'),1, 'promotion');
-- Update country of a specific influencer
UPDATE INFLUENCER SET COUNTRYID = (select locationid from location where location.locationname = 'United States') WHERE INFLUENCERNAME = 'Bill Gates';



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
        INSERT INTO USRFLWINFL (FLWRID, INFLID)
            VALUES (
              (SELECT USRID
                FROM USR
                WHERE USRNAME = 'Filleboy'),
              (SELECT INFLUENCERID
                FROM INFLUENCER
                WHERE INFLUENCERNAME = 'Jockiboi'));

-- Get all posts from a specific platform
SELECT * FROM POST
  WHERE PLATFORM = 'instagram';

-- Get all posts from an influencer
SELECT * FROM POST
  WHERE INFLID = 1 ;


-- Get content from influencer
WITH P AS (
  SELECT * FROM POST
  WHERE PLATFORM = 'instagram'
  AND INFLID = 1
  ORDER BY POSTED DESC
), INFLLIST AS (
  SELECT INFLID
  FROM USRFLWINFL
  WHERE FLWRID = 1
)   SELECT *, (SELECT (COUNT(*) >= 1)
FROM INFLLIST
WHERE INFLID IN(P.INFLID))
AS USRFOLLOWINGINFLUENCER
FROM P ORDER BY POSTED DESC;

-- Return latest feed with a status if user with user id sent in follows the influencer posting the post.
WITH INFLLIST AS (
  SELECT INFLID
  FROM USRFLWINFL
  WHERE FLWRID = 1
), P AS (
  SELECT * FROM POST ORDER BY POSTED DESC LIMIT 100
)
SELECT *, (SELECT (COUNT(*) >= 1) FROM INFLLIST WHERE INFLID IN(P.INFLID)) AS USRFOLLOWINGINFLUENCER
  FROM P ORDER BY POSTED DESC;

-- Get all posts from a specific platform and influencer
SELECT * FROM POST
  WHERE PLATFORM = 'instagram' AND INFLID = 1;

-- Get all posts from a user's favorite influencers
SELECT * FROM POST AS P WHERE P.INFLID IN(SELECT INFLID FROM USRFLWINFL WHERE FLWRID = 1);

-- Get complete list of influencers followed by a user (without platform info)
SELECT * FROM INFLUENCER AS I WHERE I.INFLUENCERID IN(SELECT INFLID FROM USRFLWINFL WHERE FLWRID = 1);

-- Get complete list of influencers followed by a user with their platformaccountinfo
WITH INFLUENCERWITHPLATFORMACCOUNTS AS (
  SELECT INFLUENCER.*, PLATFORMACCOUNT.* FROM INFLUENCER
  INNER JOIN PLATFORMACCOUNT ON
  INFLUENCER.INFLUENCERID = PLATFORMACCOUNT.INFLID
  AND INFLUENCER.INFLUENCERID IN(SELECT INFLID FROM USRFLWINFL WHERE FLWRID = 1)
  )
SELECT * FROM INFLUENCERWITHPLATFORMACCOUNTS AS I
  ORDER BY INFLUENCERNAME;

-- INSERT A USER into the DB
INSERT INTO POST(INFLID, NRLIKES, PLATFORM, USRTXTCONTENT, POSTED, POSTURL, PLATFORMCONTENT)
  VALUES ((SELECT INFLUENCERID FROM INFLUENCER WHERE REALNAME = 'Bill Gates'), 1231, 'instagram', 'Chilliaang at the WEF. Cool', (SELECT NOW()), 'instagram.com/aasdq', NULL);

WITH B AS (
  SELECT I.INFLUENCERNAME, U.INFLID
  FROM USRFLWINFL AS U, INFLUENCER AS I
  WHERE U.FLWRID = 1 AND U.INFLID = I.INFLUENCERID
)
SELECT B.INFLUENCERNAME, ARRAY(SELECT ACTNAME || ' : ' || PLATFORM
  FROM PLATFORMACCOUNT
  WHERE INFLID = B.INFLID) FROM B;

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


-- WITH B AS (
--   SELECT I.INFLUENCERNAME, U.INFLID
--   INFLUENCER AS I
--
-- )
-- SELECT B.INFLUENCERNAME, ARRAY(SELECT ACTNAME || ' : ' || PLATFORM
--   FROM PLATFORMACCOUNT
--   WHERE INFLID = B.INFLID) FROM B;
-- Perform a search for influencers based on names.
--
-- WITH I AS (
--     SELECT DISTINCT INFLUENCER.INFLID, INFLUENCER.INFLUENCERNAME, INFLUENCER.REALNAME,
-- )
-- SELECT json_build_object('pics',
--   json_agg(
--     json_build_object('platform',
--       platformaccount.platform,
--       'piclink',
--       platformaccount.imgurl)))
--       AS pics FROM platformaccount as p;
--
--       , json_build_object('pics',
--         json_agg(
--           json_build_object('platform',
--             platformaccount.platform,
--             'piclink',
--             platformaccount.imgurl)))
--             AS pics
--
--             WITH INFLUENCERWITHPLATFORMACCOUNTS AS (
--               SELECT INFLUENCER.*, PLATFORMACCOUNT.* FROM INFLUENCER
--               INNER JOIN PLATFORMACCOUNT ON
--               INFLUENCER.INFLUENCERID = PLATFORMACCOUNT.INFLID
--               AND INFLUENCER.INFLUENCERID IN(SELECT INFLID FROM USRFLWINFL WHERE FLWRID = 1)
--               )

-- WITH PLATFORMACCOUNTS AS (
--   SELECT PACC.INFLID, json_build_object('platformaccounts',
--     json_agg(
--       json_build_object('nr_flwrs',
--         PACC.NRFLWRS,
--         'member_since',
--         PACC.MEMBERSINCE,
--         'act_url',
--         PACC.ACTURL,
--         'is_verified',
--         PACC.VERIFIED,
--         'usr_desc',
--         PACC.USRDESC,
--         'platform',
--         PACC.platform,
--         'piclink',
--         PACC.imgurl,
--         'actname',
--         PACC.actname,
--         'platform_content',
--         PACC.platformcontent)))
--         AS PFACCS FROM PLATFORMACCOUNT AS PACC
--         GROUP BY INFLID
-- ), USERPOSTS AS (
--   SELECT P.INFLID, json_build_object('platformaccounts',
--     json_agg(
--       json_build_object('post_id',
--         P.POSTID,
--         'nr_likes',
--         P.NRLIKES,
--         'platform',
--         P.PLATFORM,
--         'usr_text_content',
--         P.USRTXTCONTENT,
--         'posted',
--         P.POSTED,
--         'post_platform_id',
--         P.POSTPLATFORMID,
--         'platform_content',
--         P.platformcontent)))
--         AS posts FROM POST AS P
--         GROUP BY INFLID
-- ), IPC AS (
--   SELECT INFLUENCER.*, USERPOSTS.POSTS, PLATFORMACCOUNTS.PFACCS FROM INFLUENCER
--   INNER JOIN PLATFORMACCOUNTS ON
--   INFLUENCER.INFLUENCERID = PLATFORMACCOUNTS.INFLID
--   INNER JOIN USERPOSTS ON
--   PLATFORMACCOUNTS.INFLID = USERPOSTS.INFLID
--   --WHERE LOWER(INFLUENCERNAME) LIKE '%anna%' OR LOWER(REALNAME) LIKE '%anna%' OR LOWER(ACTNAME) LIKE '%anna%'
--   --GROUP BY INFLUENCERID, INFLUENCERNAME, ACTNAME
-- ), FINALTABLE AS (
--   SELECT * FROM IMGURLS INNER JOIN IPC ON IPC.INFLUENCERID = IMGURLS.INFLID
-- )
--  SELECT DISTINCT ON (INFLID, INFLUENCERNAME, REALNAME) INFLID, INFLUENCERNAME, REALNAME, PICS FROM FINALTABLE;



-- Retrieve influencer id, real name and all account names
WITH INFLLIST AS (
  SELECT INFLID
  FROM USRFLWINFL
  WHERE FLWRID = 2
), PLATFORMACCOUNTS AS (
  SELECT PACC.INFLID, json_build_object('platformaccounts',
    json_agg(
      json_build_object(
        'actname',
        PACC.actname,
        'platform',
        PACC.PLATFORM,
        'imgurl',
        PACC.IMGURL)))
        AS PFACCS FROM PLATFORMACCOUNT AS PACC
        GROUP BY INFLID
), IPC AS (
  SELECT INFLUENCER.INFLUENCERNAME, INFLUENCER.REALNAME, PLATFORMACCOUNTS.* FROM INFLUENCER
  INNER JOIN PLATFORMACCOUNTS ON
  INFLUENCER.INFLUENCERID = PLATFORMACCOUNTS.INFLID
)
 SELECT DISTINCT ON (IPC.INFLID, IPC.INFLUENCERNAME, IPC.REALNAME) IPC.*, (SELECT (COUNT(*) >= 1) FROM INFLLIST WHERE INFLLIST.INFLID IN(IPC.INFLID)) AS USRFOLLOWINGINFLUENCER FROM IPC;

-- Search alternative if it would be too heavy to do the query above.
-- This one will fetch a picture if there is a profile picture for any of the platformaccounts.
-- If there is no picture, it will return null and a placeholder shall be held frontend.
SELECT DISTINCT ON (I.INFLUENCERID, I.INFLUENCERNAME, I.REALNAME) I.INFLUENCERID, I.INFLUENCERNAME, I.REALNAME, P.IMGURL FROM INFLUENCER AS I
  INNER JOIN PLATFORMACCOUNT AS P ON I.INFLUENCERID = P.INFLID
  WHERE LOWER(I.INFLUENCERNAME) LIKE '%anna%' OR LOWER(I.REALNAME) LIKE '%anna%' OR LOWER(P.ACTNAME) LIKE '%anna%';

--SELECT DISTINCT INFLUENCERID, INFLUENCERNAME, ACTNAME FROM INFLUENCERWITHPLATFORMACCOUNTS AS I WHERE LOWER(INFLUENCERNAME) LIKE '%bill%' OR LOWER(REALNAME) = '%bill%' OR LOWER(ACTNAME) = '%bill%'
--  ORDER BY INFLUENCERNAME;
-- Select all promoted influencers and all their platformaccounts based on

-- Count number of clicks for each influencer or post related to a tag.


-- Count number of clicks on promoted hashtags

--SELECT

-- Count number of visits on a profile based on

SELECT COUNT(*) FROM USRVISIT WHERE INFLID = (SELECT influencerID FROM INFLUENCER where REALNAME = 'Jockiboi');

-- Get all posts related to a tag

SELECT * FROM POST WHERE POST.POSTID = ANY(
  SELECT POSTID FROM TAGFORPOST WHERE TAGFORPOST.TAGID = ANY(SELECT TAGID FROM TAG WHERE TAGNAME = 'metoo')
);

--Update a post
UPDATE POST SET platform = ('twitter') WHERE postid = 1;

-- Get amount of clicks on promoted influencers
SELECT I.INFLID, COUNT(*) AS NRCLICKS, (SELECT
  (COUNT(*) >= 1)
  FROM INFLUENCERPROMOTED
  WHERE INFLUENCERID IN(I.INFLID)
  AND PROMOTIONID = 1) AS ISPROMOTEDBYCAMPAIGN
  FROM USRVISIT AS I GROUP BY I.INFLID
  ORDER BY NRCLICKS DESC;

SELECT I.INFLID, COUNT(*) AS NRCLICKS, (SELECT
  (COUNT(*) >= 1)
  FROM INFLUENCERPROMOTED
  WHERE INFLUENCERID IN(I.INFLID)
  AND PROMOTIONID IN(SELECT PROMOTIONID FROM PROMOTION WHERE TVOPERATORID = 1)) AS ISPROMOTEDBYCAMPAIGN
  FROM USRVISIT AS I GROUP BY I.INFLID
  ORDER BY NRCLICKS DESC;

-- Fetch average age of users who's clicked on a post.

WITH USERSCLICKED AS (
  SELECT DISTINCT(USRID) FROM TVOPERATORCONTENTCLICK WHERE ADID = 1
)
SELECT CAST (AVG(USR.AGE) AS INTEGER) FROM USR, USERSCLICKED WHERE USR.USRID = USERSCLICKED.USRID;

WITH USERSCLICKED AS (
  SELECT DISTINCT(USRID) FROM TVOPERATORCONTENTCLICK WHERE ADID = 1
)
SELECT CAST (AVG(USR.AGE) AS INTEGER) AS AVGAGE FROM USR, USERSCLICKED WHERE USR.USRID = USERSCLICKED.USRID;
-- Fetch ALL information related to a specific influencer, including account information etc.

WITH PLATFORMACCOUNTS AS (
  SELECT PACC.INFLID, json_build_object('platformaccounts',
    json_agg(
      json_build_object('nr_flwrs',
        PACC.NRFLWRS,
        'member_since',
        PACC.MEMBERSINCE,
        'act_url',
        PACC.ACTURL,
        'is_verified',
        PACC.VERIFIED,
        'usr_desc',
        PACC.USRDESC,
        'platform',
        PACC.platform,
        'piclink',
        PACC.imgurl,
        'actname',
        PACC.actname,
        'platform_content',
        PACC.platformcontent)))
        AS PFACCS FROM PLATFORMACCOUNT AS PACC
        WHERE INFLID = 1
        GROUP BY INFLID
), USERPOSTS AS (
  SELECT P.INFLID, json_build_object('platformaccounts',
    json_agg(
      json_build_object('post_id',
        P.POSTID,
        'nr_likes',
        P.NRLIKES,
        'platform',
        P.PLATFORM,
        'usr_text_content',
        P.USRTXTCONTENT,
        'posted',
        P.POSTED,
        'post_platform_id',
        P.POSTPLATFORMID,
        'platform_content',
        P.platformcontent)))
        AS posts FROM POST AS P
        WHERE INFLID = 1
        GROUP BY INFLID
), IPC AS (
  SELECT INFLUENCER.*, USERPOSTS.POSTS, PLATFORMACCOUNTS.PFACCS FROM INFLUENCER
  INNER JOIN PLATFORMACCOUNTS ON
  INFLUENCER.INFLUENCERID = PLATFORMACCOUNTS.INFLID
  INNER JOIN USERPOSTS ON
  PLATFORMACCOUNTS.INFLID = USERPOSTS.INFLID
)
SELECT * FROM IPC;



--- FR66: The TV-operator shall be able to view the top five most followed influencers in
--  total for all end users that has clicked on each advertisement.
WITH USERSCLICKEDADV AS (
  SELECT DISTINCT(USRID)
  FROM TVOPERATORCONTENTCLICK
  WHERE ADID = 1
)
SELECT INFLID,
(SELECT INFLUENCER.INFLUENCERNAME
  FROM INFLUENCER
  WHERE INFLUENCER.INFLUENCERID = USRFLWINFL.INFLID) AS INFLUENCERNAME,
  COUNT(*) AS NRFOLLOWING
  FROM USRFLWINFL, USERSCLICKEDADV
  WHERE USRFLWINFL.FLWRID IN(USERSCLICKEDADV.USRID)
  GROUP BY INFLID
  ORDER BY NRFOLLOWING
  DESC LIMIT 10;

WITH DATES AS (
  SELECT VISITTIME::date FROM TVOPERATORCONTENTCLICK WHERE ADID = 1
)
SELECT (SELECT 1) AS ADID,
  DATES.VISITTIME AS DATEVISITED,
  COUNT(DATES.VISITTIME) AS NRVISITSONDAY
  FROM DATES
  GROUP BY DATEVISITED
  ORDER BY DATEVISITED ASC;

WITH IMGS AS (
  SELECT DISTINCT ON (PACC.INFLID) PACC.INFLID, json_build_object('platformaccounts',
    json_agg(
      json_build_object(
        'actname',
        PACC.actname,
        'platform',
        PACC.PLATFORM,
        'imgurl',
        PACC.IMGURL))) as IMG
        FROM PLATFORMACCOUNT AS PACC
        GROUP BY PACC.INFLID
)
SELECT COUNT(*) AS NRCLICKS, INFLUENCER.*, (SELECT json_build_object('platformaccounts',
  json_agg(
    json_build_object(
      'actname',
      PACC.actname,
      'platform',
      PACC.PLATFORM,
      'imgurl',
      PACC.IMGURL))) as IMG
      FROM PLATFORMACCOUNT AS PACC
      WHERE PACC.INFLID = INFLUENCER.INFLUENCERID
      GROUP BY PACC.INFLID) FROM INFLUENCER
      INNER JOIN USRVISIT ON INFLUENCER.INFLUENCERID = USRVISIT.INFLID
      GROUP BY INFLUENCER.INFLUENCERID LIMIT 100;
