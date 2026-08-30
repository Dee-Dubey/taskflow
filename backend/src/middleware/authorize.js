const ApiError = require('../utils/apiError');

module.exports = function authorize(...allowedRoles) {
  return (req, res, next) => {
    if(!req.user || !allowedRoles.includes(req.user.role)){
      return next(new ApiError(403, 'You do not have permission for this action'));
    }
    next()
  }
}