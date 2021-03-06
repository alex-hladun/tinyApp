const express = require('express');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const { generateRandomString } = require('./generateRandomString');
const { getUserByEmail, urlsForUser, checkEmailTaken, calculateViews, calcSiteStats } = require('./helpers');
const methodOverride = require('method-override');
const app = express();
const PORT = 8080;
const saltRounds = 10;
// set the view engine to ejs
app.set("view engine", "ejs");
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

const getUserID = (id) => {
  for (const userID in users) {
    if (id === userID) {
      return userID;
    }
  }
  return null;
};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW", pageViews: [] },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW", pageViews: [] }
};


const users = {
  "t0i8b3": {
    id: "t0i8b3",
    email: "alex@test.com",
    password: "$2b$10$/XbZkN3KhbUuz/p7d9znzeHlpfz7dMeqPKdPIxXOey49..V5prxZS"
  }
};

// Redirect link.
app.get('/u/:shortURL', (req, res) => {
  const userID = req.session.userID;
  let sessionID = userID;
  const shortURL = req.params.shortURL;
  // generate user id if it doesn't exist
  if (!userID) {
    sessionID = generateRandomString();
    req.session.visitorID = sessionID;
  }
  if (!urlDatabase[shortURL]) {
    res.redirect('/error');
  }
  const visitObj = {
    date: new Date(),
    userID: sessionID
  };
  urlDatabase[shortURL]['pageViews'].push(visitObj);
  const longURL = urlDatabase[shortURL]['longURL'];
  res.redirect(longURL);
});

// /urls Route Handler.
app.get('/urls', (req, res) => {
  const userID = req.session.userID;
  if (!userID) {
    res.redirect('/login/403');
  }
  const userDB = urlsForUser(userID, urlDatabase);

  // returns a database with all of the users short-links,
  // and values for pageviews, unique views, and visit history.
  const userViewInfo = calculateViews(userID, urlDatabase);
  const userInfo = users[userID];

  let templateVars = {
    userInfo,
    urls: userDB,
    userViewInfo
  };
  return res.render("urls_index", templateVars);
});

app.get('/login', (req, res) => {
  let errMessage;
  // build page with error message. Might need to include all templateVars here.
  const userID = req.session.userID;
  if (!users[userID]) {
    req.session = null;
  }
  if (userID) {
    res.redirect('/urls');
  }
  
  const siteStats = calcSiteStats(urlDatabase);
  const userInfo = users[userID];
  let templateVars = {
    userInfo,
    urls: urlDatabase,
    errMessage,
    siteStats
  };
  res.render('login', templateVars);
});

app.get('/login/:err', (req, res) => {
  const errMessage = req.params.err;
  const siteStats = calcSiteStats(urlDatabase);
  const userID = req.session.userID;
  if (userID) {
    res.redirect('/urls');
  }
  const userInfo = users[userID];
  let templateVars = {
    userInfo,
    urls: urlDatabase,
    errMessage,
    siteStats
  };
  res.render('login', templateVars);
});


app.post('/login', (req, res) => {
  const loginInfo = req.body;
  const userID = getUserByEmail(loginInfo.email, users);
  if (!userID) {
    return res.redirect('login/401');
  }
  
  bcrypt.compare(loginInfo.password, users[userID].password, function(err, result) {
    if (result) {
      req.session.userID = userID;
      return res.redirect('/urls');
    } else {
      return res.redirect('login/401');
    }
  });
});


app.get('/register', (req, res) => {
  let errMessage;
  const userID = req.session.userID;
  if (userID) {
    res.redirect('/urls');
  }

  const userInfo = users[userID];
  let templateVars = {
    userInfo,
    urls: urlDatabase,
    errMessage
  };
  return res.render('register', templateVars);
});

app.get('/register/:err', (req, res) => {
  let errMessage;
  if (req.params.err) {
    errMessage = req.params.err;
  }

  const userID = req.session.userID;
  if (userID) {
    res.redirect('/urls');
  }
  const userInfo = users[userID];
  let templateVars = {
    userInfo,
    urls: urlDatabase,
    errMessage
  };
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  // Add new user to database.
  if (req.body.email === "" || req.body.password === "") {
    return res.redirect('/register/empty');
  }

  if (checkEmailTaken(req.body.email, users)) {
    return res.redirect('/register/taken');
  }

  // Set user_id cookie. If the user was a visitor, that is now their userID.
  let newUserID = generateRandomString();
  if (req.session.visitorID) {
    newUserID = req.session.visitorID;
  }

  

  users[newUserID] = {
    id: newUserID,
    email: req.body.email,
    password: bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
      // Store hash in your password DB.
      users[newUserID].password = hash;
    })
  };
  req.session.userID = newUserID;
  return res.redirect('/urls');
});

app.post('/urls', (req, res) => {
  // Get USER ID
  const userID = getUserID(req.session.userID);

  if (userID) {
    let randStr = generateRandomString();
    const date = (new Date()).toLocaleDateString('en-US');
    // Save the URL that is posted.
    urlDatabase[randStr] = {
      date,
      longURL: req.body.longURL,
      userID: userID,
      pageViews: []
    };
    return res.redirect(`/urls/${randStr}`);
  } else {
    res.redirect('/login/403');
  }
});

// DELETE methodx
app.delete('/urls/:shortURL', (req, res) => {
  const userID = req.session.userID;
  if (!userID) {
    res.redirect('/login/403');
  }

  let shortURL = req.params.shortURL;
  const userDB = urlsForUser(userID);
  if (!userDB[shortURL]) {
    res.redirect('/urls');
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls/`);

});

app.put('/urls/:shortURL', (req, res) => {
  const userID = req.session.userID;
  if (!userID) {
    res.redirect('login/403');
  }
  const shortURL = req.params.shortURL;

  // re-direct if user doesn't have proper access.
  const userDB = urlsForUser(userID);
  if (!userDB[shortURL]) {
    res.redirect('/urls');
  }

  urlDatabase[shortURL].longURL = req.body.editURL;
  return res.redirect(`/urls/${shortURL}`);
});

app.post('/logout', (req, res) => {
  // Cookies that have not been signed
  req.session = null;
  return res.redirect('/login/logout');
});

// New URL page
app.get('/urls/new', (req, res) => {
  const userID = getUserID(req.session.userID);
  const userInfo = users[userID];
  let templateVars = {
    userInfo
  };
  if (userID) {
    return res.render('urls_new', templateVars);
  } else {
    return res.redirect('/login/403');
  }
});

app.get('/error', (req, res) => {
  const userID = getUserID(req.session.userID);
  const userInfo = users[userID];
  let templateVars = {
    userInfo
  };

  return res.render('error', templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = getUserID(req.session.userID);
  // re-direct if cookie isn't registered for user
  if (!userID) {
    return res.redirect('/login/403');
  }


  // re-direct if user doesn't have proper access.
  const userDB = urlsForUser(userID, urlDatabase);
  if (!userDB[shortURL]) {
    return res.redirect('/error');
  }

  const userViewInfo = calculateViews(userID, urlDatabase);
  const viewInfo = userViewInfo[shortURL];

  const userInfo = users[userID];
  let longURL = urlDatabase[shortURL].longURL;
  let templateVars = {
    shortURL,
    longURL,
    userInfo,
    viewInfo
  };
  return res.render("urls_show", templateVars);
});




app.get('/', (req, res) => {
  const userID = req.session.userID;
  if (userID) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.get('/urls.json', (req, res) => {
  return res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  return res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.listen(PORT, () => {
  console.log(`Express app server listening on post ${PORT}!`);
});