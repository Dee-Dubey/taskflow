const ApiError = require('../utils/apiError')
const mongoose = require('mongoose');

exports.validateCreateTask = (req, res, next) => {
  const {title, status} = req.body;
  const errors = [];

  if(!title || title.trim().length === 0) {
    errors.push('Title is required');
  }

  if(title && title.length > 150) {
    errors.push('Title must be under 150 characters');
  }

  if (status && !['pending', 'in-progress', 'completed'].includes(status)) {
    errors.push('Status must be one of pending, in-progress, completed');
  }

  if (errors.length) return next(new ApiError(400, errors.join('. ')));
  next();
} 


exports.validateUpdateTask = (req, res, next) => {
  const { title, status } = req.body;
  const errors = [];

  if (title !== undefined && title.trim().length === 0) {
    errors.push('Title cannot be empty');
  }
  if (status && !['pending', 'in-progress', 'completed'].includes(status)) {
    errors.push('Status must be one of pending, in-progress, completed');
  }

  if (errors.length) return next(new ApiError(400, errors.join('. ')));
  next();
};

exports.validateObjectIdParam = (req, res, next) => {
  if(!mongoose.Types.ObjectId.isValid(req.params.id)){
    return next(new ApiError(400, 'Invalid ID format'))
  }
  next()
}

exports.validateReassign = (req, res, next) => {
  const { assignedTo } = req.body;
  if(!assignedTo || !mongoose.Types.ObjectId.isValid(assignedTo)){
    return next(new ApiError(400, 'A valid assignedTo user ID is required'));
  }

  next()
}