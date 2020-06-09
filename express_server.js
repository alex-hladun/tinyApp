const express = require('express');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const { generateRandomString } = require('./generateRandomString');
const app = express();
const PORT = 8080;
// set the view engine to ejs
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// Redirect link.
app.get('/u/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  console.log(longURL);
  res.redirect(longURL);
});

// /urls Route Handler.
app.get("/urls", (req, res) => {
  const userID = getUserID(req.cookies["user_id"]);
  const userInfo = users[userID];
  let templateVars = {
    userInfo,
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get('/login', (req, res) => {
  const userID = getUserID(req.cookies["user_id"]);
  const userInfo = users[userID];
  let templateVars = {
    userInfo,
    urls: urlDatabase
  };
  res.render('login', templateVars);
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
    password: req.body.password
  };
  // Set user_id cookie.
  res.cookie('user_id', newUserID);
  console.log(users);
  res.redirect('/urls');
});

app.post('/urls', (req, res) => {
  let randStr = generateRandomString();
  // Save the URL that is posted.
  urlDatabase[randStr] = req.body.longURL;
  res.redirect(`/urls/${randStr}`);
});

// POST request to delete
app.post('/urls/:shortURL/delete', (req, res) => {
  // Delete the URL for that link.
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls/`);
});

// app.post('/login', (req, res) => {
//   const username = req.body.username;
//   console.log(username);
//   // Cookies that have not been signed
//   res.cookie('username', username);
//   console.log('Cookies: ', req.cookies);
//   // Cookies that have been signed
//   console.log('Signed Cookies: ', req.signedCookies);
//   res.redirect('/urls');
// });

app.post('/logout', (req, res) => {
  // Cookies that have not been signed
  res.clearCookie('user_id');
  console.log('Cookies: ', req.cookies);
  // Cookies that have been signed
  console.log('Signed Cookies: ', req.signedCookies);
  res.redirect('/urls');
});

// POST request to edit
app.post('/urls/:shortURL/edit', (req, res) => {
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.editURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get('/urls/new', (req, res) => {
  const userID = getUserID(req.cookies["user_id"]);
  const userInfo = users[userID];
  let templateVars = {
    userInfo
  };
  console.log(users);
  console.log("req.Cookies[user_id]: ", req.cookies["user_id"]);
  console.log("got userID: ", userID);
  res.render('urls_new', templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = getUserID(req.cookies["user_id"]);
  const userInfo = users[userID];
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
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