const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 150
  },
  description: {
    type: String,
    trim: true,
    maxlength: 2000,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dueDate: {
    type: Date,
    default: null,
  }

}, { timestamps: true })

taskSchema.index({assignedTo: 1, status: 1});

module.exports = mongoose.model('Task', taskSchema);