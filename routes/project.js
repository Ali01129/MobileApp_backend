const express = require('express');
const projectController = require('../controllers/projectController');
const fetchUser = require('../middleware/fetchUser');

const router = express.Router();

router.post('/addProject',projectController.addProject);
router.get('/getAllProjects',projectController.getAllProjects);
router.post('/addCashFlow',projectController.addCashFlow);
router.post('/getCashFlow',projectController.getCashFlow);

module.exports = router;