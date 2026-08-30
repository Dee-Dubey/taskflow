const ApiError = require('../utils/apiError');


exports.validateRegister = (req, res, next) => {
  const { username, email, password, role, reportsTo } = req.body;
  const errors = [];

  if (!username || username.trim().length < 3) {
    errors.push('Username is required and must be at least 3 characters')
  } else if(!/^[a-zA-Z0-9_.]+$/.test(username)){
    errors.push('Username can only contain letters, numbers, underscore, and dot')
  }

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.push('A valid email is required');
  }

  if (!password || password.length < 6) {
    errors.push('Password is required and must be at least 6 characters')
  }

  if (!role || !['manager', 'teamlead', 'employee'].includes(role)) {
    errors.push('Role must be one of manager, teamlead, employee');
  }

  if(role && role !== 'manager' && !reportsTo){
    errors.push(`reportsTo is required for role '${role}'`);
  }

  if (errors.length) return next(new ApiError(400, errors.join('. ')))
  next();
}

exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) errors.push('Email is required');
  if (!password) errors.push('Password is required');

  if (errors.length) return next(new ApiError(400, errors.join('. ')));
  next();
}