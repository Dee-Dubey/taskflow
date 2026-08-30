const User = require('../models/user.model');

exports.findByEmail = (email, withPassword = false) => {
  const query = User.findOne({email})
  return withPassword ? query.select('+password') : query;
}

exports.findByUsername = (username) => User.findOne({username});

exports.findById = (id) => User.findById(id);

exports.create = (data) => User.create(data);

exports.findManagers = () => User.find({role: 'manager'}).select('username _id');

exports.findTeamLeads = () => User.find({ role: 'teamlead' }).select('username email _id');

exports.findAll = () => User.find().select('username email role reportsTo').sort({ role: 1 });

exports.findByReportsTo = (managerOrLeadId) =>
  User.find({ reportsTo: managerOrLeadId }).select('username email role reportsTo');

exports.findByIds = (ids) => User.find({ _id: { $in: ids } }).select('username email role');