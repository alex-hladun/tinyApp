const express = require('express');
const bodyParser = require("body-parser");
const { generateRandomString } = require('./generateRandomString');
const app = express();
const PORT = 8080;
// set the view engine to ejs
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// /urls Route Handler.
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});


app.post('/urls', (req, res) => {
  let randStr = generateRandomString();
  // Save the URL that is posted.
  urlDatabase[randStr] = req.body.longURL;
  // console.log(urlDatabase);
  res.redirect(`/urls/${randStr}`);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  let templateVars = { shortURL, longURL };
  res.render("urls_show", templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  res.redirect(longURL);
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
  console.log('Random string: ', generateRandomString());
});