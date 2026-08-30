const router = require('express').Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const userController = require('../controllers/user.controller');

router.use(authenticate); // everything below requires login

router.get('/', userController.listUsers);
router.get('/assignable', userController.listAssignable);
router.get('/team-overview', authorize('manager', 'teamlead'), userController.getTeamOverview);
router.get('/overview', authorize('manager'), userController.getUsersOverview);

module.exports = router;