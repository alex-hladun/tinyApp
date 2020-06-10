const express = require('express');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const { generateRandomString } = require('./generateRandomString');
const app = express();
const PORT = 8080;
// set the view engine to ejs
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());


const urlsForUser = (id) => {
  const urlDB = {};
  for (const URL in urlDatabase) {
    if (urlDatabase[URL].userID === id) {
      urlDB[URL] = urlDatabase[URL].longURL;
    }
  }
  return urlDB;
};
const getUserID = (id) => {
  for (const userID in users) {
    if (id === userID) {
      return userID;
    }
  }
  return null;
};

const checkEmailTaken = (email) => {
  for (const userID in users) {
    // console.log(users[userID].email);
    // console.log(req.body.email);
    if (email === users[userID].email) {
      return true;
    }
  }
  return false;
};

const checkLogin = (loginInfo) => {
  for (const userID in users) {
    if (users[userID].email === loginInfo.email && bcrypt.compareSync(loginInfo.password, users[userID].password)) {
      console.log('successful login');
      return userID;
    }
  }
  return false;
};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user2@example.com",
    password: "pass"
  },
  "aJ48lW": {
    id: "aJ48lW",
    email: "user@example.com",
    password: "pass"
  }
};

// Redirect link.
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]['longURL'];
  res.redirect(longURL);
});

// /urls Route Handler.
app.get("/urls", (req, res) => {
  const userID = getUserID(req.cookies["user_id"]);
  if (!userID) {
    res.redirect('/login', 403);
  }

  console.log(urlDatabase);
  console.log(users);

  const userDB = urlsForUser(userID);

  const userInfo = users[userID];
  let templateVars = {
    userInfo,
    urls: userDB
  };
  res.render("urls_index", templateVars);
});

app.get('/login', (req, res) => {
  console.log(req.body);
  console.log(req.cookies);
  // build page with error message. Might need to include all templateVars here.
  // const reqBody = req.body;
  const userID = getUserID(req.cookies["user_id"]);
  const userInfo = users[userID];
  let templateVars = {
    userInfo,
    urls: urlDatabase
    // reqBody
  };
  res.render('login', templateVars);

});

app.post('/login', (req, res) => {
  const loginInfo = req.body;
  console.log(loginInfo);
  const userID = checkLogin(loginInfo);
  if (userID) {
    res.cookie('user_id', userID);
    res.redirect('/urls');
  } else {
    res.redirect(403, 'login');
  }
});


app.get('/register', (req, res) => {
  const userID = getUserID(req.cookies["user_id"]);
  const userInfo = users[userID];
  let templateVars = {
    userInfo,
    urls: urlDatabase
  };
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  // Add new user to database.
  if (req.body.email === "" || req.body.password === "") {
    res.send('400 - Email or Password was empty');
  }
  
  if (checkEmailTaken(req.body.email)) {
    res.send('400 - Email is already taken!');
  }

  const newUserID = generateRandomString();
  users[newUserID] = {
    id: newUserID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  };
  // Set user_id cookie.
  res.cookie('user_id', newUserID);
  console.log(users);
  res.redirect('/urls');
});

app.post('/urls', (req, res) => {
  // Get USER ID
  const userID = getUserID(req.cookies["user_id"]);

  if (userID) {
    let randStr = generateRandomString();
    // Save the URL that is posted.
    urlDatabase[randStr] = {
      longURL: req.body.longURL,
      userID: userID
    };
    res.redirect(`/urls/${randStr}`);
  }
});

// POST request to delete
app.post('/urls/:shortURL/delete', (req, res) => {
  // re-direct if cookie isn't registered for user
  const userID = getUserID(req.cookies["user_id"]);
  if (!userID) {
    res.redirect('/login', 403);
  }
  let shortURL = req.params.shortURL;
  // re-direct if user doesn't have proper access.

  const userDB = urlsForUser(userID);
  if (!userDB[shortURL]) {
    res.redirect('/urls');
  }

  // Delete the URL for that link.
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls/`);
});

// POST request to edit
app.post('/urls/:shortURL/edit', (req, res) => {
  // re-direct if cookie isn't registered for user
  const userID = getUserID(req.cookies["user_id"]);
  if (!userID) {
    res.redirect('/login', 403);
  }
  let shortURL = req.params.shortURL;
  // re-direct if user doesn't have proper access.

  const userDB = urlsForUser(userID);
  if (!userDB[shortURL]) {
    res.redirect('/urls');
  }

  urlDatabase[shortURL].longURL = req.body.editURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post('/logout', (req, res) => {
  // Cookies that have not been signed
  res.clearCookie('user_id');
  console.log('Cookies: ', req.cookies);
  // Cookies that have been signed
  console.log('Signed Cookies: ', req.signedCookies);
  res.redirect('/login');
});

app.get('/urls/new', (req, res) => {
  const userID = getUserID(req.cookies["user_id"]);
  const userInfo = users[userID];
  let templateVars = {
    userInfo
  };
  // console.log(users);
  // console.log("req.Cookies[user_id]: ", req.cookies["user_id"]);
  // console.log("got userID: ", userID);
  if (userID) {
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = getUserID(req.cookies["user_id"]);

  // re-direct if cookie isn't registered for user
  if (!userID) {
    res.redirect('/login', 403);
  }
  
  // re-direct if user doesn't have proper access.
  const shortURL = req.params.shortURL;
  const userDB = urlsForUser(userID);
  if (!userDB[shortURL]) {
    res.redirect('/urls');
  }


  const userInfo = users[userID];
  let longURL = urlDatabase[shortURL].longURL;
  let templateVars = {
    shortURL,
    longURL,
    userInfo
  };
  res.render("urls_show", templateVars);
});

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.listen(PORT, () => {
  console.log(`Express app server listening on post ${PORT}!`);
});