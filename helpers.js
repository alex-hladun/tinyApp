const bcrypt = require('bcrypt');

const getUserByEmail = function(email, database) {
  for (const userID in database) {
    if (database[userID].email === email) {
      return userID;
    }
  }
  return null;
};

const urlsForUser = (id, urlDatabase) => {
  const urlDB = {};
  for (const URL in urlDatabase) {
    if (urlDatabase[URL].userID === id) {
      urlDB[URL] = urlDatabase[URL].longURL;
    }
  }
  return urlDB;
};

const checkEmailTaken = (email, userDatabase) => {
  for (const userID in userDatabase) {
    // console.log(userDatabase[userID].email);
    // console.log(req.body.email);
    if (email === userDatabase[userID].email) {
      return true;
    }
  }
  return false;
};

const calculateViews = (id, urlDatabase) => {
  // returns a database with all of the users short-links,
  // and values for pageviews, unique views, and visit history.
  const visitObj = {};
  for (const URL in urlDatabase) {
    if (urlDatabase[URL].userID === id) {
      visitObj[URL] = {
        visits: 0,
        viewHistory: urlDatabase[URL]['pageViews'],
        createDate: urlDatabase[URL]['date']
      };
    }
  }
  
  for (const shortLink in visitObj) {
    const visitorArray = [];
    const counts = {};
    for (const pageView in visitObj[shortLink]['viewHistory']) {
      visitObj[shortLink]['visits'] ++;
      visitorArray.push(visitObj[shortLink]['viewHistory'][pageView]['userID']);
    }
    for (let i = 0; i < visitorArray.length; i++) {
      counts[visitorArray[i]] = 1 + (counts[visitorArray[i]] || 0);
    }
    visitObj[shortLink]['uniqueVisits'] = Object.keys(counts).length;
  }
  return visitObj;
};

const calcSiteStats = (urlDatabase) => {
  const linkCount = Object.keys(urlDatabase).length;
  let totalViews = 0;
  for (const URL in urlDatabase) {
    for (const view in urlDatabase[URL]['pageViews']) {
      totalViews ++;
    }
  }

  return {
    linkCount,
    totalViews
  };
};


module.exports = {
  getUserByEmail,
  urlsForUser,
  checkEmailTaken,
  calculateViews,
  calcSiteStats
};