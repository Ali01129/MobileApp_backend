const express=require('express');
const fetchUser=require('../middleware/fetchUser');
const adminController = require("../controllers/adminController");
const router=express.Router();

router.get('/getIssues',adminController.getIssues);
router.patch('/disableUserAccount',adminController.disableUserAccount);

module.exports=router;