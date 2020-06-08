const generateRandomString = () => {
  const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
  let randStr = "";
  for (let i = 1; i <= 3; i++) {
    let alpha = Math.round(Math.random() * 25);
    let num = Math.round(Math.random() * 9);
    randStr += alphabet[alpha] + num;
  }
  return randStr;
};

// console.log(generateRandomString());

module.exports = { generateRandomString };