const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const {validateRegister, validateLogin} = require('../validators/auth.validator')

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/managers', authController.managers);   // public — needed at registration time
router.get('/teamleads', authController.teamLeads); // public — needed at registration time

module.exports = router;