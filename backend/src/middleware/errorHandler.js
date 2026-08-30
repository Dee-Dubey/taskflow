module.exports = function errorHandler(error, req, res, next){
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error';

  if(error.name === 'CastError'){
    statusCode = 400;
    message = `Invalid value for field '${error.path}'` 
  }

  if(error.name === 'ValidationError'){
    statusCode = 400;
    message = Object.values(error.errors).map((e) => e.message).join('. ');
  }

  if(error.code === 11000) {
    statusCode = 409;
    const field = Object.keys(error.keyPattern || {})[0];
    message = `${field} already exists`;
  }

  console.error(error.message);
  res.status(statusCode).json({message})
}