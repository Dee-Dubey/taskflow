const userRepo = require('../repositories/user.repository');
const ApiError = require('../utils/apiError');
const Task = require('../models/task.model');

exports.listVisibleUser = async (requester) => {
  if(requester.role === 'manager'){
    return userRepo.findAll()
  }
  if(requester.role === 'teamlead'){
    const team = await userRepo.findByReportsTo(requester.id);
    const self = await userRepo.findById(requester.id).select('username email role');
    return [self, ...team]
  }

  const self = await userRepo.findById(requester.id).select('username email role')

  return [self]
}

exports.listAssignableUsers = async (requester) => {
  if(requester.role === 'employee'){
    const self = await userRepo.findById(requester.id).select('username email role');
    return [self]
  }

  if(requester.role === 'teamlead') {
    const team = await userRepo.findByReportsTo(requester.id);
    const self = await userRepo.findById(requester.id).select('username email role');
    return [self, ...team]
  }

  return userRepo.findAll();
} 

exports.getUserById = async (requester, targetId) => {
  const visible = await exports.listVisibleUser(requester);
  const found = visible.find((u) => u._id.toString() === targetId);
  if(!found) throw new ApiError(403, 'You do not have access to this user')
  return found
}


async function getTaskStatsForUser(userIds){
   const stats = await Task.aggregate([
    { $match: { assignedTo: { $in: userIds } } },
    { $group: { _id: { user: '$assignedTo', status: '$status' }, count: { $sum: 1 } } },
  ]);

  const map = {}
  userIds.forEach((id) => {
    map[id.toString()] = {pending: 0, inProgress: 0, completed: 0, total: 0}
  });

  stats.forEach((s) => {
    const uid = s._id.user.toString();
    if(!map[uid]) return 
    if(s._id.status === 'pending') map[uid].pending = s.count;
    if(s._id.status === 'in-progress') map[uid].inProgress = s.count
    if(s._id.status === 'completed') map[uid].completed = s.count
    map[uid].total += s.count;
  });

  return map
}


exports.getTeamOverview = async (requester) => {
  let members;

  if(requester.role === 'manager'){
    const all = await userRepo.findAll();
    members = all.filter((u) => u.role !== 'manager');
  } else if(requester.role === 'teamlead'){
    members = await userRepo.findByReportsTo(requester.id);
  } else {
    throw new ApiError(403, 'Employee do not have team view');
  }

  const ids = members.map((m) => m._id)
  const statsMap = await getTaskStatsForUser(ids);

  return members.map((m) => ({
    _id: m._id,
    username: m.username,
    email: m.email,
    role: m.role,
    stats: statsMap[m._id.toString()],
  }))
}


exports.getUsersOverview = async (requester) => {
  if(requester.role !== 'manager'){
    throw new ApiError(403, 'Only a manager can view all users');
  }

  const all = await userRepo.findAll();
  const ids = all.map((u) => u._id);
  const statsMap = await getTaskStatsForUser(ids);

  const reportsCountMap = {};
  all.forEach((u) => {
    if(u.reportsTo){
      const key = u.reportsTo.toString();
      reportsCountMap[key] = (reportsCountMap[key] || 0) + 1;
    }
  });

  return all.map((u) => ({
    _id: u._id,
    username: u.username,
    email: u.email,
    role: u.role,
    stats: statsMap[u._id.toString()],
    reportsCount: reportsCountMap[u._id.toString()] || 0,
  }));
}