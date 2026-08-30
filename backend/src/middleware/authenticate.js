const {verifyAccessToken} = require('../utils/jwt.util');
const ApiError = require('../utils/apiError');

module.exports = function authenticate(req, res, next){
  const header = req.headers.authorization;
  if(!header || !header.startsWith('Bearer ')){
    return next(new ApiError(401, 'Access token missing'))
  }
  const token = header.split(' ')[1];
  try {
    req.user = verifyAccessToken(token);
    next()
  } catch (error) {
    next(new ApiError(401, 'Invalid or expired access token'))
  }
}
