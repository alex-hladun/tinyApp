const { assert } = require('chai');
const { getUserByEmail, calculateViews, calcSiteStats } = require('../helpers.js');

const testUsers = {
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

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW", pageViews: [
    { date: '2020-06-10T03:47:47.588Z', userID: 'c8v4o2' },
    { date: '2020-06-10T03:47:48.660Z', userID: 'c8v4ds2' },
    { date: '2020-06-10T03:47:49.431Z', userID: 'zzzo2' },
    { date: '2020-06-10T03:47:49.431Z', userID: 'zzdzo2' },
    { date: '2020-06-10T03:47:49.431Z', userID: 'zzgzo2' },
    { date: '2020-06-10T03:47:49.431Z', userID: 'zzzzo2' },
    { date: '2020-06-10T03:47:49.431Z', userID: 'zzxxxzo2' },
    { date: '2020-06-10T03:47:50.123Z', userID: 'c8v4o2' }
  ]
  },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW", pageViews: [
    { date: '2020-06-10T03:47:50.123Z', userID: 'c8v4o2' },
    { date: '2020-06-10T03:47:50.123Z', userID: 'c8v4o2' },
    { date: '2020-06-10T03:47:50.123Z', userID: 'c8v4o2' },
    { date: '2020-06-10T03:47:50.123Z', userID: 'c8v4o2' },
    { date: '2020-06-10T03:47:50.123Z', userID: 'c8v4o2' },
    { date: '2020-06-10T03:47:50.123Z', userID: 'c8v4o2' },
    { date: '2020-06-10T03:47:50.123Z', userID: 'c8vdso2' },
    { date: '2020-06-10T03:47:50.123Z', userID: 'c8v4o2' },
    { date: '2020-06-10T03:47:50.123Z', userID: 'c8v4o2' },
    { date: '2020-06-10T03:47:50.123Z', userID: 'c8v4o2' },
    { date: '2020-06-10T03:47:50.123Z', userID: 'c8v4o2' }
  ]}
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user2@example.com", testUsers);
    const expectedOutput = "user2RandomID";
    // Write your assert statement here
    assert.equal(user, expectedOutput);
  });
});

describe('getUserByEmail', function() {
  it('should return undefined for invalid email', function() {
    const user = getUserByEmail("userww2@example.com", testUsers);
    const expectedOutput = undefined;
    // Write your assert statement here
    assert.equal(user, expectedOutput);
  });
});

describe('calculateViews', function() {
  it('should return 4 pageviews for link id aJ48lW and user ID b6UTxQ', function() {
    const id = 'aJ48lW';
    const viewObj = calculateViews(id, urlDatabase);
    console.log(viewObj);
    assert.equal(viewObj['b6UTxQ']['visits'], 8);

  });
});
describe('calcSiteStats', function() {
  it('should return 2 urls and 19 pageviews for url database', function() {
    const siteStats = calcSiteStats(urlDatabase);
    console.log(siteStats);
    assert.equal(siteStats.totalViews, 19);

  });
});