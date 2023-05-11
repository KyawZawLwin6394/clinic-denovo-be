const bcrypt = require('bcryptjs');

async function filterRequestAndResponse(reArr, reBody) {
  if (reArr.length > 0) {
    const result ={};
    reArr.map((req) => {
      result[req] = reBody[req];
    })
    return result;
  }
  return;
}

async function   bcryptHash (password) {
  const hashedPassword = await bcrypt.hash(password,10)
  return hashedPassword
}

async function bcryptCompare (plain,hash) {
  const result = await bcrypt.compare(plain,hash)
  return result
}

module.exports = { bcryptHash,bcryptCompare,filterRequestAndResponse };
