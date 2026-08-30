const Task = require('../models/task.model');

exports.create = (data) => Task.create(data);

exports.findById = (id) => Task.findById(id).populate('assignedTo createdBy', 'username email role');

exports.find = (filter) => Task.find(filter).populate('assignedTo createdBy', 'username email role').sort({ createdAt: -1 });

exports.updateById = (id, data) => Task.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true }).populate(
    'assignedTo createdBy',
    'username email role'
  );

exports.deleteById = (id) => Task.findByIdAndDelete(id);