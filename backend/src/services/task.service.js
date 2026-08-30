const taskRepo = require('../repositories/task.repository');
const userRepo = require('../repositories/user.repository');
const ApiError = require('../utils/apiError');

async function getScopedUserIds(requester){
  if(requester.role === 'manager') return null

  if(requester.role === 'teamlead') {
    const team = await userRepo.findByReportsTo(requester.id)
    return [requester.id, ...team.map((u) => u._id.toString())]
  }

  return [requester.id]
}

async function canAssignTo(requester, targetUserId){
  if(requester.role === 'manager') return true
  if(requester.role === 'teamlead') {
    if(targetUserId === requester.id) return true
    const team = await userRepo.findByReportsTo(requester.id);
    return team.some((u) => u._id.toString() === targetUserId);
  }

  return targetUserId === requester.id;
}

exports.createTask = async (requester, payload) => {
  const assignedTo = requester.role === 'employee' ? requester.id : payload.assignedTo || requester.id;

  const allowed = await canAssignTo(requester, assignedTo);
  if (!allowed) throw new ApiError(403, 'You cannot assign a task to this user');

  return taskRepo.create({
    title: payload.title,
    description: payload.description || '',
    status: payload.status || 'pending',
    dueDate: payload.dueDate || null,
    createdBy: requester.id,
    assignedTo
  })
}


exports.getTasks = async (requester, filters = {}) => {
  const scopedIds = await getScopedUserIds(requester);
  const query = {};

  if(scopedIds) query.assignedTo = { $in: scopedIds };
  if(filters.status) query.status = filters.status;
  if(filters.assignedTo){
    if(scopedIds && !scopedIds.includes(filters.assignedTo)){
      throw new ApiError(403, 'You cannot view tasks for this user');
    }

    query.assignedTo = filters.assignedTo;
  }

  return taskRepo.find(query)
}


exports.getTaskById = async (requester, id) => {
  const task = await taskRepo.findById(id);
  if(!task) throw new ApiError(404, 'Task not found');

  const scopedIds = await getScopedUserIds(requester)
  if(scopedIds && !scopedIds.includes(task.assignedTo._id.toString())){
    throw new ApiError(403, 'You do not have access to this task');
  }

  return task
}


exports.updateTask = async (requester, id, payload) => {
  const task = await exports.getTaskById(requester, id);
  const updates = {}
  if (payload.title !== undefined) updates.title = payload.title;
  if (payload.description !== undefined) updates.description = payload.description;
  if (payload.status !== undefined) updates.status = payload.status;
  if (payload.dueDate !== undefined) updates.dueDate = payload.dueDate;

  return taskRepo.updateById(task._id, updates)
}

exports.reassignTask = async (requester, id, newAssigneeId) => {
  if(requester.role === 'employee'){
    throw new ApiError(403, 'Employees cannot reassign tasks');
  }

  const task = await exports.getTaskById(requester, id);
  const allowed = await canAssignTo(requester, newAssigneeId);
  if(!allowed) throw new ApiError(403, 'You cannot assign a task to this user');

  return taskRepo.updateById(task._id, { assignedTo: newAssigneeId });
}


exports.deleteTask = async (requester, id) => {
  const task = await exports.getTaskById(requester, id); // reuses access check
  await taskRepo.deleteById(task._id);
  return task;
};

