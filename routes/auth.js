const express = require('express');
const authController =require('../controllers/authController');
const adminAuthController = require('../controllers/adminAuthController');
const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/admin/register', adminAuthController.adminRegister);
router.post('/admin/login', adminAuthController.adminLogin);

module.exports = router;