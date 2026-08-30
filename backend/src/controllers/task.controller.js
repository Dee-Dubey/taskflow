const taskService = require('../services/task.service');

exports.createTask = async (req, res, next) => {
  try {
    const task = await taskService.createTask(req.user, req.body);
    req.app.get('io')?.emit('task:created', task)
    res.status(201).json(task)
  } catch (error) {
    console.log(error)
    next(error)
  }
}

exports.getTasks = async (req, res, next) => {
  try {
    const tasks = await taskService.getTasks(req.user, req.query);
    res.json(tasks)
  } catch (error) {
    next(error)
  }
}

exports.getTaskById = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.user, req.params.id);
    res.json(task);
  } catch (error) {
    next(error);
  }
}

exports.updateTask = async (req, res, next) => {
  try {
    const task = await taskService.updateTask(req.user, req.params.id, req.body);
    req.app.get('io')?.emit('task:updated', task)
    res.json(task)
  } catch (error) {
    next(error)
  }
}


exports.reassignTask = async (req, res, next) => {
  try {
    const task = await taskService.reassignTask(req.user, req.params.id, req.body.assignedTo)
    req.app.get('io')?.emit('task:updated', task);
    res.json(task);
  } catch (error) {
    next(error)
  }
}

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await taskService.deleteTask(req.user, req.params.id);
    req.app.get('io')?.emit('task:deleted', { id: task._id });
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    next(err);
  }
};