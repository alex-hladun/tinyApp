const express = require('express');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const { generateRandomString } = require('./generateRandomString');
const { getUserByEmail, checkLogin, urlsForUser, checkEmailTaken } = require('./helpers');
const methodOverride = require('method-override');
const app = express();
const PORT = 8080;
// set the view engine to ejs
app.set("view engine", "ejs");
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1','key2'],
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
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
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
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]['longURL'];
  res.redirect(longURL);
});

// /urls Route Handler.
app.get('/urls', (req, res) => {
  console.log("req.session user ID: ", req.session.userID);

  const userID = getUserID(req.session.userID);
  if (!userID) {
    console.log('redirecting away from /urls');
    res.redirect(403, '/login');
  }

  const userDB = urlsForUser(userID, urlDatabase);

  const userInfo = users[userID];
  let templateVars = {
    userInfo,
    urls: userDB
  };
  res.render("urls_index", templateVars);
});

app.get('/login', (req, res) => {
  console.log(req.body);
  // build page with error message. Might need to include all templateVars here.
  const userID = getUserID(req.session.userID);
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
  const userID = checkLogin(loginInfo, users);
  if (userID) {
    req.session.userID = userID;
    // res.cookie('user_id', userID);
    res.redirect('/urls');
  } else {
    res.redirect(403, 'login');
  }
});


app.get('/register', (req, res) => {
  const userInfo = null;
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
  
  if (checkEmailTaken(req.body.email, users)) {
    res.send('400 - Email is already taken!');
  }

  const newUserID = generateRandomString();
  users[newUserID] = {
    id: newUserID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  };
  // Set user_id cookie.
  req.session.userID = newUserID;
  console.log("req.session user ID: ", req.session.userID);
  // res.cookie('user_id', newUserID);
  console.log(users);
  res.redirect('/urls');
});

app.post('/urls', (req, res) => {
  // Get USER ID
  const userID = getUserID(req.session.userID);

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

// DELETE methodx
app.delete('/urls/:shortURL', (req, res) => {
  const userID = req.session.userID;
  console.log(userID);
  if (!userID) {
    res.redirect('/login', 403);
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
  console.log("user ID from req.session: ", userID);
  if (!userID) {
    res.redirect('/login', 403);
  }
  const shortURL = req.params.shortURL;
  
  // re-direct if user doesn't have proper access.
  const userDB = urlsForUser(userID);
  if (!userDB[shortURL]) {
    res.redirect('/urls');
  }

  urlDatabase[shortURL].longURL = req.body.editURL;
  res.redirect(`/urls/${shortURL}`);
});

// POST request to edit
// app.post('/urls/:shortURL/edit', (req, res) => {
//   // re-direct if cookie isn't registered for user
//   const userID = getUserID(req.session.userID);
//   if (!userID) {
//     res.redirect('/login', 403);
//   }
//   let shortURL = req.params.shortURL;
//   // re-direct if user doesn't have proper access.

//   const userDB = urlsForUser(userID);
//   if (!userDB[shortURL]) {
//     res.redirect('/urls');
//   }

//   urlDatabase[shortURL].longURL = req.body.editURL;
//   res.redirect(`/urls/${shortURL}`);
// });

app.post('/logout', (req, res) => {
  // Cookies that have not been signed
  req.session = null;
  console.log('Session cookies cleared');
  res.redirect('/login');
});

// New URL page
app.get('/urls/new', (req, res) => {
  const userID = getUserID(req.session.userID);
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
  const shortURL = req.params.shortURL;
  const userID = getUserID(req.session.userID);
  console.log(`Request for ${shortURL}`);
  // re-direct if cookie isn't registered for user
  if (!userID) {
    res.redirect('/login', 403);
  }
  // re-direct if user doesn't have proper access.
  const userDB = urlsForUser(userID, urlDatabase);
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