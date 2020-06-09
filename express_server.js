const express = require('express');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const { generateRandomString } = require('./generateRandomString');
const app = express();
const PORT = 8080;
// set the view engine to ejs
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  let templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
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

app.post('/login', (req, res) => {
  const username = req.body.username;
  console.log(username);
  // Cookies that have not been signed
  res.cookie('username', username);
  console.log('Cookies: ', req.cookies);
  // Cookies that have been signed
  console.log('Signed Cookies: ', req.signedCookies);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  // Cookies that have not been signed
  res.clearCookie('username');
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
  let templateVars = {
    username: req.cookies["username"]
  };

  res.render('urls_new', templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  let templateVars = {
    shortURL,
    longURL,
    username: req.cookies["username"],
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