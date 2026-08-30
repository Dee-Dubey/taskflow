const router = require('express').Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const taskController = require('../controllers/task.controller');
const {validateCreateTask, validateUpdateTask, validateObjectIdParam, validateReassign} = require('../validators/task.validator') 

router.use(authenticate); // everything below requires login

router.post('/', validateCreateTask , taskController.createTask);
router.get('/', taskController.getTasks);
router.get('/:id', validateObjectIdParam, taskController.getTaskById);
router.put('/:id', validateObjectIdParam, validateUpdateTask, taskController.updateTask);
router.patch('/:id/reassign', validateObjectIdParam, authorize('manager', 'teamlead'), validateReassign, taskController.reassignTask);
router.delete('/:id', validateObjectIdParam, taskController.deleteTask);

module.exports = router;