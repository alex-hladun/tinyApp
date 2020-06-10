const bcrypt = require('bcrypt');

const getUserByEmail = function(email, database) {
  for (const userID in database) {
    if (database[userID].email === email) {
      return userID;
    }
  }
  return null;
};

const checkLogin = (loginInfo, userDatabase) => {
  // Takes in login details and compares to stored data.
  for (const userID in userDatabase) {
    if (userDatabase[userID].email === loginInfo.email && bcrypt.compareSync(loginInfo.password, userDatabase[userID].password)) {
      console.log('successful login');
      return userID;
    }
  }
  return false;
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


module.exports = {
  getUserByEmail,
  checkLogin,
  urlsForUser,
  checkEmailTaken
};