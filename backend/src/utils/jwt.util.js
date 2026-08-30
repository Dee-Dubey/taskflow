const jwt = require('jsonwebtoken');

function generateAccessToken(payload){
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN
  })
}

function verifyAccessToken(token){
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}

function generateRefreshToken(payload){
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN
  });
}

function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

module.exports = {
  generateAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  verifyRefreshToken
}
