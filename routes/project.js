const express = require('express');
const projectController = require('../controllers/projectController');

const router = express.Router();

router.post('/addProject',projectController.addProject);
router.get('/getAllProjects',projectController.getAllProjects);

module.exports = router;