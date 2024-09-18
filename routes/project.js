const express = require('express');
const projectController = require('../controllers/projectController');
const fetchUser = require('../middleware/fetchUser');

const router = express.Router();

router.post('/addProject',projectController.addProject);
router.get('/getAllProjects',projectController.getAllProjects);
router.post('/addPerformance',projectController.addPerformance);
router.get('/getPerformance',projectController.getPerformanceByProjectID);

module.exports = router;